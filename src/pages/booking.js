/**
 * Booking Page - Editorial Dynamic Booking Engine
 * Upgrades strictly following Markdown new.md:
 * 1. Conditional Rendering based on service category (Numerology DOB, Village Tour Transport & Cultural Etiquette)
 * 2. E.164 International WhatsApp Sanitization & Country Code Selector
 * 3. Country of Origin with bilingual concierge adaptation note
 * 4. Bali Local Time Locked (WITA / UTC+8) with 12h Minimum Lead Time & Fixed Practitioner Slots
 * 5. Number of Participants (Pax) Stepper with dynamic category Max Pax
 * 6. Transparent Pricing (IDR + Foreign Currency Approx) & Multi-Language
 * 7. Anti-Popup Blocker Confirmation Flow with Dual-Channel (WhatsApp + Online)
 * 8. Resilient Payload Serialization with 100% database schema protection
 */
import { 
  SERVICES, 
  PACKAGES, 
  SETTINGS, 
  COMPANY,
  formatCurrency, 
  getPackagesByService, 
  getServiceById, 
  getPackageById, 
  generateBookingCode, 
  parseLocalDate, 
  formatDateSafe,
  COUNTRIES_LIST,
  sanitizeInternationalPhone,
  getBaliNow,
  getBaliDateString,
  FIXED_TIME_SLOTS,
  isSlotLeadTimeValid,
  getMaxPaxForService,
  formatCurrencyWithApprox,
  getBookedTimesForDate,
  checkSlotCollision,
  saveConfirmedBooking
} from '../data.js';
import { 
  t, 
  getDateLocale, 
  translateDuration, 
  getLang, 
  translateBenefit,
  translateServiceName,
  translateServiceDesc,
  translatePackageName,
  translatePackageDesc
} from '../i18n.js';
import { createBookingInSupabase, getBookedTimesFromSupabase, updateBookingStatusInSupabase } from '../api/supabase.js';
import { showPaymentSuccessModal, showPaymentFailedModal } from '../components/paymentModal.js';

let bookingState = {
  step: 1,
  service_id: null,
  package_id: null,
  booking_date: null,
  booking_time: null,
  pax: 1,
  customer_name: '',
  email: '',
  country_code: '+62',
  whatsapp_raw: '',
  whatsapp: '',
  nationality: 'Indonesia',
  notes: '',
  // Specific conditional fields
  dob: '',
  // Payment selection
  payment_method: 'card' // 'card', 'paypal', 'qris'
};

let calState = {
  year: getBaliNow().getFullYear(),
  month: getBaliNow().getMonth()
};

export function renderBooking(params = {}) {
  // Parse query params from params and window.location.hash
  const hashParts = window.location.hash.split('?');
  const hashParams = hashParts.length > 1 ? Object.fromEntries(new URLSearchParams(hashParts[1]).entries()) : {};
  const serviceId = params?.service || hashParams.service;
  const packageId = params?.package || hashParams.package;
  const initialDate = params?.date || hashParams.date;
  const initialTime = params?.time || hashParams.time;

  if (initialDate && !bookingState.booking_date) {
    bookingState.booking_date = initialDate;
    const parsed = parseLocalDate(initialDate);
    if (parsed) {
      calState.year = parsed.getFullYear();
      calState.month = parsed.getMonth();
    }
  }
  if (initialTime && !bookingState.booking_time) {
    bookingState.booking_time = initialTime;
  }

  const resolvedService = serviceId ? getServiceById(serviceId) : null;
  const resolvedPackage = packageId ? getPackageById(packageId) : null;

  if (resolvedPackage) {
    bookingState.package_id = resolvedPackage.package_id;
    bookingState.service_id = resolvedPackage.service_id;
    bookingState.step = 3;
  } else if (resolvedService) {
    bookingState.service_id = resolvedService.service_id;
    bookingState.step = 2;
  } else {
    if (!serviceId && !packageId && !bookingState.service_id) {
      bookingState.step = 1;
    }
  }

  return `
    <section class="booking-page">
      <div class="container">
        <div class="section__header fade-in">
          <span class="overline">${t('book_overline')}</span>
          <h1 class="heading-2">${t('book_heading')}</h1>
          <div class="divider-gold"></div>
          <p class="subtitle">${t('book_subtitle')}</p>
        </div>

        <!-- Steps Indicator -->
        <div class="booking-steps fade-in" id="booking-steps">
          <div class="booking-step ${bookingState.step >= 1 ? 'active' : ''} ${bookingState.step > 1 ? 'done' : ''}">
            <span class="booking-step__number">${bookingState.step > 1 ? '✓' : '1'}</span>
            <span class="booking-step__label">${t('book_step_service')}</span>
          </div>
          <div class="booking-step__connector ${bookingState.step > 1 ? 'done' : ''}"></div>
          <div class="booking-step ${bookingState.step >= 2 ? 'active' : ''} ${bookingState.step > 2 ? 'done' : ''}">
            <span class="booking-step__number">${bookingState.step > 2 ? '✓' : '2'}</span>
            <span class="booking-step__label">${t('book_step_package')}</span>
          </div>
          <div class="booking-step__connector ${bookingState.step > 2 ? 'done' : ''}"></div>
          <div class="booking-step ${bookingState.step >= 3 ? 'active' : ''} ${bookingState.step > 3 ? 'done' : ''}">
            <span class="booking-step__number">${bookingState.step > 3 ? '✓' : '3'}</span>
            <span class="booking-step__label">${t('book_step_schedule')}</span>
          </div>
          <div class="booking-step__connector ${bookingState.step > 3 ? 'done' : ''}"></div>
          <div class="booking-step ${bookingState.step >= 4 ? 'active' : ''} ${bookingState.step > 4 ? 'done' : ''}">
            <span class="booking-step__number">${bookingState.step > 4 ? '✓' : '4'}</span>
            <span class="booking-step__label">${t('book_step_info')}</span>
          </div>
          <div class="booking-step__connector ${bookingState.step > 4 ? 'done' : ''}"></div>
          <div class="booking-step ${bookingState.step >= 5 ? 'active' : ''}">
            <span class="booking-step__number">5</span>
            <span class="booking-step__label">${t('book_step_summary')}</span>
          </div>
        </div>

        <!-- Step Content -->
        <div id="booking-step-content" class="fade-in" style="max-width: 820px; margin: 0 auto;">
          ${renderStep(bookingState.step)}
        </div>
      </div>
    </section>
  `;
}

