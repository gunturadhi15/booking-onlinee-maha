/**
 * Home Page — Mahawellnerjourney Official Flagship & Direct Booking Engine
 * Aesthetic: Ornate Emblem on a Quiet Sanctuary Canvas
 * Multi-Language: Russian, Spanish, Italian, French, English, Indonesian
 * Multi-Sensory: High-Resolution Visuals, Ambient Video & Audio Proof
 */
import { SERVICES, PACKAGES, COMPANY, SANCTUARY_MEDIA, formatCurrency, getPackagesByService } from '../data.js';
import { 
  t, 
  getLang, 
  getDateLocale, 
  translateDuration, 
  translateBenefit, 
  translateServiceName, 
  translateServiceDesc, 
  translatePackageName, 
  translatePackageDesc 
} from '../i18n.js';

function serviceName(service) {
  return translateServiceName(service.service_id) || service.service_name;
}

function serviceDesc(service) {
  return translateServiceDesc(service.service_id) || service.description;
}

function packageName(pkg) {
  return translatePackageName(pkg.package_id) || pkg.package_name;
}

function packageDesc(pkg) {
  return translatePackageDesc(pkg.package_id) || pkg.description;
}

export function renderHome() {
  const services = SERVICES.filter(s => s.status === 'active').map(service => {
    const packages = getPackagesByService(service.service_id);
    const prices = packages.map(p => p.price);
    const popularPkg = packages.find(p => p.popular) || packages[0];
    return {
      ...service,
      packages,
      popularPkg,
      minPrice: Math.min(...prices),
      durations: [packages[0]?.duration, packages[packages.length - 1]?.duration].filter(Boolean),
    };
  });

  // Calculate default booking date: Tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  return `
    <!-- ==================== SANCTUARY HERO ==================== -->
    <section class="sanctuary-hero" id="hero-section">
      <div class="container sanctuary-hero__inner">
        <div class="sanctuary-hero__content">
          <div class="sanctuary-hero__badge">
            <span class="subtle-bullet"></span>
            <span>${t('hero_badge')}</span>
          </div>

          <h1 class="heading-1 sanctuary-hero__title">
            ${t('hero_title')} <br />
            <em>${t('hero_title_sub')}</em>
          </h1>

          <p class="sanctuary-hero__lead">
            ${t('hero_lead')}
          </p>

          <div class="sanctuary-hero__actions">
            <a href="#/booking" class="btn btn--primary btn--lg" id="hero-book-btn" data-page="booking">
              ${t('hero_btn_book')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#curated-journeys" class="btn btn--secondary btn--lg" id="hero-explore-btn">
              ${t('hero_btn_explore')}
            </a>
          </div>
        </div>

        <!-- Ambient Video & Visual Card -->
        <div class="sanctuary-hero__visual">
          <div class="hero-ambient-container">
            <video class="hero-ambient-video" autoplay muted loop playsinline preload="metadata" poster="/images/sanctuary-ambiance.webp" width="600" height="220">
              <source src="${SANCTUARY_MEDIA.hero_ambient.video_mp4}" type="video/mp4" />
            </video>
            <div class="hero-ambient-overlay">
              <div>
                <p style="font-family: var(--font-serif); font-size: 1.05rem; margin: 0; line-height: 1.4; text-shadow: 0 1px 3px rgba(0,0,0,0.6);">
                  Ubud Sacred Valley Sanctuary
                </p>
                <p style="font-size: 0.75rem; margin: 2px 0 0; opacity: 0.85; font-family: var(--font-mono);">
                  Tri Hita Karana • Calming Sacred Presence
                </p>
              </div>
            </div>
          </div>

          <div class="sanctuary-hero__card" style="margin-top: var(--space-4);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-hairline);">
              <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney Emblem" width="46" height="46" fetchpriority="high" loading="eager" decoding="sync" style="width: 46px; height: 46px; border-radius: 50%; border: 1.5px solid var(--border-gold-subtle);" />
              <div>
                <span class="overline" style="margin: 0; font-size: 0.65rem;">OFFICIAL FLAGSHIP & SANCTUARY DIRECT</span>
                <h3 style="font-size: 1.1rem; margin: 0; color: var(--text-onyx); font-family: var(--font-serif);">Mahawellnerjourney</h3>
              </div>
            </div>

            <div style="background: var(--surface-silk); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); font-size: 0.8rem;">
              <div>
                <span style="display: block; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase;">${t('hero_card_setting')}</span>
                <strong style="color: var(--text-onyx);">Ubud Sanctuary Valley</strong>
              </div>
              <div>
                <span style="display: block; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase;">${t('hero_card_capacity')}</span>
                <strong style="color: var(--text-onyx);">${t('hero_card_capacity_val')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== DIRECT JOURNEY BOOKING BAR ==================== -->
    <div class="booking-bar-wrapper fade-in">
      <form class="booking-bar" id="quick-booking-form">
        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-service">${t('bar_service')}</label>
          <select id="quick-service" class="booking-bar__select">
            ${services.map(s => `
              <option value="${s.service_id}">${serviceName(s)}</option>
            `).join('')}
          </select>
        </div>

        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-date">${t('bar_date')}</label>
          <input type="date" id="quick-date" class="booking-bar__input" value="${defaultDateStr}" min="${new Date().toISOString().split('T')[0]}" />
        </div>

        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-session">${t('bar_session')}</label>
          <select id="quick-session" class="booking-bar__select">
            <option value="09:00">${t('bar_session_morning')}</option>
            <option value="12:00">${t('bar_session_noon')}</option>
            <option value="15:00">${t('bar_session_afternoon')}</option>
          </select>
        </div>

        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-guests">${t('bar_guests')}</label>
          <select id="quick-guests" class="booking-bar__select">
            <option value="1">${t('bar_guest_1')}</option>
            <option value="2" selected>${t('bar_guest_2')}</option>
            <option value="3">${t('bar_guest_3')}</option>
            <option value="4">${t('bar_guest_4')}</option>
          </select>
        </div>

        <button type="submit" class="btn btn--primary booking-bar__btn" id="quick-booking-submit">
          ${t('bar_btn')}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </form>

      <!-- Direct Booking Assurance -->
      <div class="booking-assurance">
        <span><span class="subtle-bullet"></span> ${t('assure_direct')}</span>
        <span><span class="subtle-bullet"></span> ${t('assure_price')}</span>
        <span><span class="subtle-bullet"></span> ${t('assure_confirm')}</span>
      </div>
    </div>

    <!-- Echoing Geometry Section Divider -->
    <div class="section-divider">
      <div class="section-divider__line"></div>
      <span class="section-divider__motif">•</span>
      <div class="section-divider__line"></div>
    </div>

    <!-- ==================== CURATED JOURNEYS SHOWCASE (WITH REAL PHOTOS) ==================== -->
    <section class="container" id="curated-journeys" style="padding-bottom: var(--space-16);">
      <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-10);" class="fade-in">
        <span class="overline">${t('showcase_overline')}</span>
        <h2 class="heading-2">${t('showcase_title')}</h2>
        <p class="subtitle" style="margin: var(--space-3) auto 0;">${t('showcase_desc')}</p>
      </div>

      <div class="journeys-grid">
        ${services.map((s, index) => {
          const isSignature = index === 0;
          const pkg = s.popularPkg;
          return `
            <article class="journey-card ${isSignature ? 'signature' : ''} fade-in" data-service="${s.service_id}">
              ${isSignature ? `<div class="journey-card__badge">${t('signature_badge')}</div>` : ''}

              <!-- Visual Card Photo -->
              <div class="journey-card__media">
                <img src="${s.image}" alt="${serviceName(s)}" class="journey-card__img-photo" width="600" height="340" loading="lazy" decoding="async" />
                <span class="journey-card__tag">${s.category} • ${translateDuration(pkg.duration)}</span>
              </div>

              <h3 class="journey-card__name font-serif">${serviceName(s)}</h3>
              <p class="journey-card__desc">${serviceDesc(s)}</p>

              <ul class="journey-card__inclusions">
                ${pkg.benefits.slice(0, 4).map(b => `
                  <li>
                    <svg class="luxury-check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${translateBenefit(b)}</span>
                  </li>
                `).join('')}
              </ul>

              <div class="journey-card__footer">
                <div class="journey-card__price-row">
                  <span class="journey-card__price-label">${t('starting_from')}</span>
                  <span class="journey-card__price tabular-nums">${formatCurrency(s.minPrice)}</span>
                </div>
                <div class="journey-card__actions-row">
                  <a href="#/layanan/${s.slug}" class="btn btn--secondary btn--sm journey-card__btn-detail">${t('btn_detail')}</a>
                  <a href="#/booking?service=${s.service_id}&package=${pkg.package_id}" class="btn btn--primary btn--sm journey-card__btn-book" data-page="booking">
                    ${t('btn_select_journey')}
                  </a>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>

    <!-- ==================== SANCTUARY IN MOTION (PHOTO & VIDEO REEL) ==================== -->
    <section style="background: var(--surface-silk); padding: var(--space-16) 0; border-top: 1px solid var(--border-hairline); border-bottom: 1px solid var(--border-hairline);" id="sanctuary-motion">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-8);" class="fade-in">
          <span class="overline">${t('video_section_overline')}</span>
          <h2 class="heading-2">${t('video_section_title')}</h2>
          <p class="subtitle" style="margin: var(--space-3) auto 0;">${t('video_section_desc')}</p>
        </div>

        <div class="sanctuary-motion-grid">
          ${SANCTUARY_MEDIA.gallery.map(item => `
            <a href="#/layanan/${item.slug}" class="motion-card fade-in">
              <div class="motion-card__media">
                <img src="${item.image}" alt="${item.title}" class="motion-card__img" width="400" height="225" loading="lazy" decoding="async" />
                <div class="motion-card__play-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6 3 20 12 6 21 6 3"/>
                  </svg>
                </div>
              </div>
              <div class="motion-card__body">
                <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-maha); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                  ${item.tag}
                </span>
                <h4 style="font-family: var(--font-serif); font-size: 1.05rem; margin: 0 0 6px; color: var(--text-onyx);">${item.title}</h4>
                <p style="font-size: 0.82rem; color: var(--text-stone); line-height: 1.5; margin: 0;">${item.quote}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ==================== SANCTUARY PHILOSOPHY & EXPERIENCE ==================== -->
    <section style="background: var(--canvas); padding: var(--space-16) 0;">
      <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-10); align-items: center;">
        <div class="fade-in-left">
          <span class="overline">${t('phil_overline')}</span>
          <h2 class="heading-2" style="margin-bottom: var(--space-4);">${t('phil_title')}</h2>
          <p style="color: var(--text-stone); line-height: 1.7; margin-bottom: var(--space-6); font-size: 0.98rem;">
            ${t('phil_desc')}
          </p>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span class="subtle-bullet" style="margin-top: 8px;"></span>
              <div>
                <h4 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${t('phil_point_1_title')}</h4>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${t('phil_point_1_desc')}</p>
              </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span class="subtle-bullet" style="margin-top: 8px;"></span>
              <div>
                <h4 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${t('phil_point_2_title')}</h4>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${t('phil_point_2_desc')}</p>
              </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span class="subtle-bullet" style="margin-top: 8px;"></span>
              <div>
                <h4 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${t('phil_point_3_title')}</h4>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${t('phil_point_3_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="fade-in-right" style="background: var(--surface-card); padding: var(--space-8); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="text-align: center; margin-bottom: var(--space-6);">
            <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney" width="72" height="72" loading="lazy" decoding="async" style="width: 72px; height: 72px; border-radius: 50%; margin: 0 auto var(--space-3); display: block;" />
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0; color: var(--text-onyx);">MAHAWELLNERJOURNEY</h3>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--gold-maha); letter-spacing: 0.12em; text-transform: uppercase;">Direct Wellness Sanctuary</span>
          </div>

          <div style="border-top: 1px solid var(--border-hairline); padding-top: var(--space-4); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); font-size: 0.84rem;">
            <div>
              <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; display: block;">${t('svc_location')}</span>
              <strong>Desa Adat Bindu, Ubud</strong>
              <p style="color: var(--text-stone); margin: 2px 0 0;">Gianyar, Bali 80571</p>
            </div>
            <div>
              <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; display: block;">${t('svc_hours')}</span>
              <strong>09:00 - 17:00 WITA</strong>
              <p style="color: var(--text-stone); margin: 2px 0 0;">Respon Concierge 24 Jam</p>
            </div>
          </div>

          <div style="margin-top: var(--space-6); text-align: center;">
            <a href="#/tentang-kami" class="btn btn--secondary" style="width: 100%;" data-page="about">
              ${t('nav_about')} →
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 3-STEP EFFORTLESS BOOKING FLOW ==================== -->
    <section class="container" style="padding: var(--space-16) 0;">
      <div style="text-align: center; max-width: 640px; margin: 0 auto var(--space-10);" class="fade-in">
        <span class="overline">${t('flow_overline')}</span>
        <h2 class="heading-2">${t('flow_title')}</h2>
        <p class="subtitle" style="margin: var(--space-3) auto 0;">${t('flow_desc')}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6);">
        <div class="fade-in" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-maha); font-weight: 700; margin-bottom: var(--space-2);">STEP 01</div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('step_1_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${t('step_1_desc')}</p>
        </div>

        <div class="fade-in" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-maha); font-weight: 700; margin-bottom: var(--space-2);">STEP 02</div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('step_2_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${t('step_2_desc')}</p>
        </div>

        <div class="fade-in" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-maha); font-weight: 700; margin-bottom: var(--space-2);">STEP 03</div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('step_3_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${t('step_3_desc')}</p>
        </div>
      </div>
    </section>

    <!-- ==================== TRANSPARENT RATES CATALOG (DUAL DESKTOP / MOBILE RESPONSIVE) ==================== -->
    <section id="price-table" style="background: var(--surface-silk); padding: var(--space-16) 0; border-top: 1px solid var(--border-hairline);">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-10);" class="fade-in">
          <span class="overline">${t('price_overline')}</span>
          <h2 class="heading-2">${t('price_title')}</h2>
          <p class="subtitle" style="margin: var(--space-3) auto 0;">${t('price_desc')}</p>
        </div>

        <!-- 1. Desktop Catalog View (Clean Table) -->
        <div class="price-catalog-desktop fade-in" style="overflow-x: auto; background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);">
          <table style="width: 100%; min-width: 680px; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 1.5px solid var(--border-hairline); background: #FAF8F4; text-align: left;">
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted);">${t('th_service')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted);">${t('th_duration')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); text-align: right;">${t('th_price')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); text-align: right;">${t('th_total')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); text-align: center;">${t('th_action')}</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(s => `
                <tr style="background: var(--surface-silk); border-bottom: 1px solid var(--border-hairline);">
                  <td colspan="5" style="padding: 10px 18px; font-family: var(--font-serif); font-weight: 700; color: var(--text-onyx); font-size: 0.98rem;">
                    • ${serviceName(s)}
                  </td>
                </tr>
                ${s.packages.map(p => `
                  <tr style="border-bottom: 1px solid var(--border-hairline);">
                    <td style="padding: 12px 18px;">
                      <strong style="color: var(--text-onyx);">${packageName(p)}</strong>
                      ${p.popular ? `<span style="margin-left: 8px; font-family: var(--font-mono); font-size: 0.65rem; background: var(--cta-forest); color: white; padding: 2px 6px; border-radius: 3px;">POPULAR</span>` : ''}
                      <p style="font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0;">${packageDesc(p)}</p>
                    </td>
                    <td style="padding: 12px 18px; font-size: 0.85rem; color: var(--text-stone);">${translateDuration(p.duration)}</td>
                    <td style="padding: 12px 18px; text-align: right; font-weight: 500;" class="tabular-nums">${formatCurrency(p.price)}</td>
                    <td style="padding: 12px 18px; text-align: right; font-weight: 700; color: var(--cta-forest);" class="tabular-nums">${formatCurrency(p.price)}</td>
                    <td style="padding: 12px 18px; text-align: center;">
                      <a href="#/booking?service=${s.service_id}&package=${p.package_id}" class="btn btn--primary btn--sm" data-page="booking">${t('svc_book_package')}</a>
                    </td>
                  </tr>
                `).join('')}
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 2. Mobile Responsive Catalog View (Zero Horizontal Cutoffs on Phones) -->
        <div class="price-catalog-mobile fade-in">
          ${services.map(s => `
            <div class="catalog-mobile-group">
              <div class="catalog-mobile-header">
                <span class="subtle-bullet"></span>
                <span>${serviceName(s)}</span>
              </div>
              <div class="catalog-mobile-body">
                ${s.packages.map(p => `
                  <div class="catalog-mobile-card">
                    <div class="catalog-mobile-card__top">
                      <h4 class="catalog-mobile-card__title">${packageName(p)}</h4>
                      ${p.popular ? `<span class="catalog-mobile-card__badge">POPULAR</span>` : ''}
                    </div>
                    <p class="catalog-mobile-card__desc">${packageDesc(p)}</p>
                    <div class="catalog-mobile-card__meta">
                      <span class="catalog-mobile-card__duration">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        ${translateDuration(p.duration)}
                      </span>
                      <span class="catalog-mobile-card__price tabular-nums">
                        ${formatCurrency(p.price)}
                      </span>
                    </div>
                    <a href="#/booking?service=${s.service_id}&package=${p.package_id}" class="btn btn--primary catalog-mobile-card__cta" data-page="booking">
                      ${t('svc_book_package')}
                    </a>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </section>

    <!-- ==================== FINAL CALM CALL TO ACTION ==================== -->
    <section class="container" style="padding: var(--space-16) 0;">
      <div class="fade-in" style="background: var(--surface-card); border: 1.5px solid var(--border-gold-subtle); border-radius: var(--radius-lg); padding: var(--space-12) var(--space-8); text-align: center; box-shadow: var(--shadow-sm);">
        <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney" width="58" height="58" loading="lazy" decoding="async" style="width: 58px; height: 58px; border-radius: 50%; margin: 0 auto var(--space-4); display: block;" />
        <h2 class="heading-2" style="margin-bottom: var(--space-3);">${t('cta_title')}</h2>
        <p class="subtitle" style="margin: 0 auto var(--space-8);">${t('cta_desc')}</p>

        <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
          <a href="#/booking" class="btn btn--primary btn--lg" data-page="booking" id="cta-book-btn">
            ${t('cta_btn')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="https://wa.me/${(COMPANY.contact?.whatsapp || '6281234567890').replace(/\D/g, '')}" target="_blank" rel="noopener" class="btn btn--secondary btn--lg" id="cta-wa-btn">
            ${t('cta_wa')}
          </a>
        </div>
      </div>
    </section>
  `;
}

// Web Audio Ambient Synthesizer for meditative calm (zero external failure)
let audioCtx = null;
let ambientInterval = null;
let isAudioPlaying = false;

function playSingingBowlTone() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // 432 Hz healing harmonic frequency
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, audioCtx.currentTime);

    // Warm bowl shimmer
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 4.0);
  } catch (err) {
    console.log('Audio ambient note skipped:', err);
  }
}

export function initHomeEffects() {
  // Hook up Quick Booking Form submission
  const quickForm = document.getElementById('quick-booking-form');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const serviceId = document.getElementById('quick-service')?.value;
      const dateVal = document.getElementById('quick-date')?.value;
      const sessionVal = document.getElementById('quick-session')?.value;
      const guestsVal = document.getElementById('quick-guests')?.value;

      // Navigate to booking page with parameters
      window.location.hash = `/booking?service=${serviceId || ''}&date=${dateVal || ''}&time=${sessionVal || ''}&guests=${guestsVal || '1'}`;
    });
  }

  // Smooth scroll for explore button
  const exploreBtn = document.getElementById('hero-explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('curated-journeys')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Ambient sound toggle button in Hero
  const soundBtn = document.getElementById('ambient-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const soundLabel = document.getElementById('sound-label');
      const soundIcon = document.getElementById('sound-icon');

      if (!isAudioPlaying) {
        isAudioPlaying = true;
        playSingingBowlTone();
        ambientInterval = setInterval(playSingingBowlTone, 5000);
        if (soundLabel) soundLabel.textContent = t('video_pause_ambient');
        if (soundIcon) soundIcon.textContent = '🔊';
        soundBtn.style.background = 'var(--cta-forest)';
        soundBtn.style.borderColor = 'var(--gold-maha)';
      } else {
        isAudioPlaying = false;
        clearInterval(ambientInterval);
        if (soundLabel) soundLabel.textContent = t('video_play_ambient');
        if (soundIcon) soundIcon.textContent = '🔈';
        soundBtn.style.background = 'rgba(20,40,29,0.8)';
      }
    });
  }
}
