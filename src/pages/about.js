/**
 * About Us Page — The Sanctuary Story, Sacred Identity, & Living Masters
 * Brand: Mahawellnerjourney (Official Flagship Sanctuary of Desa Adat Bindu)
 * Multi-Language: ID, EN, RU, ES, IT, FR
 */
import { COMPANY } from '../data.js';
import { t } from '../i18n.js';

export function renderAbout() {
  return `
    <!-- ==================== HERO SECTION ==================== -->
    <section class="page-hero" style="padding-top: calc(var(--navbar-height) + var(--space-12)); padding-bottom: var(--space-12); background: var(--canvas); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 960px; margin: 0 auto; text-align: center;">
        <span class="overline" style="color: var(--gold-maha); letter-spacing: 0.12em;">${t('abt_overline')}</span>
        <h1 class="heading-1 font-serif" style="margin-bottom: var(--space-4);">${t('abt_heading')}</h1>
        <div class="section-divider" style="margin: var(--space-4) auto var(--space-6);">
          <div class="section-divider__line"></div>
          <span class="section-divider__motif">•</span>
          <div class="section-divider__line"></div>
        </div>
        <p class="subtitle" style="margin: 0 auto; font-size: 1.15rem; max-width: 720px; line-height: 1.7;">
          ${COMPANY.tagline}
        </p>
      </div>
    </section>

    <!-- ==================== SECTION 1: WHO WE ARE (SIAPA KAMI) ==================== -->
    <section class="section" style="padding: var(--space-16) 0; background: var(--surface-silk); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 1140px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-10); align-items: center;">
          <!-- Story Text -->
          <div class="fade-in-left">
            <span class="badge badge--teal" style="margin-bottom: var(--space-3);">${t('abt_badge_identity')}</span>
            <h2 class="heading-2 font-serif" style="margin-bottom: var(--space-5); color: var(--text-onyx); line-height: 1.3;">
              ${t('abt_who_title')}
            </h2>
            <p class="lead" style="font-size: 1.1rem; color: var(--cta-forest); font-weight: 500; margin-bottom: var(--space-4); line-height: 1.6;">
              ${t('abt_who_lead')}
            </p>
            <p style="font-size: 0.98rem; line-height: 1.8; color: var(--text-stone); margin-bottom: var(--space-4);">
              ${t('abt_who_p1')}
            </p>
            <p style="font-size: 0.98rem; line-height: 1.8; color: var(--text-stone); margin-bottom: var(--space-6);">
              ${t('abt_who_p2')}
            </p>

            <!-- Credential Metrics Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-hairline);">
              <div>
                <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; display: block;">Afiliasi Adat</span>
                <strong style="font-family: var(--font-serif); font-size: 1.05rem; color: var(--text-onyx);">Desa Bindu</strong>
              </div>
              <div>
                <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; display: block;">Living Ethos</span>
                <strong style="font-family: var(--font-serif); font-size: 1.05rem; color: var(--text-onyx);">Tri Hita Karana</strong>
              </div>
              <div>
                <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; display: block;">Privasi Sesi</span>
                <strong style="font-family: var(--font-serif); font-size: 1.05rem; color: var(--text-onyx);">Eksklusif Privat</strong>
              </div>
            </div>
          </div>

          <!-- Story Photo Card -->
          <div class="fade-in-right">
            <div style="background: var(--surface-card); border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-hairline); box-shadow: var(--shadow-md);">
              <img src="/images/sanctuary-ambiance.webp" alt="Ubud Sanctuary Grounds" width="600" height="380" style="width: 100%; height: 380px; object-fit: cover; display: block;" loading="lazy" decoding="async" />
              <div style="padding: var(--space-6); background: var(--surface-card);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span class="subtle-bullet" style="color: var(--gold-maha);">•</span>
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);">
                    Official Sanctuary Grounds • Ubud
                  </span>
                </div>
                <p style="font-family: var(--font-serif); font-size: 1.15rem; margin: 0 0 4px; color: var(--text-onyx);">
                  Ubud Sacred Valley Sanctuary
                </p>
                <p style="font-size: 0.84rem; color: var(--text-stone); margin: 0; line-height: 1.5;">
                  Oase hening di lembah persawahan sakral Desa Adat Bindu, Gianyar, Bali. Menjaga kemurnian tirta dan ketenangan jiwa tanpa gangguan keramaian kota.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 2: WHAT WE OFFER (EMPAT PILAR UTAMA) ==================== -->
    <section class="section" style="padding: var(--space-16) 0; background: var(--canvas); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 1140px; margin: 0 auto;">
        <div style="text-align: center; max-width: 720px; margin: 0 auto var(--space-12);" class="fade-in">
          <span class="overline" style="color: var(--gold-maha);">SACRED OFFERINGS</span>
          <h2 class="heading-2 font-serif" style="margin-top: var(--space-1); margin-bottom: var(--space-3); color: var(--text-onyx);">
            ${t('abt_what_title')}
          </h2>
          <p class="subtitle" style="margin: 0 auto; font-size: 1rem; color: var(--text-stone);">
            ${t('abt_what_desc')}
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-6);" class="stagger">
          <!-- Pillar 1: Melukat -->
          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xs); transition: all 0.25s ease;">
            <div style="height: 190px; overflow: hidden; position: relative;">
              <img src="/images/healing-purification.webp" alt="${t('abt_pillar_1_title')}" width="300" height="190" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" decoding="async" />
              <span class="badge badge--teal" style="position: absolute; top: 12px; left: 12px;">Pilar I • Melukat</span>
            </div>
            <div style="padding: var(--space-6);">
              <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_pillar_1_title')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin-bottom: var(--space-4);">
                ${t('abt_pillar_1_desc')}
              </p>
              <a href="#/layanan/healing-purification" style="color: var(--cta-forest); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                Lihat Detail Sesi →
              </a>
            </div>
          </div>

          <!-- Pillar 2: Sound & Yoga -->
          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xs); transition: all 0.25s ease;">
            <div style="height: 190px; overflow: hidden; position: relative;">
              <img src="/images/yoga-meditation-retreat.webp" alt="${t('abt_pillar_2_title')}" width="300" height="190" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" decoding="async" />
              <span class="badge badge--teal" style="position: absolute; top: 12px; left: 12px;">Pilar II • Sound & Yoga</span>
            </div>
            <div style="padding: var(--space-6);">
              <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_pillar_2_title')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin-bottom: var(--space-4);">
                ${t('abt_pillar_2_desc')}
              </p>
              <a href="#/layanan/yoga-meditation-retreat" style="color: var(--cta-forest); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                Lihat Detail Sesi →
              </a>
            </div>
          </div>

          <!-- Pillar 3: Numerology -->
          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xs); transition: all 0.25s ease;">
            <div style="height: 190px; overflow: hidden; position: relative;">
              <img src="/images/numerology-consultation.webp" alt="${t('abt_pillar_3_title')}" width="300" height="190" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" decoding="async" />
              <span class="badge badge--teal" style="position: absolute; top: 12px; left: 12px;">Pilar III • Wariga</span>
            </div>
            <div style="padding: var(--space-6);">
              <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_pillar_3_title')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin-bottom: var(--space-4);">
                ${t('abt_pillar_3_desc')}
              </p>
              <a href="#/layanan/numerology-consultation" style="color: var(--cta-forest); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                Lihat Detail Sesi →
              </a>
            </div>
          </div>

          <!-- Pillar 4: Temple Tour -->
          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xs); transition: all 0.25s ease;">
            <div style="height: 190px; overflow: hidden; position: relative;">
              <img src="/images/spiritual-temple-tour.webp" alt="${t('abt_pillar_4_title')}" width="300" height="190" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" decoding="async" />
              <span class="badge badge--teal" style="position: absolute; top: 12px; left: 12px;">Pilar IV • Ziarah Pura</span>
            </div>
            <div style="padding: var(--space-6);">
              <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_pillar_4_title')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin-bottom: var(--space-4);">
                ${t('abt_pillar_4_desc')}
              </p>
              <a href="#/layanan/spiritual-temple-tour" style="color: var(--cta-forest); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                Lihat Detail Sesi →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 3: WHO IS THIS FOR (UNTUK SIAPA) ==================== -->
    <section class="section" style="padding: var(--space-16) 0; background: var(--surface-silk); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 1140px; margin: 0 auto;">
        <div style="text-align: center; max-width: 700px; margin: 0 auto var(--space-12);" class="fade-in">
          <span class="overline" style="color: var(--gold-maha);">INTENDED AUDIENCE</span>
          <h2 class="heading-2 font-serif" style="margin-top: var(--space-1); margin-bottom: var(--space-3); color: var(--text-onyx);">
            ${t('abt_for_title')}
          </h2>
          <p class="subtitle" style="margin: 0 auto; font-size: 1rem; color: var(--text-stone);">
            ${t('abt_for_desc')}
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);" class="stagger">
          <!-- Persona 1 -->
          <div class="about-persona-card">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface-silk); border: 1px solid var(--border-gold-subtle); color: var(--gold-maha); font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-4);">
              I
            </div>
            <h3 class="heading-3 font-serif" style="font-size: 1.2rem; margin-bottom: var(--space-3); color: var(--text-onyx);">
              ${t('abt_for_1_title')}
            </h3>
            <p style="font-size: 0.92rem; color: var(--text-stone); line-height: 1.7; margin: 0;">
              ${t('abt_for_1_desc')}
            </p>
          </div>

          <!-- Persona 2 -->
          <div class="about-persona-card">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface-silk); border: 1px solid var(--border-gold-subtle); color: var(--gold-maha); font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-4);">
              II
            </div>
            <h3 class="heading-3 font-serif" style="font-size: 1.2rem; margin-bottom: var(--space-3); color: var(--text-onyx);">
              ${t('abt_for_2_title')}
            </h3>
            <p style="font-size: 0.92rem; color: var(--text-stone); line-height: 1.7; margin: 0;">
              ${t('abt_for_2_desc')}
            </p>
          </div>

          <!-- Persona 3 -->
          <div class="about-persona-card">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface-silk); border: 1px solid var(--border-gold-subtle); color: var(--gold-maha); font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-4);">
              III
            </div>
            <h3 class="heading-3 font-serif" style="font-size: 1.2rem; margin-bottom: var(--space-3); color: var(--text-onyx);">
              ${t('abt_for_3_title')}
            </h3>
            <p style="font-size: 0.92rem; color: var(--text-stone); line-height: 1.7; margin: 0;">
              ${t('abt_for_3_desc')}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 4: OUR MASTERS & SACRED GUARDIANS (MUKA & PRAKTISI) ==================== -->
    <section class="section" style="padding: var(--space-16) 0; background: var(--canvas); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 1140px; margin: 0 auto;">
        <div style="text-align: center; max-width: 720px; margin: 0 auto var(--space-12);" class="fade-in">
          <span class="overline" style="color: var(--gold-maha);">LIVING CUSTODIANS</span>
          <h2 class="heading-2 font-serif" style="margin-top: var(--space-1); margin-bottom: var(--space-3); color: var(--text-onyx);">
            ${t('abt_masters_title')}
          </h2>
          <p class="subtitle" style="margin: 0 auto; font-size: 1rem; color: var(--text-stone);">
            ${t('abt_masters_desc')}
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-6);" class="stagger">
          <!-- Master 1: Jero Mangku -->
          <div class="practitioner-card">
            <img src="/images/balinese-elder-portrait.webp" alt="${t('abt_master_1_name')}" class="practitioner-card__img" width="300" height="260" loading="lazy" decoding="async" />
            <div class="practitioner-card__body">
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-maha); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">
                ${t('abt_master_1_role')}
              </span>
              <h3 class="heading-3 font-serif" style="font-size: 1.25rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_master_1_name')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin: 0;">
                ${t('abt_master_1_desc')}
              </p>
            </div>
          </div>

          <!-- Master 2: Ida Ayu Gayatri -->
          <div class="practitioner-card">
            <img src="/images/balinese-healer-portrait.webp" alt="${t('abt_master_2_name')}" class="practitioner-card__img" width="300" height="260" loading="lazy" decoding="async" />
            <div class="practitioner-card__body">
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-maha); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">
                ${t('abt_master_2_role')}
              </span>
              <h3 class="heading-3 font-serif" style="font-size: 1.25rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_master_2_name')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin: 0;">
                ${t('abt_master_2_desc')}
              </p>
            </div>
          </div>

          <!-- Master 3: I Made Ariawan -->
          <div class="practitioner-card">
            <img src="/images/balinese-numerology-master.webp" alt="${t('abt_master_3_name')}" class="practitioner-card__img" width="300" height="260" loading="lazy" decoding="async" />
            <div class="practitioner-card__body">
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-maha); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">
                ${t('abt_master_3_role')}
              </span>
              <h3 class="heading-3 font-serif" style="font-size: 1.25rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_master_3_name')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin: 0;">
                ${t('abt_master_3_desc')}
              </p>
            </div>
          </div>

          <!-- Master 4: Ni Kadek Sukerti -->
          <div class="practitioner-card">
            <img src="/images/sanctuary-ambiance.webp" alt="${t('abt_master_4_name')}" class="practitioner-card__img" width="300" height="260" loading="lazy" decoding="async" />
            <div class="practitioner-card__body">
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-maha); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">
                ${t('abt_master_4_role')}
              </span>
              <h3 class="heading-3 font-serif" style="font-size: 1.25rem; margin-bottom: var(--space-2); color: var(--text-onyx);">
                ${t('abt_master_4_name')}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin: 0;">
                ${t('abt_master_4_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECTION 5: PILLAR VALUES ==================== -->
    <section class="section" style="padding: var(--space-16) 0; background: var(--surface-silk); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 1040px; margin: 0 auto;">
        <div style="text-align: center; max-width: 680px; margin: 0 auto var(--space-10);" class="fade-in">
          <span class="overline" style="color: var(--gold-maha);">ETHICAL FOUNDATION</span>
          <h2 class="heading-2 font-serif" style="color: var(--text-onyx); margin-top: var(--space-1);">
            ${t('abt_philosophy_heading')}
          </h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6);" class="stagger">
          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-8); text-align: left; box-shadow: var(--shadow-xs);">
            <div style="color: var(--gold-maha); font-size: 1.2rem; margin-bottom: var(--space-3); line-height: 1;"><span class="subtle-bullet">•</span></div>
            <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('abt_val_1_title')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-stone); line-height: 1.6; margin: 0;">${t('abt_val_1_desc')}</p>
          </div>

          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-8); text-align: left; box-shadow: var(--shadow-xs);">
            <div style="color: var(--gold-maha); font-size: 1.2rem; margin-bottom: var(--space-3); line-height: 1;"><span class="subtle-bullet">•</span></div>
            <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('abt_val_2_title')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-stone); line-height: 1.6; margin: 0;">${t('abt_val_2_desc')}</p>
          </div>

          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-8); text-align: left; box-shadow: var(--shadow-xs);">
            <div style="color: var(--gold-maha); font-size: 1.2rem; margin-bottom: var(--space-3); line-height: 1;"><span class="subtle-bullet">•</span></div>
            <h3 class="heading-3 font-serif" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('abt_val_3_title')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-stone); line-height: 1.6; margin: 0;">${t('abt_val_3_desc')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== CALL TO ACTION ==================== -->
    <section class="section" style="padding: var(--space-16) 0; background: var(--canvas);">
      <div class="container" style="max-width: 860px; margin: 0 auto;">
        <div class="fade-in" style="background: var(--surface-card); border: 1.5px solid var(--border-gold-subtle); border-radius: var(--radius-xl); padding: var(--space-12) var(--space-8); text-align: center; box-shadow: var(--shadow-sm);">
          <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney Emblem" width="56" height="56" loading="lazy" decoding="async" style="width: 56px; height: 56px; border-radius: 50%; margin: 0 auto var(--space-4); display: block;" />
          <span class="overline" style="color: var(--gold-maha); letter-spacing: 0.12em;">DIRECT SANCTUARY ACCESS</span>
          <h2 class="heading-2 font-serif" style="font-size: clamp(1.6rem, 3vw, 2.1rem); margin-bottom: var(--space-3); color: var(--text-onyx);">
            ${t('abt_cta_heading')}
          </h2>
          <p style="font-size: 1rem; color: var(--text-stone); max-width: 600px; margin: 0 auto var(--space-8); line-height: 1.7;">
            ${t('abt_cta_desc')}
          </p>
          <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
            <a href="#/booking" class="btn btn--primary btn--lg" data-page="booking" style="padding: 12px 28px;">
              ${t('abt_cta_booking')}
            </a>
            <a href="#/layanan" class="btn btn--secondary btn--lg" data-page="services" style="padding: 12px 24px;">
              ${t('abt_cta_services')}
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}