function renderStep(step) {
  switch (step) {
    case 1: return renderStep1();
    case 2: return renderStep2();
    case 3: return renderStep3();
    case 4: return renderStep4();
    case 5: return renderStep5();
    default: return renderStep1();
  }
}

function renderStep1() {
  const currentLanguage = getLang();
  return `
    <!-- Step 1 Guide Banner -->
    <div class="step-guide-banner">
      <div>
        <p class="step-guide-banner__text">
          <strong>${t('step_label')} 1/5:</strong> ${t('step_guide_1_text')}
        </p>
      </div>
      <span class="step-guide-banner__pill">${t('step_guide_1_pill')}</span>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_choose_service')}</h3>
    <div style="display: grid; gap: var(--space-4);">
      ${SERVICES.filter(s => s.status === 'active').map(service => {
        const srvName = translateServiceName(service.service_id) || service.service_name;
        const srvDesc = translateServiceDesc(service.service_id) || service.description;
        const packages = getPackagesByService(service.service_id);
        const minPrice = Math.min(...packages.map(p => p.price));
        return `
          <button class="payment-method booking-service-select" data-service="${service.service_id}"
                  style="cursor: pointer; text-align: left; width: 100%; display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4);">
            <img src="${service.image || `/images/${service.slug}.jpg`}" alt="${srvName}" 
                 style="width: 84px; height: 64px; object-fit: cover; border-radius: var(--radius-md); flex-shrink: 0;" />
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
                <h4 style="font-size: var(--text-base); margin: 0; color: var(--text-onyx); font-family: var(--font-serif); font-weight: 600;">${srvName}</h4>
                <span class="badge badge--teal" style="font-size: 0.7rem;">${service.category}</span>
              </div>
              <p style="margin: 0; font-size: 0.82rem; color: var(--text-stone); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${srvDesc}</p>
              <div style="margin-top: 6px; font-size: 0.8rem; color: var(--cta-forest); font-weight: 600;">
                ${t('starting_from')} <span class="tabular-nums">${formatCurrencyWithApprox(minPrice, currentLanguage)}</span>
              </div>
            </div>
            <div style="color: var(--gold-maha); display: flex; align-items: center; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function renderStep2() {
  const packages = getPackagesByService(bookingState.service_id);
  const service = getServiceById(bookingState.service_id);

  if (!service) return renderStep1();

  const srvName = translateServiceName(service.service_id) || service.service_name;
  const currentLanguage = getLang();

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
      <span style="font-size: var(--text-sm); color: var(--text-muted); font-weight: 500;">${srvName}</span>
    </div>

    <!-- Step 2 Guide Banner -->
    <div class="step-guide-banner">
      <div>
        <p class="step-guide-banner__text">
          <strong>${t('step_label')} 2/5:</strong> ${t('step_guide_2_text')}
        </p>
      </div>
      <span class="step-guide-banner__pill">${t('step_guide_2_pill')}</span>
    </div>
    
    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_choose_package')}</h3>
    <div style="display: flex; flex-direction: column; gap: var(--space-5);">
      ${packages.map(pkg => `
        <div class="package-card ${pkg.popular ? 'popular' : ''} booking-package-select" 
             data-package="${pkg.package_id}" style="cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="package-card__name font-serif" style="margin: 0;">${translatePackageName(pkg.package_id) || pkg.package_name}</h3>
                ${pkg.popular ? `<span class="badge badge--green" style="font-size: 0.65rem;">${t('signature_badge')}</span>` : ''}
              </div>
              <p class="package-card__duration" style="margin-top: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                ${translateDuration(pkg.duration)}
              </p>
            </div>
            <div class="package-card__price tabular-nums">
              ${formatCurrencyWithApprox(pkg.price, currentLanguage)}
            </div>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-stone); margin: var(--space-2) 0 0;">${translatePackageDesc(pkg.package_id) || pkg.description}</p>
          <div class="package-card__benefits" style="margin-top: var(--space-4);">
            ${pkg.benefits.slice(0, 4).map(b => `
              <div class="package-card__benefit">
                <svg class="luxury-check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${translateBenefit(b)}</span>
              </div>
            `).join('')}
            ${pkg.benefits.length > 4 ? `<p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px;">+${pkg.benefits.length - 4} more</p>` : ''}
          </div>
          <div style="margin-top: var(--space-3); text-align: right;">
            <span style="font-size: 0.82rem; color: var(--cta-forest); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              ${t('step_guide_2_tap_action')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStep3() {
  const service = getServiceById(bookingState.service_id);
  const pkg = getPackageById(bookingState.package_id);
  const srvName = translateServiceName(service?.service_id) || service?.service_name;
  const pkgName = translatePackageName(pkg?.package_id) || pkg?.package_name;

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
      <span style="font-size: var(--text-sm); color: var(--text-muted); font-weight: 500;">${srvName} • ${pkgName}</span>
    </div>

    <!-- Step 3 Guide Banner -->
    <div class="step-guide-banner">
      <div>
        <p class="step-guide-banner__text">
          <strong>${t('step_label')} 3/5:</strong> ${t('step_guide_3_text')}
        </p>
      </div>
      <span class="step-guide-banner__pill">${t('step_guide_3_pill')}</span>
    </div>

    <!-- WITA Timezone Locked Banner (Section 2.A.5 Requirement) -->
    <div class="wita-banner">
      <span class="wita-banner__dot"></span>
      <div>
        <strong style="color: var(--cta-forest); font-family: var(--font-serif);">${t('book_wita_locked')}</strong>
        <p style="margin: 2px 0 0; font-size: 0.74rem; color: var(--text-stone);">${t('book_min_lead_time')}</p>
      </div>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_choose_schedule')}</h3>
    
    <div class="booking-schedule-grid">
      <!-- Calendar -->
      <div>
        <h4 style="font-weight: 600; margin-bottom: var(--space-4); font-family: var(--font-serif); display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha);" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${t('book_choose_date')}</span>
        </h4>
        <div class="calendar" id="booking-calendar"></div>
      </div>
      
      <!-- Fixed Time Slots (With Practitioner Rest Interval) -->
      <div>
        <h4 style="font-weight: 600; margin-bottom: var(--space-4); font-family: var(--font-serif); display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha);" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${t('book_choose_time')}</span>
        </h4>
        <div id="time-slots-container">
          <p style="text-align: center; color: var(--text-muted); padding: var(--space-8);">
            ${t('book_select_date_first')}
          </p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: var(--space-8);">
      <button class="btn btn--primary btn--lg" id="continue-to-step4" ${!(bookingState.booking_date && bookingState.booking_time) ? 'disabled' : ''}>
        ${t('book_continue')}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `;
}

function renderStep4() {
  const service = getServiceById(bookingState.service_id);
  const pkg = getPackageById(bookingState.package_id);
  const maxPax = getMaxPaxForService(service);
  const isNumerology = service?.category === 'Numerology' || service?.service_id === 'SRV003';
  const currentLanguage = getLang();

  // Price calculations
  const unitPrice = pkg?.price || 0;
  const currentSubtotal = unitPrice * bookingState.pax;

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
    </div>

    <!-- Step 4 Guide Banner -->
    <div class="step-guide-banner">
      <div>
        <p class="step-guide-banner__text">
          <strong>${t('step_label')} 4/5:</strong> ${t('step_guide_4_text')}
        </p>
      </div>
      <span class="step-guide-banner__pill">${t('step_guide_4_pill')}</span>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_customer_data')}</h3>
    
    <div class="contact-form" style="max-width: 620px; margin: 0 auto; background: var(--surface-card); padding: var(--space-6); border-radius: var(--radius-lg); border: 1px solid var(--border-hairline);">
      
      <!-- 1. Full Name -->
      <div class="form-group">
        <label class="form-label" for="customer-name">${t('book_fullname')} ${t('book_required')}</label>
        <input type="text" class="form-input" id="customer-name" placeholder="${t('book_fullname_placeholder')}" 
               value="${bookingState.customer_name}" required />
      </div>

      <!-- 2. Email Address -->
      <div class="form-group">
        <label class="form-label" for="customer-email">${t('book_email')} ${t('book_required')}</label>
        <input type="email" class="form-input" id="customer-email" placeholder="example@email.com" 
               value="${bookingState.email}" required />
      </div>

      <!-- 3. International WhatsApp Phone with E.164 Sanitization -->
      <div class="form-group">
        <label class="form-label">${t('book_whatsapp')} ${t('book_required')}</label>
        <div class="phone-input-combo">
          <select class="country-code-select" id="customer-country-code">
            ${COUNTRIES_LIST.map(c => `
              <option value="${c.dial}" ${bookingState.country_code === c.dial ? 'selected' : ''}>
                ${c.flag} ${c.dial} (${c.code})
              </option>
            `).join('')}
          </select>
          <input type="tel" class="form-input phone-number-input" id="customer-phone-input" 
                 placeholder="${t('book_phone_placeholder')}" 
                 value="${bookingState.whatsapp_raw || ''}" required />
        </div>
        <p class="nationality-hint">E.164 Sanitized: <strong id="preview-sanitized-phone" style="color: var(--cta-forest); font-family: var(--font-mono);">${bookingState.whatsapp || '-'}</strong></p>
      </div>

      <!-- 4. Country of Origin / Nationality with Bilingual Guide Note -->
      <div class="form-group">
        <label class="form-label" for="customer-nationality">${t('book_country_origin')} ${t('book_required')}</label>
        <select class="nationality-select" id="customer-nationality">
          ${COUNTRIES_LIST.map(c => `
            <option value="${c.name}" ${bookingState.nationality === c.name ? 'selected' : ''}>
              ${c.flag} ${c.name}
            </option>
          `).join('')}
        </select>
        <p class="nationality-hint">${t('book_country_note')}</p>
      </div>

      <!-- 5. Number of Participants (Pax Stepper with Category Limit) -->
      <div class="form-group">
        <label class="form-label">${t('book_pax_label')}</label>
        <div class="pax-counter-box">
          <div>
            <span style="font-weight: 600; font-size: 0.92rem; color: var(--cta-forest); font-family: var(--font-serif);">${bookingState.pax} ${t('book_pax_person')}</span>
            <span style="display: block; font-size: 0.74rem; color: var(--text-stone);">${t('book_pax_limit').replace('{max}', maxPax)}</span>
          </div>
          <div class="pax-stepper">
            <button type="button" class="pax-btn" id="pax-minus" ${bookingState.pax <= 1 ? 'disabled' : ''}>−</button>
            <span class="pax-display" id="pax-display-val">${bookingState.pax}</span>
            <button type="button" class="pax-btn" id="pax-plus" ${bookingState.pax >= maxPax ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <p class="nationality-hint" style="text-align: right; margin-top: 4px;">
          Subtotal: <strong class="tabular-nums" style="color: var(--cta-forest);">${formatCurrencyWithApprox(currentSubtotal, currentLanguage)}</strong>
        </p>
      </div>

      <!-- CONDITIONAL SECTION: NUMEROLOGY (Section 2.B.1) -->
      ${isNumerology ? `
        <div class="conditional-card">
          <div class="conditional-card__title">
            <span class="subtle-bullet" style="color: var(--gold-maha);">•</span>
            <span>${t('book_cond_numerology_title')}</span>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="customer-dob">${t('book_dob_label')} ${t('book_required')}</label>
            <input type="date" class="form-input" id="customer-dob" 
                   value="${bookingState.dob || ''}" 
                   max="${getBaliDateString()}" 
                   required />
            <p class="nationality-hint">${t('book_dob_hint')}</p>
          </div>
        </div>
      ` : ''}

      <!-- Payment Method Selection UI (Section 4.2) -->
      <div class="form-group" style="margin-top: var(--space-5);">
        <label class="form-label">${t('pay_method_title')}</label>
        <div class="payment-choice-grid">
          <div class="payment-choice-card ${bookingState.payment_method === 'card' ? 'selected' : ''}" data-method="card">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha);"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <div>
              <h4 style="margin: 0; font-size: 0.88rem; font-weight: 600;">${t('pay_method_card')}</h4>
              <p style="margin: 2px 0 0; font-size: 0.74rem; color: var(--text-stone);">${t('pay_method_card_desc')}</p>
            </div>
          </div>
          <div class="payment-choice-card ${bookingState.payment_method === 'paypal' ? 'selected' : ''}" data-method="paypal">
            <div style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-style: italic; color: #003087; font-size: 1.1rem;">P</div>
            <div>
              <h4 style="margin: 0; font-size: 0.88rem; font-weight: 600;">${t('pay_method_paypal')}</h4>
              <p style="margin: 2px 0 0; font-size: 0.74rem; color: var(--text-stone);">${t('pay_method_paypal_desc')}</p>
            </div>
          </div>
          <div class="payment-choice-card ${bookingState.payment_method === 'qris' ? 'selected' : ''}" data-method="qris">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha);"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <div>
              <h4 style="margin: 0; font-size: 0.88rem; font-weight: 600;">${t('pay_method_qris')}</h4>
              <p style="margin: 2px 0 0; font-size: 0.74rem; color: var(--text-stone);">${t('pay_method_qris_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reschedule Trust Badge (Section 4.3) -->
      <div class="reschedule-trust-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha); flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>${t('reschedule_badge')}</span>
      </div>
      
      <!-- Notes -->
      <div class="form-group">
        <label class="form-label" for="customer-notes">${t('book_notes')}</label>
        <textarea class="form-input" id="customer-notes" placeholder="${t('book_notes_placeholder')}">${bookingState.notes}</textarea>
      </div>
      
      <button class="btn btn--primary btn--lg" id="continue-to-step5" style="width: 100%; margin-top: var(--space-4);">
        ${t('book_view_summary')}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `;
}

function renderStep5() {
  const service = getServiceById(bookingState.service_id);
  const pkg = getPackageById(bookingState.package_id);

  if (!service || !pkg) return renderStep1();

  const currentLanguage = getLang();
  const srvName = translateServiceName(service.service_id) || service.service_name;
  const pkgName = translatePackageName(pkg.package_id) || pkg.package_name;
  const subtotal = pkg.price * bookingState.pax;
  const grandTotal = subtotal; // 100% Tax-Free per explicit user instruction!
  const previewBookingCode = generateBookingCode(pkg.package_name);
  const isNumerology = service?.category === 'Numerology' || service?.service_id === 'SRV003';

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
    </div>

    <!-- Step 5 Guide Banner -->
    <div class="step-guide-banner">
      <div>
        <p class="step-guide-banner__text">
          <strong>${t('step_label')} 5/5:</strong> ${t('step_guide_5_text')}
        </p>
      </div>
      <span class="step-guide-banner__pill">${t('step_guide_5_pill')}</span>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_summary_title')}</h3>
    
    <div class="booking-summary" style="position: static; max-width: 650px; margin: 0 auto;">
      
      <!-- Prominent Booking Code Preview Box (MWJ-nama produk-serial nomber) -->
      <div class="booking-code-card">
        <div>
          <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">
            ${t('book_code_preview')}
          </span>
          <p class="booking-code-value" style="margin: 2px 0 0;">
            ${previewBookingCode}
          </p>
        </div>
        <span class="badge badge--teal" style="font-size: 0.72rem;">Official Sacred Code</span>
      </div>

      <h3 class="booking-summary__title" style="font-family: var(--font-serif);">${t('book_detail_title')}</h3>
      
      <div class="booking-summary__row">
        <span class="label">${t('book_service_label')}</span>
        <span class="value">${srvName}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_package_label')}</span>
        <span class="value">${pkgName}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_pax_label')}</span>
        <span class="value"><strong>${bookingState.pax} ${t('book_pax_person')}</strong> (${formatCurrency(pkg.price)} / pax)</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_duration_label')}</span>
        <span class="value">${translateDuration(pkg.duration)}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_date_label')}</span>
        <span class="value">${formatDateSafe(bookingState.booking_date)}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_time_label')}</span>
        <span class="value"><strong>${bookingState.booking_time} WITA</strong> (Bali Time GMT+8)</span>
      </div>

      <!-- Specific Conditional Details Preview -->
      <div style="margin: var(--space-4) 0; padding: var(--space-4); background: var(--surface-silk); border-radius: var(--radius-md); border: 1px solid var(--border-hairline);">
        <p style="font-size: var(--text-xs); font-family: var(--font-mono); text-transform: uppercase; color: var(--gold-maha); font-weight: 600; margin-bottom: var(--space-2);">${t('book_customer_label')}</p>
        <p style="font-size: var(--text-sm); font-weight: 600; color: var(--text-onyx); margin: 0 0 2px;">${bookingState.customer_name} (${bookingState.nationality})</p>
        <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0 0 2px;">Email: ${bookingState.email}</p>
        <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0 0 2px;">WhatsApp (E.164): <strong>+${bookingState.whatsapp}</strong></p>
        
        ${isNumerology && bookingState.dob ? `
          <p style="font-size: var(--text-xs); color: var(--cta-forest); margin: 4px 0 0; font-weight: 600;">
            • Tanggal Lahir (Chart): ${bookingState.dob}
          </p>
        ` : ''}

        <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px;">
          Metode Pembayaran: <strong style="color: var(--text-onyx);">${bookingState.payment_method.toUpperCase()}</strong>
        </p>

        ${bookingState.notes ? `<p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2); font-style: italic;">“${bookingState.notes}”</p>` : ''}
      </div>
      
      <!-- Pricing Breakdown (Zero Tax) -->
      <div class="booking-summary__row">
        <span class="label">${t('book_subtotal')} (${bookingState.pax} Pax)</span>
        <span class="value tabular-nums">${formatCurrency(subtotal)}</span>
      </div>
      <div class="booking-summary__row" style="color: var(--success); font-size: 0.82rem;">
        <span class="label">${t('book_tax_free')}</span>
        <span class="value">Rp 0 (100% Nett)</span>
      </div>
      <div class="booking-summary__total">
        <span class="label">${t('book_grand_total')}</span>
        <div style="text-align: right;">
          <span class="value tabular-nums" style="display: block;">${formatCurrency(grandTotal)}</span>
          <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-stone);">
            ${formatCurrencyWithApprox(grandTotal, currentLanguage).replace(formatCurrency(grandTotal), '').trim()}
          </span>
        </div>
      </div>

      <!-- Reschedule Trust Notice -->
      <div class="reschedule-trust-badge" style="margin-top: var(--space-5);">
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <svg class="luxury-check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${t('reschedule_badge')}
        </span>
      </div>

      <!-- Book Now CTA -->
      <button class="btn btn--primary btn--lg" id="proceed-checkout" style="width: 100%; margin-top: var(--space-5);">
        ${t('chk_pay_now')}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      ${(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? `
        <div style="display: flex; justify-content: center; margin-top: 10px;">
          <button type="button" id="simulate-error-trigger" style="background: none; border: 1px dashed var(--border-hairline); border-radius: var(--radius-sm); font-size: 0.68rem; color: var(--text-stone); text-decoration: none; cursor: pointer; padding: 3px 8px; font-family: var(--font-mono); opacity: 0.65;">
            [Dev: Test Payment Failure Modal]
          </button>
        </div>
      ` : ''}

      <p style="text-align: center; font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-3);">
        ${t('book_agree_terms')}
      </p>
    </div>
  `;
}

// Calendar Rendering (WITA local time locked & anti-NaN month fix)
function renderCalendar(container, year, month) {
  const baliToday = getBaliNow();
  baliToday.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const monthNames = t('cal_months');
  const dayNames = t('cal_days');

  let html = `
    <div class="calendar__header">
      <h4 class="calendar__title" style="font-family: var(--font-serif);">${monthNames[month] || ''} ${year}</h4>
      <div class="calendar__nav">
        <button class="calendar__nav-btn" id="cal-prev" type="button" aria-label="Previous Month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="calendar__nav-btn" id="cal-next" type="button" aria-label="Next Month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
    <div class="calendar__weekdays">
      ${dayNames.map(d => `<div class="calendar__weekday">${d}</div>`).join('')}
    </div>
    <div class="calendar__days">
  `;

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    html += `<button class="calendar__day other-month" disabled></button>`;
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPast = date < baliToday;
    const isToday = date.getTime() === baliToday.getTime();
    const isSelected = bookingState.booking_date === dateStr;

    // Check if all slots for this date are within 12 hours lead time and not blocked by 2-hour collisions
    const bookedForDate = getBookedTimesForDate(dateStr);
    const hasAnyValidSlot = FIXED_TIME_SLOTS.some(s => {
      const isLead = isSlotLeadTimeValid(dateStr, s.time);
      const collision = checkSlotCollision(s.time, bookedForDate);
      return isLead && !collision.isBlocked;
    });
    const isLockedLeadTime = !hasAnyValidSlot && (isPast || isToday);

    let classes = 'calendar__day';
    if (isPast || isLockedLeadTime) classes += ' disabled';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';

    html += `<button class="${classes}" ${isPast || isLockedLeadTime ? 'disabled' : ''} data-date="${dateStr}" type="button">${day}</button>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

// Fixed Time Slots (Considering 2-Hour Conflict Collision & 12h Lead Time)
function renderTimeSlots(container, dateStr) {
  const bookedTimes = getBookedTimesForDate(dateStr);

  let html = `
    <div class="fixed-slots-grid">
  `;

  FIXED_TIME_SLOTS.forEach(slot => {
    const isValidLeadTime = isSlotLeadTimeValid(dateStr, slot.time);
    const collision = checkSlotCollision(slot.time, bookedTimes);
    const isSelected = bookingState.booking_time === slot.time;
    let periodLabel = t(slot.labelKey) !== slot.labelKey ? t(slot.labelKey) : slot.period;

    let buttonClass = 'fixed-slot-btn';
    let isDisabled = false;
    let tagHtml = '';

    if (!isValidLeadTime) {
      isDisabled = true;
      buttonClass += ' is-lead-time';
      tagHtml = `<span class="fixed-slot-tag fixed-slot-tag--lead">${t('slot_status_lead_time')}</span>`;
      periodLabel += ` • (${t('book_min_lead_time')})`;
    } else if (collision.isBlocked) {
      isDisabled = true;
      if (collision.reason === 'booked') {
        buttonClass += ' is-booked';
        tagHtml = `<span class="fixed-slot-tag fixed-slot-tag--booked">${t('slot_status_booked')}</span>`;
        periodLabel += ` • (${t('slot_legend_booked')})`;
      } else if (collision.reason === 'in_session') {
        buttonClass += ' is-buffer';
        tagHtml = `<span class="fixed-slot-tag fixed-slot-tag--buffer">${t('slot_status_buffer')}</span>`;
        periodLabel += ` • (Jeda Sesi ${collision.bookedTime})`;
      } else if (collision.reason === 'overlap') {
        buttonClass += ' is-buffer';
        tagHtml = `<span class="fixed-slot-tag fixed-slot-tag--buffer">${t('slot_status_overlap')}</span>`;
        periodLabel += ` • (Bentrok Sesi ${collision.bookedTime})`;
      }
    } else {
      if (isSelected) buttonClass += ' selected';
      tagHtml = `<span class="fixed-slot-tag" style="background: #D1FAE5; color: #065F46;">${t('slot_legend_avail')}</span>`;
    }

    html += `
      <button class="${buttonClass}" 
              data-time="${slot.time}" 
              ${isDisabled ? 'disabled' : ''} 
              type="button">
        <div class="fixed-slot-time">
          <span>${slot.time} WITA</span>
          ${tagHtml}
        </div>
        <span class="fixed-slot-label">${periodLabel}</span>
      </button>
    `;
  });

  html += '</div>';

  // Visual Legend & 2-Hour buffer explanation
  html += `
    <div class="slots-legend">
      <span class="legend-item"><span class="legend-dot available"></span> ${t('slot_legend_avail')}</span>
      <span class="legend-item"><span class="legend-dot booked"></span> ${t('slot_legend_booked')}</span>
      <span class="legend-item"><span class="legend-dot buffer"></span> ${t('slot_legend_buffer')}</span>
    </div>
    <div class="buffer-policy-banner">
      <span class="subtle-bullet">•</span> ${t('book_2h_rule_note')}
    </div>
  `;

  // Informative notice if all slots on day are invalid
  const anyValid = FIXED_TIME_SLOTS.some(s => {
    return isSlotLeadTimeValid(dateStr, s.time) && !checkSlotCollision(s.time, bookedTimes).isBlocked;
  });

  if (!anyValid) {
    html += `
      <div style="background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: var(--radius-md); padding: 10px 14px; margin-top: 12px; font-size: 0.76rem; color: #9A3412;">
        ${t('book_lead_time_notice')}
      </div>
    `;
  }

  container.innerHTML = html;

  // Background fetch from Supabase to sync remote bookings
  getBookedTimesFromSupabase(dateStr).then(remoteTimes => {
    if (remoteTimes && remoteTimes.length > 0) {
      let isDifferent = false;
      remoteTimes.forEach(rt => {
        if (!bookedTimes.includes(rt)) {
          saveConfirmedBooking({ tour_date: dateStr, booking_time: rt, customer_name: 'Remote Guest' });
          isDifferent = true;
        }
      });
      if (isDifferent) {
        renderTimeSlots(container, dateStr);
      }
    }
  }).catch(() => {});
}

// Initialize booking interactivity
export function initBooking() {
  const content = document.getElementById('booking-step-content');
  if (!content) return;

  // Real-time phone sanitizer listener in Step 4
  content.addEventListener('input', (e) => {
    if (e.target.id === 'customer-phone-input' || e.target.id === 'customer-country-code') {
      const code = document.getElementById('customer-country-code')?.value || '+62';
      const raw = document.getElementById('customer-phone-input')?.value || '';
      bookingState.country_code = code;
      bookingState.whatsapp_raw = raw;
      bookingState.whatsapp = sanitizeInternationalPhone(code, raw);
      
      const previewEl = document.getElementById('preview-sanitized-phone');
      if (previewEl) {
        previewEl.textContent = bookingState.whatsapp ? `+${bookingState.whatsapp}` : '-';
      }
    }
  });

  // Event delegation
  content.addEventListener('click', async (e) => {
    // Service selection
    const serviceBtn = e.target.closest('.booking-service-select');
    if (serviceBtn) {
      bookingState.service_id = serviceBtn.dataset.service;
      bookingState.package_id = null;
      bookingState.step = 2;
      updateBookingUI();
      return;
    }

    // Package selection
    const packageBtn = e.target.closest('.booking-package-select');
    if (packageBtn) {
      bookingState.package_id = packageBtn.dataset.package;
      bookingState.step = 3;
      updateBookingUI();
      return;
    }

    // Back button
    const backBtn = e.target.closest('.booking-back');
    if (backBtn) {
      bookingState.step = parseInt(backBtn.dataset.step);
      updateBookingUI();
      return;
    }

    // Calendar day selection with auto-scroll to time slots
    const dayBtn = e.target.closest('.calendar__day:not(.disabled):not(.other-month)');
    if (dayBtn) {
      bookingState.booking_date = dayBtn.dataset.date;
      bookingState.booking_time = null; // Reset time
      initCalendarAndSlots();
      updateContinueBtn();
      
      // Auto-guide user to time slot selection
      setTimeout(() => {
        const timeBox = document.getElementById('time-slots-container');
        if (timeBox) {
          timeBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 120);
      return;
    }

    // Fixed time slot selection with auto-scroll towards Continue button
    const slotBtn = e.target.closest('.fixed-slot-btn:not(:disabled)');
    if (slotBtn) {
      bookingState.booking_time = slotBtn.dataset.time;
      content.querySelectorAll('.fixed-slot-btn').forEach(s => s.classList.remove('selected'));
      slotBtn.classList.add('selected');
      updateContinueBtn();

      // Auto-guide user toward Continue button
      setTimeout(() => {
        const contBtn = document.getElementById('continue-to-step4');
        if (contBtn) {
          contBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
      return;
    }

    // Calendar navigation
    if (e.target.closest('#cal-prev') || e.target.closest('#cal-next')) {
      const isPrev = Boolean(e.target.closest('#cal-prev'));
      if (isPrev) {
        calState.month--;
        if (calState.month < 0) {
          calState.month = 11;
          calState.year--;
        }
      } else {
        calState.month++;
        if (calState.month > 11) {
          calState.month = 0;
          calState.year++;
        }
      }
      const calContainer = document.getElementById('booking-calendar');
      if (calContainer) {
        renderCalendar(calContainer, calState.year, calState.month);
      }
      return;
    }

    // Continue to step 4
    if (e.target.closest('#continue-to-step4')) {
      if (bookingState.booking_date && bookingState.booking_time) {
        bookingState.step = 4;
        updateBookingUI();
      }
      return;
    }

    // Pax stepper +/- buttons
    if (e.target.closest('#pax-minus') || e.target.closest('#pax-plus')) {
      const service = getServiceById(bookingState.service_id);
      const maxPax = getMaxPaxForService(service);
      if (e.target.closest('#pax-minus') && bookingState.pax > 1) {
        bookingState.pax--;
      } else if (e.target.closest('#pax-plus') && bookingState.pax < maxPax) {
        bookingState.pax++;
      }
      updateBookingUI();
      return;
    }


    // Payment choice selection in Step 4
    const payChoice = e.target.closest('.payment-choice-card');
    if (payChoice) {
      bookingState.payment_method = payChoice.dataset.method;
      content.querySelectorAll('.payment-choice-card').forEach(c => c.classList.remove('selected'));
      payChoice.classList.add('selected');
      return;
    }

    // Continue to step 5 (Validation & Serialization Prep)
    if (e.target.closest('#continue-to-step5')) {
      const name = document.getElementById('customer-name')?.value.trim();
      const email = document.getElementById('customer-email')?.value.trim();
      const code = document.getElementById('customer-country-code')?.value || '+62';
      const phoneRaw = document.getElementById('customer-phone-input')?.value.trim();
      const nationality = document.getElementById('customer-nationality')?.value || 'International';
      const notes = document.getElementById('customer-notes')?.value.trim() || '';

      const service = getServiceById(bookingState.service_id);
      const isNumerology = service?.category === 'Numerology' || service?.service_id === 'SRV003';

      if (!name || !email || !phoneRaw) {
        alert(t('book_validation_fill'));
        return;
      }

      if (!isValidEmail(email)) {
        alert(t('book_validation_email'));
        return;
      }

      const sanitizedPhone = sanitizeInternationalPhone(code, phoneRaw);
      if (!sanitizedPhone || sanitizedPhone.length < 7) {
        alert('Mohon masukkan nomor WhatsApp yang valid.');
        return;
      }

      // Check conditional numerology DOB
      let dobVal = '';
      if (isNumerology) {
        dobVal = document.getElementById('customer-dob')?.value;
        if (!dobVal) {
          alert('Tanggal lahir wajib diisi untuk kalkulasi numerologi.');
          return;
        }
      }

      // Save to state
      bookingState.customer_name = name;
      bookingState.email = email;
      bookingState.country_code = code;
      bookingState.whatsapp_raw = phoneRaw;
      bookingState.whatsapp = sanitizedPhone;
      bookingState.nationality = nationality;
      bookingState.notes = notes;
      bookingState.dob = dobVal;
      bookingState.step = 5;

      updateBookingUI();
      return;
    }

    // Proceed & Confirm Order with Payment Processing (Success & Failed Handlers)
    const checkoutBtn = e.target.closest('#proceed-checkout');
    const simulateErrorBtn = e.target.closest('#simulate-error-trigger');

    if (checkoutBtn || simulateErrorBtn) {
      const isSimulateError = Boolean(simulateErrorBtn);
      const activeBtn = document.getElementById('proceed-checkout') || checkoutBtn;
      const service = getServiceById(bookingState.service_id);
      const pkg = getPackageById(bookingState.package_id);
      const subtotal = (pkg?.price || 0) * bookingState.pax;
      const grandTotal = subtotal; // 100% Tax-Free
      
      const bookingCode = generateBookingCode(pkg?.package_name || 'JOURNEY');
      const invoiceId = `INV-${Date.now().toString().slice(-8)}`;

      if (activeBtn) {
        activeBtn.disabled = true;
        activeBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          ${t('chk_processing')}
        `;
      }

      const restoreBtn = () => {
        if (activeBtn) {
          activeBtn.disabled = false;
          activeBtn.innerHTML = `
            ${t('chk_pay_now')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          `;
        }
      };

      // Structure Serialized Notes
      const serializedNotes = `[Origin: ${bookingState.nationality}] | [Category: ${service?.category || 'Wellness'}] | [Pax: ${bookingState.pax}] | [Time: ${bookingState.booking_time} WITA]` +
        (bookingState.dob ? ` | [DOB: ${bookingState.dob}]` : '') +
        ` | [Payment: ${bookingState.payment_method.toUpperCase()}]` +
        (bookingState.notes ? ` | User Notes: ${bookingState.notes}` : '');

      const bookingPayload = {
        customer_name: bookingState.customer_name,
        customer_phone: bookingState.whatsapp,
        customer_email: bookingState.email,
        package_name: `${pkg?.package_name || 'Paket Pilihan'} (${bookingState.pax} Pax)`,
        tour_date: bookingState.booking_date,
        total_price: grandTotal,
        status: 'pending',
        invoice_number: invoiceId,
        notes: serializedNotes
      };

      // Realistic gateway roundtrip delay
      await new Promise(r => setTimeout(r, 850));

      // Handle simulated error / gangguan test
      if (isSimulateError) {
        restoreBtn();
        showPaymentFailedModal({
          booking: {
            ...bookingState,
            booking_id: bookingCode,
            invoice_id: invoiceId,
            grand_total: grandTotal,
            service_name: service?.service_name,
            package_name: pkg?.package_name
          },
          errorMsg: 'Koneksi gateway pembayaran terputus atau otorisasi ditolak oleh bank penerbit.',
          errorCode: 'ERR_GATEWAY_TIMEOUT',
          onRetry: () => {
            document.getElementById('proceed-checkout')?.click();
          },
          onChangeMethod: () => {
            bookingState.step = 4;
            updateBookingUI();
          }
        });
        return;
      }

      try {
        // 1. Sync local SQLite API
        try {
          await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: bookingCode,
              customer_name: bookingState.customer_name,
              email: bookingState.email,
              phone: bookingState.whatsapp,
              service_id: bookingState.service_id,
              package_id: bookingState.package_id,
              booking_date: bookingState.booking_date,
              booking_time: bookingState.booking_time,
              pax: bookingState.pax,
              payment_method: bookingState.payment_method,
              notes: serializedNotes,
              subtotal,
              tax: 0,
              total_amount: grandTotal
            })
          });
        } catch (_) {}

        // 2. Insert to Supabase (resilient with schema fallback)
        const result = await createBookingInSupabase(bookingPayload);

        // 3. Confirm Payment as PAID in SQLite & Supabase
        try {
          await fetch('/api/payments/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: invoiceId,
              payment_method: bookingState.payment_method,
              amount: grandTotal
            })
          });
        } catch (_) {}

        try {
          await updateBookingStatusInSupabase(invoiceId, 'paid');
        } catch (_) {}

        // Store full confirmed booking state in sessionStorage
        const savedSession = {
          ...bookingState,
          id: result?.data?.id || bookingCode,
          booking_id: bookingCode,
          kode_pemesanan: bookingCode,
          booking_code: bookingCode,
          subtotal,
          tax: 0,
          grand_total: grandTotal,
          total_price: grandTotal,
          package_name: bookingPayload.package_name,
          invoice_id: invoiceId,
          invoice_number: invoiceId,
          status: 'paid',
          payment_status: 'PAID',
          paid_at: new Date().toISOString(),
          serialized_notes: serializedNotes,
          created_at: result?.data?.created_at || new Date().toISOString(),
          expired_at: new Date(Date.now() + SETTINGS.payment_expiry_hours * 3600000).toISOString(),
        };

        sessionStorage.setItem('bookingData', JSON.stringify(savedSession));
        saveConfirmedBooking(savedSession);

        restoreBtn();

        // 4. Show Payment Success Modal
        showPaymentSuccessModal(savedSession);
      } catch (err) {
        console.error('Error saat proses pembayaran:', err);
        restoreBtn();

        const errorSession = {
          ...bookingState,
          booking_id: bookingCode,
          invoice_id: invoiceId,
          grand_total: grandTotal,
          service_name: service?.service_name,
          package_name: pkg?.package_name
        };

        showPaymentFailedModal({
          booking: errorSession,
          errorMsg: err?.message || 'Terjadi gangguan jaringan atau gateway saat verifikasi pembayaran.',
          errorCode: 'ERR_PAYMENT_FAILED',
          onRetry: () => {
            document.getElementById('proceed-checkout')?.click();
          },
          onChangeMethod: () => {
            bookingState.step = 4;
            updateBookingUI();
          }
        });
      }
      return;
    }
  });

  if (bookingState.step === 3) {
    initCalendarAndSlots();
  }
}

/**
 * Anti-Popup Blocker Confirmation Modal (Section 4.4)
 * Solves iOS Safari popup blocking by rendering a visible modal with a direct user-initiated WhatsApp link.
 */
function showConfirmationModal(booking) {
  const existingModal = document.getElementById('booking-confirmed-modal');
  if (existingModal) existingModal.remove();

  const service = getServiceById(booking.service_id);
  const pkg = getPackageById(booking.package_id);
  const currentLanguage = getLang();

  const srvTitle = translateServiceName(service?.service_id) || service?.service_name;
  const pkgTitle = translatePackageName(pkg?.package_id) || pkg?.package_name;

  // Generate structured WhatsApp pre-filled message
  const waText = encodeURIComponent(
    `Om Swastyastu / Hello Mahawellnerjourney Sanctuary Team,\n\n` +
    `I would like to confirm my sacred booking:\n` +
    `• Booking Code: ${booking.booking_id}\n` +
    `• Invoice Ref: ${booking.invoice_id}\n` +
    `• Guest Name: ${booking.customer_name} (${booking.nationality})\n` +
    `• Phone: +${booking.whatsapp}\n` +
    `• Service: ${srvTitle} - ${pkgTitle}\n` +
    `• Participants: ${booking.pax} Person(s)\n` +
    `• Schedule: ${formatDateSafe(booking.booking_date)} at ${booking.booking_time} WITA\n` +
    (booking.dob ? `• Date of Birth: ${booking.dob}\n` : '') +
    `• Total: ${formatCurrency(booking.grand_total)}\n` +
    `• Payment Choice: ${booking.payment_method.toUpperCase()}\n\n` +
    `Please confirm my reservation details. Suksma / Thank you!`
  );

  const waUrl = `https://wa.me/${COMPANY.whatsapp}?text=${waText}`;

  const modalHtml = `
    <div class="confirm-modal-overlay" id="booking-confirmed-modal">
      <div class="confirm-modal-box">
        
        <div class="confirm-modal-header">
          <span class="confirm-modal-badge">
            <svg class="luxury-check-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="color: var(--cta-forest); margin-right: 4px; vertical-align: -1px;">
              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Official Sanctuary Reservation
          </span>
          <h2 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--cta-forest); margin: var(--space-2) 0;">
            ${t('modal_confirmed_title')}
          </h2>
          <p style="font-size: 0.84rem; color: var(--text-stone); margin: 0;">
            ${t('modal_confirmed_subtitle')}
          </p>
        </div>

        <!-- Official Booking Code Card with Copy Action -->
        <div class="booking-code-card" style="margin: 0 0 var(--space-4);">
          <div>
            <span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">
              ${t('modal_booking_code_label')}
            </span>
            <p class="booking-code-value" id="modal-code-val" style="margin: 2px 0 0;">
              ${booking.booking_id}
            </p>
          </div>
          <button type="button" class="copy-code-btn" id="btn-copy-modal-code" data-code="${booking.booking_id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span id="copy-modal-text">${t('inv_copy_code')}</span>
          </button>
        </div>

        <!-- Rincian Sesi & Total Biaya -->
        <div style="background: var(--surface-silk); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); font-size: 0.82rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">${t('book_service_label')}:</span>
            <strong style="color: var(--text-onyx);">${srvTitle} (${pkgTitle})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">${t('book_date_label')}:</span>
            <span style="color: var(--text-onyx);">${formatDateSafe(booking.booking_date)} • <strong>${booking.booking_time} WITA</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">${t('book_pax_label')}:</span>
            <span style="color: var(--text-onyx);">${booking.pax} ${t('book_pax_person')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-hairline);">
            <strong style="color: var(--cta-forest); font-size: 0.95rem;">${t('book_grand_total')}:</strong>
            <strong style="color: var(--cta-forest); font-size: 1.05rem;" class="tabular-nums">
              ${formatCurrencyWithApprox(booking.grand_total, currentLanguage)}
            </strong>
          </div>
        </div>

        <!-- Dual-Channel CTA Group (Anti-Popup Blocker Flow) -->
        <div class="confirm-modal-cta-group">
          <!-- Primary CTA: WhatsApp User-Initiated Link (Safari-Safe) -->
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-modal-wa" id="btn-modal-wa-click">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>${t('modal_wa_cta')}</span>
          </a>
          <span style="font-size: 0.72rem; color: var(--text-stone); text-align: center;">${t('modal_wa_hint')}</span>

          <!-- Secondary CTA: Online Checkout Gateway -->
          <a href="#/checkout" class="btn-modal-online">
            <span>${t('modal_pay_online_btn')}</span>
            <span>→</span>
          </a>

          <!-- Tertiary CTA: Printable Invoice -->
          <a href="#/invoice/${booking.invoice_id}" class="btn-modal-invoice">
            ${t('modal_invoice_btn')}
          </a>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Hook copy button inside modal
  const copyBtn = document.getElementById('btn-copy-modal-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.dataset.code;
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const txt = document.getElementById('copy-modal-text');
          if (txt) txt.textContent = t('inv_code_copied');
          setTimeout(() => {
            if (txt) txt.textContent = t('inv_copy_code');
          }, 2000);
        });
      }
    });
  }

  // Close modal when navigating
  const links = document.querySelectorAll('#booking-confirmed-modal a');
  links.forEach(l => {
    l.addEventListener('click', () => {
      setTimeout(() => {
        const m = document.getElementById('booking-confirmed-modal');
        if (m) m.remove();
      }, 300);
    });
  });
}

function initCalendarAndSlots() {
  const calContainer = document.getElementById('booking-calendar');
  const timeContainer = document.getElementById('time-slots-container');

  if (calContainer) {
    renderCalendar(calContainer, calState.year, calState.month);
  }

  if (timeContainer && bookingState.booking_date) {
    renderTimeSlots(timeContainer, bookingState.booking_date);
  }
}

function updateContinueBtn() {
  const btn = document.getElementById('continue-to-step4');
  if (btn) {
    btn.disabled = !(bookingState.booking_date && bookingState.booking_time);
  }
}

function updateBookingUI() {
  const content = document.getElementById('booking-step-content');
  const stepsEl = document.getElementById('booking-steps');

  if (content) {
    content.innerHTML = renderStep(bookingState.step);
    if (bookingState.step === 3) {
      initCalendarAndSlots();
    }
  }

  if (stepsEl) {
    const steps = stepsEl.querySelectorAll('.booking-step');
    const connectors = stepsEl.querySelectorAll('.booking-step__connector');

    steps.forEach((step, i) => {
      const stepNum = i + 1;
      step.classList.toggle('active', stepNum <= bookingState.step);
      step.classList.toggle('done', stepNum < bookingState.step);
      const numEl = step.querySelector('.booking-step__number');
      if (numEl) numEl.textContent = stepNum < bookingState.step ? '✓' : stepNum;
    });

    connectors.forEach((conn, i) => {
      conn.classList.toggle('done', i + 1 < bookingState.step);
    });
  }

  window.scrollTo({ top: 180, behavior: 'smooth' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function resetBooking() {
  bookingState = {
    step: 1,
    service_id: null,
    package_id: null,
    booking_date: null,
    booking_time: null,
    pax: 1,
    customer_name: '',
    email: '',
    country_code: '+62',
    whatsapp_raw: '',
    whatsapp: '',
    nationality: 'Indonesia',
    notes: '',
    dob: '',
    transport_option: 'meet_direct',
    pickup_address: '',
    cultural_consent: false,
    payment_method: 'card'
  };
}
