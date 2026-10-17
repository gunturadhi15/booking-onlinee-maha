/**
 * About Us Page — The Sanctuary Story & Philosophy
 * Brand: Mahawellnerjourney
 */
import { COMPANY } from '../data.js';
import { t } from '../i18n.js';

export function renderAbout() {
  return `
    <section class="page-hero" style="padding-top: calc(var(--navbar-height) + var(--space-12)); padding-bottom: var(--space-10); background: var(--canvas); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 960px; margin: 0 auto; text-align: center;">
        <span class="overline">${t('abt_overline')}</span>
        <h1 class="heading-1" style="margin-bottom: var(--space-4);">${t('abt_heading')}</h1>
        <div class="section-divider" style="margin: var(--space-4) auto var(--space-6);">
          <div class="section-divider__line"></div>
          <span class="section-divider__motif">✦</span>
          <div class="section-divider__line"></div>
        </div>
        <p class="subtitle" style="margin: 0 auto; font-size: 1.1rem;">${COMPANY.tagline}</p>
      </div>
    </section>

    <section class="section" style="padding: var(--space-16) 0; background: var(--canvas);">
      <div class="container" style="max-width: 900px; margin: 0 auto;">
        
        <!-- Story Card -->
        <div class="fade-in" style="background: var(--surface-card); border-radius: var(--radius-lg); padding: var(--space-10); border: 1px solid var(--border-hairline); box-shadow: var(--shadow-xs); margin-bottom: var(--space-10);">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border-hairline);">
            <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney Logo" style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid var(--border-hairline);" />
            <div>
              <span class="overline" style="margin: 0;">Sanctuary Philosophy</span>
              <h2 class="heading-2" style="font-size: 1.45rem; margin: 0; color: var(--text-onyx);">${t('abt_philosophy_heading')}</h2>
            </div>
          </div>
          
          <p style="font-size: 1.02rem; line-height: 1.8; color: var(--text-stone); margin-bottom: var(--space-4);">
            <strong style="color: var(--text-onyx); font-family: var(--font-serif);">${COMPANY.name}</strong> ${t('abt_desc_1')}
          </p>
          <p style="font-size: 1.02rem; line-height: 1.8; color: var(--text-stone);">
            ${t('abt_desc_2')}
          </p>
        </div>

        <!-- Pillar Values -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-12);" class="stagger">
          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-8); text-align: left;">
            <div style="color: var(--gold-maha); font-size: 1.25rem; margin-bottom: var(--space-3); line-height: 1;">✦</div>
            <h3 class="heading-3" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('abt_val_1_title')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-stone); line-height: 1.6; margin: 0;">${t('abt_val_1_desc')}</p>
          </div>

          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-8); text-align: left;">
            <div style="color: var(--gold-maha); font-size: 1.25rem; margin-bottom: var(--space-3); line-height: 1;">✦</div>
            <h3 class="heading-3" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('abt_val_2_title')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-stone); line-height: 1.6; margin: 0;">${t('abt_val_2_desc')}</p>
          </div>

          <div style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: var(--space-8); text-align: left;">
            <div style="color: var(--gold-maha); font-size: 1.25rem; margin-bottom: var(--space-3); line-height: 1;">✦</div>
            <h3 class="heading-3" style="font-size: 1.15rem; margin-bottom: var(--space-2); color: var(--text-onyx);">${t('abt_val_3_title')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-stone); line-height: 1.6; margin: 0;">${t('abt_val_3_desc')}</p>
          </div>
        </div>

        <!-- Serene Noble Call to Action (No Gold Slop Gradient) -->
        <div class="fade-in" style="background: var(--surface-card); border: 1.5px solid var(--border-gold-subtle); border-radius: var(--radius-lg); padding: var(--space-12) var(--space-8); text-align: center; box-shadow: var(--shadow-sm);">
          <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney" style="width: 54px; height: 54px; border-radius: 50%; margin: 0 auto var(--space-3); display: block;" />
          <h2 class="heading-2" style="font-size: 1.85rem; margin-bottom: var(--space-3); color: var(--text-onyx);">${t('abt_cta_heading')}</h2>
          <p style="font-size: 1rem; color: var(--text-stone); max-width: 580px; margin: 0 auto var(--space-8); line-height: 1.6;">
            ${t('abt_cta_desc')}
          </p>
          <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
            <a href="#/booking" class="btn btn--primary btn--lg" data-page="booking">${t('abt_cta_booking')}</a>
            <a href="#/layanan" class="btn btn--secondary btn--lg" data-page="services">${t('abt_cta_services')}</a>
          </div>
        </div>

      </div>
    </section>
  `;
}
