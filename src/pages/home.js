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
  translatePackageDesc,
  translateCategory,
  GALLERY_TRANSLATIONS,
  tPsych,
  getGuestReviews
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
  const currentLang = getLang();
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
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: var(--space-3);">
            <div class="sanctuary-hero__badge" style="margin-bottom: 0;">
              <span class="subtle-bullet"></span>
              <span>${t('hero_badge')}</span>
            </div>
            <span class="hero-trust-pill">
              ${tPsych('hero_rating_badge', currentLang)}
            </span>
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

        <!-- Immersive Cinematic Visual Frame -->
        <div class="sanctuary-hero__visual">
          <div class="hero-ambient-container hero-ambient-container--cinematic">
            <img 
              src="/images/sanctuary-ambiance.webp" 
              srcset="/images/sanctuary-ambiance-sm.webp 400w, /images/sanctuary-ambiance.webp 600w"
              sizes="(max-width: 640px) 360px, (max-width: 1024px) 480px, 560px"
              alt="Ubud Sacred Valley Sanctuary" 
              class="hero-ambient-img" 
              width="600" 
              height="380" 
              fetchpriority="high" 
              loading="eager" 
              decoding="sync"
            />
            <!-- Interactive 432Hz Sound Bowl Button -->
            <button type="button" id="ambient-sound-toggle" class="hero-sound-btn" aria-label="${t('video_play_ambient')}">
              <span id="sound-icon">🔈</span>
              <span id="sound-label">${t('video_play_ambient')}</span>
            </button>

            <!-- Floating Glassmorphic Sanctuary Caption -->
            <div class="hero-ambient-overlay hero-ambient-overlay--glass">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney Emblem" width="38" height="38" style="width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid var(--gold-maha); flex-shrink: 0;" />
                  <div>
                    <p style="font-family: var(--font-serif); font-size: 1rem; margin: 0; line-height: 1.3; color: #FFFFFF; font-weight: 600;">
                      Ubud Sacred Valley Sanctuary
                    </p>
                    <p style="font-size: 0.72rem; margin: 2px 0 0; color: rgba(255,255,255,0.88); font-family: var(--font-mono);">
                      ${tPsych('hero_distance_badge', currentLang)}
                    </p>
                  </div>
                </div>
                <span class="hero-capacity-pill">
                  ${t('hero_card_capacity_val')}
                </span>
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
          const bestForText = tPsych(`best_for_${s.service_id}`, currentLang);
          return `
            <article class="journey-card ${isSignature ? 'signature' : ''} fade-in" data-service="${s.service_id}">
              ${isSignature ? `<div class="journey-card__badge">${t('signature_badge')}</div>` : ''}

              <!-- Visual Card Photo -->
              <div class="journey-card__media">
                <img 
                  src="${s.image}" 
                  srcset="${s.image_sm || s.image.replace('.webp', '-sm.webp')} 400w, ${s.image} 600w"
                  sizes="(max-width: 640px) 340px, (max-width: 1024px) 380px, 420px"
                  alt="${serviceName(s)}" 
                  class="journey-card__img-photo" 
                  width="600" 
                  height="340" 
                  loading="lazy" 
                  decoding="async" 
                />
                <span class="journey-card__tag">${translateCategory(s.category)} • ${translateDuration(pkg.duration)}</span>
              </div>

              <h3 class="journey-card__name font-serif">${serviceName(s)}</h3>

              <!-- Practical Benefit Psychological Pill -->
              <div class="journey-card__best-for">
                <strong>${tPsych('best_for_label', currentLang)}</strong> ${bestForText}
              </div>

              <p class="journey-card__desc journey-card__desc--clamp">${serviceDesc(s)}</p>

              <ul class="journey-card__inclusions">
                ${pkg.benefits.slice(0, 3).map(b => `
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
          ${SANCTUARY_MEDIA.gallery.map(item => {
            const galTrans = GALLERY_TRANSLATIONS[item.id]?.[currentLang] || item;
            return `
            <a href="#/layanan/${item.slug}" class="motion-card fade-in">
              <div class="motion-card__media">
                <img 
                  src="${item.image}" 
                  srcset="${item.image_sm || item.image.replace('.webp', '-sm.webp')} 400w, ${item.image} 600w"
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 380px, 400px"
                  alt="${galTrans.title || item.title}" 
                  class="motion-card__img" 
                  width="400" 
                  height="225" 
                  loading="lazy" 
                  decoding="async" 
                />
                <div class="motion-card__play-badge" aria-label="${t('nav_services')}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <div class="motion-card__body">
                <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-maha); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                  ${galTrans.tag || item.tag}
                </span>
                <h3 style="font-family: var(--font-serif); font-size: 1.05rem; margin: 0 0 6px; color: var(--text-onyx);">${galTrans.title || item.title}</h3>
                <p style="font-size: 0.82rem; color: var(--text-stone); line-height: 1.5; margin: 0;">${galTrans.quote || item.quote}</p>
              </div>
            </a>
          `;
          }).join('')}
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
                <h3 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${t('phil_point_1_title')}</h3>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${t('phil_point_1_desc')}</p>
              </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span class="subtle-bullet" style="margin-top: 8px;"></span>
              <div>
                <h3 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${t('phil_point_2_title')}</h3>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${t('phil_point_2_desc')}</p>
              </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span class="subtle-bullet" style="margin-top: 8px;"></span>
              <div>
                <h3 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${t('phil_point_3_title')}</h3>
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
              <p style="color: var(--text-stone); margin: 2px 0 0;">${t('home_concierge_hours')}</p>
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

    <!-- ==================== VERIFIED INTERNATIONAL GUEST STORIES (SOCIAL PROOF) ==================== -->
    <section style="background: var(--surface-silk); padding: var(--space-16) 0; border-top: 1px solid var(--border-hairline); border-bottom: 1px solid var(--border-hairline);" id="guest-reviews">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-10);" class="fade-in">
          <span class="overline">${tPsych('reviews_overline', currentLang)}</span>
          <h2 class="heading-2">${tPsych('reviews_title', currentLang)}</h2>
          <p class="subtitle" style="margin: var(--space-3) auto 0;">${tPsych('reviews_subtitle', currentLang)}</p>
        </div>

        <div class="guest-reviews-grid">
          ${getGuestReviews(currentLang).map(rev => `
            <article class="guest-review-card fade-in">
              <div class="guest-review-card__top">
                <div class="guest-review-card__stars" aria-label="5 out of 5 stars">★★★★★</div>
                <span class="guest-review-card__verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  ${tPsych('reviews_verified', currentLang)}
                </span>
              </div>
              <p class="guest-review-card__quote">${rev.quote}</p>
              <div class="guest-review-card__author">
                <span class="guest-review-card__flag">${rev.flag}</span>
                <div>
                  <strong class="guest-review-card__name">${rev.name} • ${rev.country}</strong>
                  <span class="guest-review-card__service">${rev.service}</span>
                </div>
              </div>
            </article>
          `).join('')}
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
        <div class="fade-in flow-step-card">
          <div class="flow-step-card__header">
            <div class="flow-step-card__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            </div>
            <span class="flow-step-card__num">STEP 01</span>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('step_1_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${t('step_1_desc')}</p>
        </div>

        <div class="fade-in flow-step-card">
          <div class="flow-step-card__header">
            <div class="flow-step-card__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span class="flow-step-card__num">STEP 02</span>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('step_2_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${t('step_2_desc')}</p>
        </div>

        <div class="fade-in flow-step-card">
          <div class="flow-step-card__header">
            <div class="flow-step-card__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <span class="flow-step-card__num">STEP 03</span>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('step_3_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${t('step_3_desc')}</p>
        </div>
      </div>
    </section>

    <!-- ==================== TRANSPARENT RATES CATALOG (COLLAPSIBLE TO PREVENT TEXT FATIGUE) ==================== -->
    <section id="price-table" style="background: var(--surface-silk); padding: var(--space-12) 0; border-top: 1px solid var(--border-hairline);">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto;" class="fade-in">
          <span class="overline">${t('price_overline')}</span>
          <h2 class="heading-2">${t('price_title')}</h2>
          <p class="subtitle" style="margin: var(--space-3) auto var(--space-6);">${t('price_desc')}</p>
          <button type="button" class="btn btn--secondary btn--lg price-toggle-btn" id="toggle-price-catalog-btn" aria-expanded="false">
            <span id="toggle-price-catalog-text">${tPsych('price_toggle_show', currentLang)}</span>
            <svg id="toggle-price-catalog-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        <div id="price-catalog-drawer" class="price-catalog-drawer" style="display: none; margin-top: var(--space-8);">
          <!-- 1. Desktop Catalog View (Clean Table) -->
          <div class="price-catalog-desktop" style="overflow-x: auto; background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);">
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
                        ${p.popular ? `<span style="margin-left: 8px; font-family: var(--font-mono); font-size: 0.65rem; background: var(--cta-forest); color: white; padding: 2px 6px; border-radius: 3px;">${t('badge_popular')}</span>` : ''}
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
          <div class="price-catalog-mobile">
            ${services.map(s => `
              <div class="catalog-mobile-group">
                <div class="catalog-mobile-header">
                  <span class="subtle-bullet"></span>
                  <h3 class="catalog-mobile-header__title" style="margin: 0; font-size: 1rem; font-family: var(--font-serif); color: var(--text-onyx);">${serviceName(s)}</h3>
                </div>
                <div class="catalog-mobile-body">
                  ${s.packages.map(p => `
                    <div class="catalog-mobile-card">
                      <div class="catalog-mobile-card__top">
                        <h4 class="catalog-mobile-card__title">${packageName(p)}</h4>
                        ${p.popular ? `<span class="catalog-mobile-card__badge">${t('badge_popular')}</span>` : ''}
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

  // Collapsible Rate Card Drawer toggle
  const togglePriceBtn = document.getElementById('toggle-price-catalog-btn');
  const priceDrawer = document.getElementById('price-catalog-drawer');
  if (togglePriceBtn && priceDrawer) {
    togglePriceBtn.addEventListener('click', () => {
      const isExpanded = togglePriceBtn.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;
      togglePriceBtn.setAttribute('aria-expanded', String(nextState));
      priceDrawer.style.display = nextState ? 'block' : 'none';
      const txtEl = document.getElementById('toggle-price-catalog-text');
      const iconEl = document.getElementById('toggle-price-catalog-icon');
      const lang = getLang();
      if (txtEl) {
        txtEl.textContent = nextState ? tPsych('price_toggle_hide', lang) : tPsych('price_toggle_show', lang);
      }
      if (iconEl) {
        iconEl.style.transform = nextState ? 'rotate(180deg)' : 'rotate(0deg)';
      }
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
