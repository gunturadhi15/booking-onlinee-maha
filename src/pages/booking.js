/**
 * Booking Page - Multi-step booking form
 */
import { SERVICES, PACKAGES, SETTINGS, formatCurrency, getPackagesByService, getServiceById, getPackageById } from '../data.js';
import { t, getLang, getDateLocale, translateDuration } from '../i18n.js';
import { createBookingInSupabase } from '../api/supabase.js';

let bookingState = {
  step: 1,
  service_id: null,
  package_id: null,
  booking_date: null,
  booking_time: null,
  customer_name: '',
  email: '',
  whatsapp: '',
  notes: '',
};

// Simulated booked slots (in MVP these come from Google Sheets via n8n)
const BOOKED_SLOTS = {
  // 'YYYY-MM-DD': ['HH:MM', ...]
};

export function renderBooking(params = {}) {
  // Parse query params from params and hash
  const hashParts = window.location.hash.split('?');
  const hashParams = hashParts.length > 1 ? Object.fromEntries(new URLSearchParams(hashParts[1]).entries()) : {};
  const serviceId = params?.service || hashParams.service;
  const packageId = params?.package || hashParams.package;

  const resolvedService = serviceId ? getServiceById(serviceId) : null;
  const resolvedPackage = packageId ? getPackageById(packageId) : null;

  if (resolvedPackage) {
    const isNewPackage = bookingState.package_id !== resolvedPackage.package_id;
    bookingState.package_id = resolvedPackage.package_id;
    bookingState.service_id = resolvedPackage.service_id;
    if (isNewPackage) {
      bookingState.booking_date = null;
      bookingState.booking_time = null;
    }
    bookingState.step = 3; // Skip directly to date/time selection
  } else if (resolvedService) {
    const isNewService = bookingState.service_id !== resolvedService.service_id;
    bookingState.service_id = resolvedService.service_id;
    bookingState.package_id = null; // Always reset package so user can pick from this service
    if (isNewService) {
      bookingState.booking_date = null;
      bookingState.booking_time = null;
    }
    bookingState.step = 2; // Show package selection
  } else {
    // Fresh navigation to booking without params
    if (!serviceId && !packageId) {
      bookingState.service_id = null;
      bookingState.package_id = null;
      bookingState.booking_date = null;
      bookingState.booking_time = null;
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
        <div id="booking-step-content" class="fade-in" style="max-width: 800px; margin: 0 auto;">
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
  return `
    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_choose_service')}</h3>
    <div style="display: grid; gap: var(--space-4);">
      ${SERVICES.filter(s => s.status === 'active').map(service => {
    const srvKey = service.service_id.toLowerCase();
    const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;
    const srvDesc = t(`data_${srvKey}_desc`) !== `data_${srvKey}_desc` ? t(`data_${srvKey}_desc`) : service.description;
    return `
        <button class="payment-method booking-service-select" data-service="${service.service_id}"
                style="cursor: pointer; text-align: left; width: 100%;">
          <div class="payment-method__radio"></div>
          <div style="flex: 1;">
            <div class="payment-method__info">
              <h4 style="font-size: var(--text-base);">${srvName}</h4>
              <p style="margin-top: var(--space-1);">${srvDesc.substring(0, 100)}...</p>
            </div>
          </div>
          <span class="badge badge--teal">${service.category}</span>
        </button>
      `}).join('')}
    </div>
  `;
}

function renderStep2() {
  const packages = getPackagesByService(bookingState.service_id);
  const service = getServiceById(bookingState.service_id);

  if (!service) return renderStep1();

  const srvKey = service.service_id.toLowerCase();
  const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
      <span style="font-size: var(--text-sm); color: var(--text-muted);">${srvName}</span>
    </div>
    
    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_choose_package')}</h3>
    <div style="display: flex; flex-direction: column; gap: var(--space-5);">
      ${packages.map(pkg => `
        <div class="package-card ${pkg.popular ? 'popular' : ''} booking-package-select" 
             data-package="${pkg.package_id}" style="cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <h3 class="package-card__name">${pkg.package_name}</h3>
              <p class="package-card__duration">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                ${translateDuration(pkg.duration)}
              </p>
            </div>
            <div class="package-card__price">${formatCurrency(pkg.price)}</div>
          </div>
          <div class="package-card__benefits" style="margin-top: var(--space-4);">
            ${pkg.benefits.slice(0, 4).map(b => `
              <div class="package-card__benefit">${b}</div>
            `).join('')}
            ${pkg.benefits.length > 4 ? `<p style="font-size: var(--text-xs); color: var(--text-muted);">+${pkg.benefits.length - 4} more</p>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStep3() {
  const service = getServiceById(bookingState.service_id);
  const pkg = getPackageById(bookingState.package_id);

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
      <span style="font-size: var(--text-sm); color: var(--text-muted);">${service?.service_name} • ${pkg?.package_name}</span>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_choose_schedule')}</h3>
    
    <div class="booking-schedule-grid">
      <!-- Calendar -->
      <div>
        <h4 style="font-weight: 600; margin-bottom: var(--space-4);">${t('book_choose_date')}</h4>
        <div class="calendar" id="booking-calendar"></div>
      </div>
      
      <!-- Time Slots -->
      <div>
        <h4 style="font-weight: 600; margin-bottom: var(--space-4);">${t('book_choose_time')}</h4>
        <div id="time-slots-container">
          <p style="text-align: center; color: var(--text-muted); padding: var(--space-8);">
            ${t('book_select_date_first')}
          </p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: var(--space-8);">
      <button class="btn btn--primary btn--lg" id="continue-to-step4" disabled>
        ${t('book_continue')}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `;
}

function renderStep4() {
  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_customer_data')}</h3>
    
    <div class="contact-form" style="max-width: 550px; margin: 0 auto;">
      <div class="form-group">
        <label class="form-label" for="customer-name">${t('book_fullname')} ${t('book_required')}</label>
        <input type="text" class="form-input" id="customer-name" placeholder="${t('book_fullname_placeholder')}" 
               value="${bookingState.customer_name}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="customer-email">${t('book_email')} ${t('book_required')}</label>
        <input type="email" class="form-input" id="customer-email" placeholder="email@example.com" 
               value="${bookingState.email}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="customer-whatsapp">${t('book_whatsapp')} ${t('book_required')}</label>
        <input type="tel" class="form-input" id="customer-whatsapp" placeholder="08xxxxxxxxxx" 
               value="${bookingState.whatsapp}" required />
      </div>
      
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

  const subtotal = pkg.price;
  const tax = Math.round(subtotal * SETTINGS.tax_rate);
  const grandTotal = subtotal + tax;

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
      <button class="btn btn--sm btn--secondary booking-back" data-step="4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${t('book_back')}
      </button>
    </div>

    <h3 class="heading-3" style="margin-bottom: var(--space-6); text-align: center;">${t('book_summary_title')}</h3>
    
    <div class="booking-summary" style="position: static; max-width: 600px; margin: 0 auto;">
      <h3 class="booking-summary__title">${t('book_detail_title')}</h3>
      
      <div class="booking-summary__row">
        <span class="label">${t('book_service_label')}</span>
        <span class="value">${service.service_name}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_package_label')}</span>
        <span class="value">${pkg.package_name}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_duration_label')}</span>
        <span class="value">${translateDuration(pkg.duration)}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_date_label')}</span>
        <span class="value">${formatDate(bookingState.booking_date)}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_time_label')}</span>
        <span class="value">${bookingState.booking_time}</span>
      </div>
      
      <div style="margin: var(--space-5) 0; padding: var(--space-4); background: var(--cream-100); border-radius: var(--radius-lg);">
        <p style="font-size: var(--text-sm); font-weight: 600; margin-bottom: var(--space-2);">${t('book_customer_label')}</p>
        <p style="font-size: var(--text-sm); color: var(--text-secondary);">${bookingState.customer_name}</p>
        <p style="font-size: var(--text-sm); color: var(--text-secondary);">${bookingState.email}</p>
        <p style="font-size: var(--text-sm); color: var(--text-secondary);">${bookingState.whatsapp}</p>
        ${bookingState.notes ? `<p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-2);"><em>${bookingState.notes}</em></p>` : ''}
      </div>
      
      <div class="booking-summary__row">
        <span class="label">${t('book_subtotal')}</span>
        <span class="value">${formatCurrency(subtotal)}</span>
      </div>
      <div class="booking-summary__row">
        <span class="label">${t('book_tax')} (${SETTINGS.tax_rate * 100}%)</span>
        <span class="value">${formatCurrency(tax)}</span>
      </div>
      <div class="booking-summary__total">
        <span class="label">${t('book_grand_total')}</span>
        <span class="value">${formatCurrency(grandTotal)}</span>
      </div>

      <button class="btn btn--primary btn--lg" id="proceed-checkout" style="width: 100%; margin-top: var(--space-6);">
        ${t('book_proceed_checkout')}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      <p style="text-align: center; font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-4);">
        ${t('book_agree_terms')}
      </p>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString(getDateLocale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Calendar Rendering
function renderCalendar(container, year, month) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const monthNames = t('cal_months');
  const dayNames = t('cal_days');

  let html = `
    <div class="calendar__header">
      <h4 class="calendar__title">${monthNames[month]} ${year}</h4>
      <div class="calendar__nav">
        <button class="calendar__nav-btn" id="cal-prev">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="calendar__nav-btn" id="cal-next">
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
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isSelected = bookingState.booking_date === dateStr;

    let classes = 'calendar__day';
    if (isPast) classes += ' disabled';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';

    html += `<button class="${classes}" ${isPast ? 'disabled' : ''} data-date="${dateStr}">${day}</button>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

// Time Slots Rendering
function renderTimeSlots(container, dateStr) {
  const slots = generateTimeSlots();
  const bookedSlots = BOOKED_SLOTS[dateStr] || [];

  let html = '<div class="time-slots">';
  slots.forEach(time => {
    const isBooked = bookedSlots.includes(time);
    const isSelected = bookingState.booking_time === time;
    let classes = 'time-slot';
    if (isBooked) classes += ' booked';
    if (isSelected) classes += ' selected';

    html += `<button class="${classes}" ${isBooked ? 'disabled' : ''} data-time="${time}">${time}</button>`;
  });
  html += '</div>';

  container.innerHTML = html;
}

function generateTimeSlots() {
  const slots = [];
  const [openH, openM] = SETTINGS.opening_time.split(':').map(Number);
  const [closeH, closeM] = SETTINGS.closing_time.split(':').map(Number);

  let h = openH, m = openM;
  while (h < closeH || (h === closeH && m < closeM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += SETTINGS.time_slot_interval;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return slots;
}

// Initialize booking interactivity
export function initBooking() {
  const content = document.getElementById('booking-step-content');
  if (!content) return;

  // Event delegation
  content.addEventListener('click', async (e) => {
    // Service selection
    const serviceBtn = e.target.closest('.booking-service-select');
    if (serviceBtn) {
      bookingState.service_id = serviceBtn.dataset.service;
      bookingState.package_id = null;
      bookingState.booking_date = null;
      bookingState.booking_time = null;
      bookingState.step = 2;
      updateBookingUI();
      return;
    }

    // Package selection
    const packageBtn = e.target.closest('.booking-package-select');
    if (packageBtn) {
      bookingState.package_id = packageBtn.dataset.package;
      bookingState.booking_date = null;
      bookingState.booking_time = null;
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

    // Calendar day
    const dayBtn = e.target.closest('.calendar__day:not(.disabled):not(.other-month)');
    if (dayBtn) {
      bookingState.booking_date = dayBtn.dataset.date;
      bookingState.booking_time = null; // Reset time
      initCalendarAndSlots();
      updateContinueBtn();
      return;
    }

    // Time slot
    const timeBtn = e.target.closest('.time-slot:not(.booked)');
    if (timeBtn) {
      bookingState.booking_time = timeBtn.dataset.time;
      // Update selection UI
      content.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      timeBtn.classList.add('selected');
      updateContinueBtn();
      return;
    }

    // Calendar nav
    if (e.target.closest('#cal-prev') || e.target.closest('#cal-next')) {
      const calContainer = document.getElementById('booking-calendar');
      if (!calContainer) return;
      const dir = e.target.closest('#cal-prev') ? -1 : 1;
      const titleEl = calContainer.querySelector('.calendar__title');
      const monthNames = t('cal_months');
      const parts = titleEl.textContent.split(' ');
      let month = monthNames.indexOf(parts[0]);
      let year = parseInt(parts[1]);
      month += dir;
      if (month < 0) { month = 11; year--; }
      if (month > 11) { month = 0; year++; }
      renderCalendar(calContainer, year, month);
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

    // Continue to step 5
    if (e.target.closest('#continue-to-step5')) {
      const name = document.getElementById('customer-name')?.value.trim();
      const email = document.getElementById('customer-email')?.value.trim();
      const whatsapp = document.getElementById('customer-whatsapp')?.value.trim();
      const notes = document.getElementById('customer-notes')?.value.trim();

      // Validation
      if (!name || !email || !whatsapp) {
        alert(t('book_validation_fill'));
        return;
      }

      if (!isValidEmail(email)) {
        alert(t('book_validation_email'));
        return;
      }

      bookingState.customer_name = name;
      bookingState.email = email;
      bookingState.whatsapp = whatsapp;
      bookingState.notes = notes || '';
      bookingState.step = 5;
      updateBookingUI();
      return;
    }

    // Proceed to checkout
    const checkoutBtn = e.target.closest('#proceed-checkout');
    if (checkoutBtn) {
      const pkg = getPackageById(bookingState.package_id);
      const subtotal = pkg?.price || 0;
      const tax = Math.round(subtotal * SETTINGS.tax_rate);
      const grandTotal = subtotal + tax;
      const bookingId = generateBookingId();
      const invoiceId = generateInvoiceId();

      // Indikator Loading
      checkoutBtn.disabled = true;
      const originalBtnContent = checkoutBtn.innerHTML;
      checkoutBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Menyimpan Pemesanan...
      `;

      // Data payload sesuai skema Supabase bookings
      const bookingPayload = {
        customer_name: bookingState.customer_name,
        customer_phone: bookingState.whatsapp,
        customer_email: bookingState.email,
        package_name: pkg?.package_name || 'Paket Pilihan',
        tour_date: bookingState.booking_date,
        total_price: grandTotal,
        status: 'pending',
        invoice_number: invoiceId
      };

      try {
        // Sync ke local API jika backend lokal aktif
        try {
          fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: bookingState.customer_name,
              email: bookingState.email,
              phone: bookingState.whatsapp,
              service_id: bookingState.service_id,
              package_id: bookingState.package_id,
              booking_date: bookingState.booking_date,
              booking_time: bookingState.booking_time,
              notes: bookingState.notes,
              subtotal,
              tax,
              total_amount: grandTotal
            })
          }).catch(() => {});
        } catch (_) {}

        // Insert ke Supabase
        const result = await createBookingInSupabase(bookingPayload);

        // Simpan data lengkap ke sessionStorage untuk halaman checkout & invoice
        sessionStorage.setItem('bookingData', JSON.stringify({
          ...bookingState,
          id: result.data?.id || bookingId,
          subtotal,
          tax,
          grand_total: grandTotal,
          total_price: grandTotal,
          package_name: bookingPayload.package_name,
          booking_id: bookingId,
          invoice_id: invoiceId,
          invoice_number: invoiceId,
          status: 'pending',
          created_at: result.data?.created_at || new Date().toISOString(),
          expired_at: new Date(Date.now() + SETTINGS.payment_expiry_hours * 3600000).toISOString(),
        }));

        window.location.hash = '/checkout';
      } catch (err) {
        console.error('Error saat proses checkout:', err);
        // Fallback simpan ke session agar flow booking tidak macet
        sessionStorage.setItem('bookingData', JSON.stringify({
          ...bookingState,
          id: bookingId,
          subtotal,
          tax,
          grand_total: grandTotal,
          total_price: grandTotal,
          package_name: bookingPayload.package_name,
          booking_id: bookingId,
          invoice_id: invoiceId,
          invoice_number: invoiceId,
          status: 'pending',
          created_at: new Date().toISOString(),
          expired_at: new Date(Date.now() + SETTINGS.payment_expiry_hours * 3600000).toISOString(),
        }));
        window.location.hash = '/checkout';
      }
      return;
    }
  });

  // Init calendar if on step 3
  if (bookingState.step === 3) {
    initCalendarAndSlots();
  }
}

function initCalendarAndSlots() {
  const calContainer = document.getElementById('booking-calendar');
  const timeContainer = document.getElementById('time-slots-container');

  if (calContainer) {
    const now = new Date();
    renderCalendar(calContainer, now.getFullYear(), now.getMonth());
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
    // Re-render steps indicator
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

  window.scrollTo({ top: 200, behavior: 'smooth' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateBookingId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `BK-${dateStr}-${rand}`;
}

function generateInvoiceId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `INV-${dateStr}-${rand}`;
}

// Reset booking state
export function resetBooking() {
  bookingState = {
    step: 1,
    service_id: null,
    package_id: null,
    booking_date: null,
    booking_time: null,
    customer_name: '',
    email: '',
    whatsapp: '',
    notes: '',
  };
}
