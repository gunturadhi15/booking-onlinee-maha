/**
 * Home Page — Mahawellnerjourney Official Flagship & Direct Booking Engine
 * Aesthetic: Ornate Emblem on a Quiet Sanctuary Canvas
 * Palette: Sacred Lotus Alabaster (#FAF7F2), Deep Sacred Ubud Forest (#14281D), Maha Gold (#C59B27)
 */
import { SERVICES, PACKAGES, COMPANY, SETTINGS, formatCurrency, getPackagesByService } from '../data.js';
import { t, getLang, getDateLocale, translateDuration } from '../i18n.js';

const COPY = {
  id: {
    hero_badge: 'Sanctuary Resmi • Ubud, Bali',
    hero_title: 'Sacred Wellness & Curated Journeys',
    hero_title_sub: 'di Tanah Sakral Bali.',
    hero_lead: 'Gerbang reservasi langsung untuk perjalanan spiritual mendalam, melukat sakral, yoga retreat, dan konsultasi numerologi berwibawa di Ubud. Dipandu langsung oleh praktisi lokal senior dalam atmosfer hening dan berkelas.',
    hero_btn_book: 'Book Your Journey',
    hero_btn_explore: 'Lihat Paket Signature',
    
    // Quick Booking Bar
    bar_service: 'Pilih Layanan / Journey',
    bar_date: 'Tanggal Kunjungan',
    bar_session: 'Waktu Sesi',
    bar_session_morning: 'Pagi (09:00 WITA)',
    bar_session_noon: 'Siang (12:00 WITA)',
    bar_session_afternoon: 'Sore (15:00 WITA)',
    bar_guests: 'Jumlah Tamu',
    bar_guest_1: '1 Orang',
    bar_guest_2: '2 Orang (Best Pair)',
    bar_guest_3: '3 Orang',
    bar_guest_4: '4+ Orang (Private Group)',
    bar_btn: 'Cek Ketersediaan & Pesan',

    // Direct Booking Assurance
    assure_direct: 'Official Direct Reservation',
    assure_price: 'Transparent Pricing (No Hidden Fees)',
    assure_confirm: 'Instant Booking & Official E-Voucher',

    // Curated Showcase
    showcase_overline: 'Curated Journeys',
    showcase_title: 'Pilihan Transformasi Jiwa & Raga',
    showcase_desc: 'Setiap perjalanan dirancang dengan alur sakral yang terstruktur, pendampingan personal, dan fasilitas lengkap tanpa biaya tersembunyi.',
    signature_badge: 'Signature Maha Journey • Best Value',
    btn_select_journey: 'Pilih Journey Ini',
    btn_view_details: 'Lihat Rincian',

    // Experience / Philosophy
    phil_overline: 'The Sanctuary Experience',
    phil_title: 'Harmoni Ketenangan di Atas Kanvas Hening Ubud',
    phil_desc: 'Kami meyakini bahwa penyembuhan sejati berakar dari ruang yang tenang dan bimbingan yang tulus. Menjauh dari hiruk-pikuk wisata massal, Mahawellnerjourney menghadirkan pengalaman spiritual privat yang menjaga martabat dan kesakralan tradisi Bali.',
    phil_point_1_title: 'Praktisi Senior & Berdedikasi',
    phil_point_1_desc: 'Dipandu pemangku adat dan instruktur bersertifikasi dengan restu spiritual lokal.',
    phil_point_2_title: 'Privasi & Jumlah Tamu Dibatasi',
    phil_point_2_desc: 'Setiap sesi dibatasi kuotanya agar energi sanctuary tetap tenang dan personal.',
    phil_point_3_title: 'Kepastian & Ketepatan Waktu',
    phil_point_3_desc: 'Jadwal terkonfirmasi langsung ke email dan WhatsApp tanpa risiko bentrok antrean.',

    // 3-Step Flow
    flow_overline: 'Alur Reservasi Ringkas',
    flow_title: 'Tiga Langkah Menuju Sanctuary',
    flow_desc: 'Proses reservasi dirancang hening dan sangat efisien, selesai dalam waktu kurang dari 3 menit.',
    step_1_title: '1. Tentukan Layanan & Waktu',
    step_1_desc: 'Pilih program journey yang selaras dengan panggilan jiwa serta tanggal yang Anda kehendaki.',
    step_2_title: '2. Lengkapi Data Tamu',
    step_2_desc: 'Cukup cantumkan nama dan kontak WhatsApp untuk pengiriman detail lokasi dan persiapan.',
    step_3_title: '3. Konfirmasi & E-Voucher',
    step_3_desc: 'Pembayaran aman instan via QRIS, Virtual Account, atau Kartu. E-Voucher resmi langsung terbit.',

    // Price Table
    price_overline: 'Transparansi Tarif Resmi',
    price_title: 'Katalog Harga Lengkap Seluruh Paket',
    price_desc: 'Harga tercantum adalah harga bersih per orang. Pajak 11% terhitung secara transparan di rincian akhir.',
    th_service: 'Program Journey / Paket',
    th_duration: 'Durasi Sesi',
    th_price: 'Harga Paket',
    th_total: 'Total (+ Pajak 11%)',
    th_action: 'Aksi',

    // CTA
    cta_title: 'Mulailah Perjalanan Transformasi Anda di Ubud',
    cta_desc: 'Slot harian kami dibatasi demi menjaga ketenangan sanctuary. Amankan jadwal terbaik Anda hari ini.',
    cta_btn: 'Reservasi Jadwal Sekarang',
    cta_wa: 'Konsultasi Concierge via WhatsApp',
  },
  en: {
    hero_badge: 'Official Sanctuary • Ubud, Bali',
    hero_title: 'Sacred Wellness & Curated Journeys',
    hero_title_sub: 'in the Sacred Heart of Bali.',
    hero_lead: 'The official direct booking gateway for profound spiritual journeys, sacred purification (melukat), yoga retreats, and authentic numerology in Ubud. Led by revered local practitioners in an atmosphere of serene dignity.',
    hero_btn_book: 'Book Your Journey',
    hero_btn_explore: 'View Signature Journeys',

    // Quick Booking Bar
    bar_service: 'Select Journey / Service',
    bar_date: 'Visit Date',
    bar_session: 'Session Time',
    bar_session_morning: 'Morning (09:00 WITA)',
    bar_session_noon: 'Noon (12:00 WITA)',
    bar_session_afternoon: 'Afternoon (15:00 WITA)',
    bar_guests: 'Guests',
    bar_guest_1: '1 Guest',
    bar_guest_2: '2 Guests (Best Pair)',
    bar_guest_3: '3 Guests',
    bar_guest_4: '4+ Guests (Private Group)',
    bar_btn: 'Check Availability & Book',

    // Direct Booking Assurance
    assure_direct: 'Official Direct Reservation',
    assure_price: 'Transparent Pricing (No Hidden Fees)',
    assure_confirm: 'Instant Booking & Official E-Voucher',

    // Curated Showcase
    showcase_overline: 'Curated Journeys',
    showcase_title: 'Holistic Soul & Body Transformations',
    showcase_desc: 'Each journey is thoughtfully curated with sacred protocols, dedicated guidance, and all-inclusive facilities without hidden charges.',
    signature_badge: 'Signature Maha Journey • Best Value',
    btn_select_journey: 'Select This Journey',
    btn_view_details: 'View Details',

    // Experience / Philosophy
    phil_overline: 'The Sanctuary Experience',
    phil_title: 'Serene Harmony on a Quiet Sanctuary Canvas',
    phil_desc: 'We believe genuine healing flourishes in unhurried stillness and genuine guidance. Away from crowded mass tourism, Mahawellnerjourney provides private spiritual sessions honoring Bali’s sacred ancestral traditions.',
    phil_point_1_title: 'Senior Dedicated Practitioners',
    phil_point_1_desc: 'Led by authentic priests and certified masters with local blessings.',
    phil_point_2_title: 'Intimate Capped Sessions',
    phil_point_2_desc: 'Capacity is strictly capped to protect the peaceful aura of the sanctuary.',
    phil_point_3_title: 'Punctuality & Instant Assurance',
    phil_point_3_desc: 'Schedules are confirmed instantly to your email and WhatsApp without scheduling conflicts.',

    // 3-Step Flow
    flow_overline: 'Effortless Direct Booking',
    flow_title: 'Three Steps to the Sanctuary',
    flow_desc: 'Designed for cognitive ease and serene efficiency, completed in under 3 minutes.',
    step_1_title: '1. Select Journey & Schedule',
    step_1_desc: 'Choose the journey that resonates with your intention and pick your preferred date.',
    step_2_title: '2. Guest Details',
    step_2_desc: 'Provide your name and WhatsApp contact for instant arrival details and preparation guidance.',
    step_3_title: '3. Instant Confirmation & E-Voucher',
    step_3_desc: 'Secure checkout via QRIS, Virtual Account, or Card. Official E-Voucher issued immediately.',

    // Price Table
    price_overline: 'Transparent Official Rates',
    price_title: 'Complete Package Price Catalog',
    price_desc: 'Listed prices are per person. 11% tax is computed transparently in the final invoice.',
    th_service: 'Journey / Package',
    th_duration: 'Session Duration',
    th_price: 'Base Price',
    th_total: 'Total (incl. 11% Tax)',
    th_action: 'Action',

    // CTA
    cta_title: 'Begin Your Transformative Journey in Ubud',
    cta_desc: 'Sanctuary slots are strictly limited daily to preserve quiet intimacy. Secure your preferred date today.',
    cta_btn: 'Reserve Your Journey Now',
    cta_wa: 'Concierge Care on WhatsApp',
  },
};

function c(key) {
  const dict = COPY[getLang()] || COPY.en;
  return dict[key] ?? COPY.id[key];
}

function serviceName(service) {
  const key = `data_${service.service_id.toLowerCase()}_name`;
  return t(key) !== key ? t(key) : service.service_name;
}

function serviceDesc(service) {
  const key = `data_${service.service_id.toLowerCase()}_desc`;
  return t(key) !== key ? t(key) : service.description;
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
        <div class="fade-in-left">
          <div class="sanctuary-hero__badge">
            <span style="color: var(--gold-maha);">✦</span>
            <span>${c('hero_badge')}</span>
          </div>

          <h1 class="heading-1 sanctuary-hero__title">
            ${c('hero_title')} <br />
            <em>${c('hero_title_sub')}</em>
          </h1>

          <p class="sanctuary-hero__lead">
            ${c('hero_lead')}
          </p>

          <div class="sanctuary-hero__actions">
            <a href="#/booking" class="btn btn--primary btn--lg" id="hero-book-btn" data-page="booking">
              ${c('hero_btn_book')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#curated-journeys" class="btn btn--secondary btn--lg" id="hero-explore-btn">
              ${c('hero_btn_explore')}
            </a>
          </div>
        </div>

        <div class="sanctuary-hero__card fade-in-right">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: var(--space-5); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border-hairline);">
            <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney Emblem" style="width: 52px; height: 52px; border-radius: 50%; border: 1.5px solid var(--border-gold-subtle);" />
            <div>
              <span class="overline" style="margin: 0;">OFFICIAL SANCTUARY FRONT</span>
              <h3 style="font-size: 1.15rem; margin: 0; color: var(--text-onyx); font-family: var(--font-serif);">Mahawellnerjourney</h3>
            </div>
          </div>

          <p style="font-size: 0.92rem; color: var(--text-stone); line-height: 1.6; margin-bottom: var(--space-5);">
            “Ketenangan bukanlah ketiadaan suara, melainkan kehadiran kedamaian di dalam jiwa. Selamat datang di ruang hening tempat raga dan rasa kembali selaras.”
          </p>

          <div style="background: var(--surface-silk); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); font-size: 0.82rem;">
            <div>
              <span style="display: block; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase;">Setting Sanctuary</span>
              <strong style="color: var(--text-onyx);">Ubud Sanctuary Valley</strong>
            </div>
            <div>
              <span style="display: block; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase;">Kapasitas Sesi</span>
              <strong style="color: var(--text-onyx);">Maks. 6 Tamu / Sesi</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== DIRECT JOURNEY BOOKING BAR ==================== -->
    <div class="booking-bar-wrapper fade-in">
      <form class="booking-bar" id="quick-booking-form">
        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-service">${c('bar_service')}</label>
          <select id="quick-service" class="booking-bar__select">
            ${services.map(s => `
              <option value="${s.service_id}">${serviceName(s)}</option>
            `).join('')}
          </select>
        </div>

        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-date">${c('bar_date')}</label>
          <input type="date" id="quick-date" class="booking-bar__input" value="${defaultDateStr}" min="${defaultDateStr}" />
        </div>

        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-session">${c('bar_session')}</label>
          <select id="quick-session" class="booking-bar__select">
            <option value="10:00">${c('bar_session_morning')}</option>
            <option value="13:00">${c('bar_session_noon')}</option>
            <option value="15:00">${c('bar_session_afternoon')}</option>
          </select>
        </div>

        <div class="booking-bar__item">
          <label class="booking-bar__label" for="quick-guests">${c('bar_guests')}</label>
          <select id="quick-guests" class="booking-bar__select">
            <option value="1">${c('bar_guest_1')}</option>
            <option value="2" selected>${c('bar_guest_2')}</option>
            <option value="3">${c('bar_guest_3')}</option>
            <option value="4">${c('bar_guest_4')}</option>
          </select>
        </div>

        <button type="submit" class="btn btn--primary booking-bar__btn" id="quick-booking-submit">
          ${c('bar_btn')}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </form>

      <!-- Direct Booking Assurance -->
      <div class="booking-assurance">
        <span><span class="gold-gem">✦</span> ${c('assure_direct')}</span>
        <span><span class="gold-gem">✦</span> ${c('assure_price')}</span>
        <span><span class="gold-gem">✦</span> ${c('assure_confirm')}</span>
      </div>
    </div>

    <!-- Echoing Geometry Section Divider -->
    <div class="section-divider">
      <div class="section-divider__line"></div>
      <span class="section-divider__motif">✦</span>
      <div class="section-divider__line"></div>
    </div>

    <!-- ==================== CURATED JOURNEYS SHOWCASE ==================== -->
    <section class="container" id="curated-journeys" style="padding-bottom: var(--space-16);">
      <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-10);" class="fade-in">
        <span class="overline">${c('showcase_overline')}</span>
        <h2 class="heading-2">${c('showcase_title')}</h2>
        <p class="subtitle" style="margin: var(--space-3) auto 0;">${c('showcase_desc')}</p>
      </div>

      <div class="journeys-grid">
        ${services.map((s, index) => {
          const isSignature = index === 0 || index === 3; // Highlight Temple Tour & Purification as signature
          const pkg = s.popularPkg;
          return `
            <article class="journey-card ${isSignature ? 'signature' : ''} fade-in" data-service="${s.service_id}">
              ${isSignature ? `<div class="journey-card__badge">${c('signature_badge')}</div>` : ''}

              <span class="journey-card__category">${s.category} • ${translateDuration(pkg.duration)}</span>
              <h3 class="journey-card__name font-serif">${serviceName(s)}</h3>
              <p class="journey-card__desc">${serviceDesc(s)}</p>

              <ul class="journey-card__inclusions">
                ${pkg.benefits.slice(0, 4).map(b => `
                  <li>
                    <span class="check">✦</span>
                    <span>${b}</span>
                  </li>
                `).join('')}
              </ul>

              <div class="journey-card__footer">
                <div>
                  <span class="journey-card__price-label">Mulai dari</span>
                  <span class="journey-card__price tabular-nums">${formatCurrency(s.minPrice)}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <a href="#/layanan/${s.slug}" class="btn btn--secondary btn--sm">Detail</a>
                  <a href="#/booking?service=${s.service_id}&package=${pkg.package_id}" class="btn btn--primary btn--sm" data-page="booking">
                    ${c('btn_select_journey')}
                  </a>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>

    <!-- ==================== SANCTUARY PHILOSOPHY & EXPERIENCE ==================== -->
    <section style="background: var(--surface-silk); padding: var(--space-16) 0; border-top: 1px solid var(--border-hairline); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center;">
        <div class="fade-in-left">
          <span class="overline">${c('phil_overline')}</span>
          <h2 class="heading-2" style="margin-bottom: var(--space-4);">${c('phil_title')}</h2>
          <p style="color: var(--text-stone); line-height: 1.7; margin-bottom: var(--space-6); font-size: 0.98rem;">
            ${c('phil_desc')}
          </p>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span style="color: var(--gold-maha); font-size: 1.1rem; line-height: 1.4;">✦</span>
              <div>
                <h4 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${c('phil_point_1_title')}</h4>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${c('phil_point_1_desc')}</p>
              </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span style="color: var(--gold-maha); font-size: 1.1rem; line-height: 1.4;">✦</span>
              <div>
                <h4 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${c('phil_point_2_title')}</h4>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${c('phil_point_2_desc')}</p>
              </div>
            </div>

            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span style="color: var(--gold-maha); font-size: 1.1rem; line-height: 1.4;">✦</span>
              <div>
                <h4 style="font-size: 1rem; margin: 0 0 4px; color: var(--text-onyx); font-family: var(--font-serif);">${c('phil_point_3_title')}</h4>
                <p style="font-size: 0.88rem; color: var(--text-stone); margin: 0;">${c('phil_point_3_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="fade-in-right" style="background: var(--surface-card); padding: var(--space-8); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="text-align: center; margin-bottom: var(--space-6);">
            <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney" style="width: 72px; height: 72px; border-radius: 50%; margin: 0 auto var(--space-3); display: block;" />
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0; color: var(--text-onyx);">MAHAWELLNERJOURNEY</h3>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--gold-maha); letter-spacing: 0.12em; text-transform: uppercase;">Direct Wellness Sanctuary</span>
          </div>

          <div style="border-top: 1px solid var(--border-hairline); padding-top: var(--space-4); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); font-size: 0.84rem;">
            <div>
              <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; display: block;">Lokasi Sanctuary</span>
              <strong>Jl. Raya Ubud No. 88</strong>
              <p style="color: var(--text-stone); margin: 2px 0 0;">Gianyar, Bali 80571</p>
            </div>
            <div>
              <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; display: block;">Jam Kedatangan</span>
              <strong>09:00 - 17:00 WITA</strong>
              <p style="color: var(--text-stone); margin: 2px 0 0;">Respon Concierge 24 Jam</p>
            </div>
          </div>

          <div style="margin-top: var(--space-6); text-align: center;">
            <a href="#/tentang-kami" class="btn btn--secondary" style="width: 100%;" data-page="about">
              Baca Kisah Filosofi Lengkap →
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 3-STEP EFFORTLESS BOOKING FLOW ==================== -->
    <section class="container" style="padding: var(--space-16) 0;">
      <div style="text-align: center; max-width: 640px; margin: 0 auto var(--space-10);" class="fade-in">
        <span class="overline">${c('flow_overline')}</span>
        <h2 class="heading-2">${c('flow_title')}</h2>
        <p class="subtitle" style="margin: var(--space-3) auto 0;">${c('flow_desc')}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6);">
        <div class="fade-in" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-maha); font-weight: 700; margin-bottom: var(--space-2);">STEP 01</div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${c('step_1_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${c('step_1_desc')}</p>
        </div>

        <div class="fade-in" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-maha); font-weight: 700; margin-bottom: var(--space-2);">STEP 02</div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${c('step_2_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${c('step_2_desc')}</p>
        </div>

        <div class="fade-in" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-maha); font-weight: 700; margin-bottom: var(--space-2);">STEP 03</div>
          <h3 style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${c('step_3_title')}</h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.55; margin: 0;">${c('step_3_desc')}</p>
        </div>
      </div>
    </section>

    <!-- ==================== TRANSPARENT RATES CATALOG (TABLE) ==================== -->
    <section id="price-table" style="background: var(--surface-silk); padding: var(--space-16) 0; border-top: 1px solid var(--border-hairline);">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-10);" class="fade-in">
          <span class="overline">${c('price_overline')}</span>
          <h2 class="heading-2">${c('price_title')}</h2>
          <p class="subtitle" style="margin: var(--space-3) auto 0;">${c('price_desc')}</p>
        </div>

        <div style="overflow-x: auto; background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);" class="fade-in">
          <table style="width: 100%; min-width: 680px; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 1.5px solid var(--border-hairline); background: #FAF8F4; text-align: left;">
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted);">${c('th_service')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted);">${c('th_duration')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); text-align: right;">${c('th_price')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); text-align: right;">${c('th_total')}</th>
                <th style="padding: 14px 18px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); text-align: center;">${c('th_action')}</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(s => `
                <tr style="background: var(--surface-silk); border-bottom: 1px solid var(--border-hairline);">
                  <td colspan="5" style="padding: 10px 18px; font-family: var(--font-serif); font-weight: 700; color: var(--text-onyx); font-size: 0.98rem;">
                    ✦ ${serviceName(s)}
                  </td>
                </tr>
                ${s.packages.map(p => `
                  <tr style="border-bottom: 1px solid var(--border-hairline);">
                    <td style="padding: 12px 18px;">
                      <strong style="color: var(--text-onyx);">${p.package_name}</strong>
                      ${p.popular ? `<span style="margin-left: 8px; font-family: var(--font-mono); font-size: 0.65rem; background: var(--cta-forest); color: white; padding: 2px 6px; border-radius: 3px;">POPULAR</span>` : ''}
                      <p style="font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0;">${p.description}</p>
                    </td>
                    <td style="padding: 12px 18px; font-size: 0.85rem; color: var(--text-stone);">${translateDuration(p.duration)}</td>
                    <td style="padding: 12px 18px; text-align: right; font-weight: 500;" class="tabular-nums">${formatCurrency(p.price)}</td>
                    <td style="padding: 12px 18px; text-align: right; font-weight: 700; color: var(--cta-forest);" class="tabular-nums">${formatCurrency(p.price + Math.round(p.price * SETTINGS.tax_rate))}</td>
                    <td style="padding: 12px 18px; text-align: center;">
                      <a href="#/booking?service=${s.service_id}&package=${p.package_id}" class="btn btn--primary btn--sm" data-page="booking">Pesan</a>
                    </td>
                  </tr>
                `).join('')}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ==================== FINAL CALM CALL TO ACTION ==================== -->
    <section class="container" style="padding: var(--space-16) 0;">
      <div class="fade-in" style="background: var(--surface-card); border: 1.5px solid var(--border-gold-subtle); border-radius: var(--radius-lg); padding: var(--space-12) var(--space-8); text-align: center; box-shadow: var(--shadow-sm);">
        <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney" style="width: 58px; height: 58px; border-radius: 50%; margin: 0 auto var(--space-4); display: block;" />
        <h2 class="heading-2" style="margin-bottom: var(--space-3);">${c('cta_title')}</h2>
        <p class="subtitle" style="margin: 0 auto var(--space-8);">${c('cta_desc')}</p>

        <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
          <a href="#/booking" class="btn btn--primary btn--lg" data-page="booking" id="cta-book-btn">
            ${c('cta_btn')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="https://wa.me/${(COMPANY.contact?.whatsapp || '6281234567890').replace(/\D/g, '')}" target="_blank" rel="noopener" class="btn btn--secondary btn--lg" id="cta-wa-btn">
            ${c('cta_wa')}
          </a>
        </div>
      </div>
    </section>
  `;
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
}
