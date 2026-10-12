/**
 * About Us Page
 */
import { COMPANY } from '../data.js';
import { t } from '../i18n.js';

export function renderAbout() {
  return `
    <section class="page-hero">
      <div class="container">
        <span class="overline">${t('abt_overline')}</span>
        <h1 class="heading-1">${t('abt_heading')}</h1>
        <div class="divider-gold"></div>
        <p class="subtitle">${COMPANY.tagline}</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width: 900px; margin: 0 auto;">
        
        <div class="fade-in" style="background: white; border-radius: var(--radius-2xl); padding: var(--space-8); border: 1px solid var(--cream-200); box-shadow: var(--shadow-md); margin-bottom: var(--space-10);">
          <div class="section__header" style="text-align: left; margin-bottom: var(--space-6);">
            <span class="overline">${t('abt_philosophy')}</span>
            <h2 class="heading-2" style="font-size: var(--text-2xl);">${t('abt_philosophy_heading')}</h2>
          </div>
          <p style="font-size: var(--text-base); line-height: 1.8; color: var(--text-secondary); margin-bottom: var(--space-4);">
            <strong>${COMPANY.name}</strong> ${t('abt_desc_1')}
          </p>
          <p style="font-size: var(--text-base); line-height: 1.8; color: var(--text-secondary);">
            ${t('abt_desc_2')}
          </p>
        </div>

        <!-- Nilai Utama -->
        <div class="services__grid stagger" style="margin-bottom: var(--space-12);">
          <div class="card" style="padding: var(--space-6); text-align: center;">
            <div style="font-size: 36px; margin-bottom: var(--space-3); color: var(--gold-600);">☸</div>
            <h3 class="heading-3" style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${t('abt_val_1_title')}</h3>
            <p style="font-size: var(--text-sm); color: var(--text-secondary);">${t('abt_val_1_desc')}</p>
          </div>
          <div class="card" style="padding: var(--space-6); text-align: center;">
            <div style="font-size: 36px; margin-bottom: var(--space-3); color: var(--gold-600);">🕊️</div>
            <h3 class="heading-3" style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${t('abt_val_2_title')}</h3>
            <p style="font-size: var(--text-sm); color: var(--text-secondary);">${t('abt_val_2_desc')}</p>
          </div>
          <div class="card" style="padding: var(--space-6); text-align: center;">
            <div style="font-size: 36px; margin-bottom: var(--space-3); color: var(--gold-600);">✨</div>
            <h3 class="heading-3" style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${t('abt_val_3_title')}</h3>
            <p style="font-size: var(--text-sm); color: var(--text-secondary);">${t('abt_val_3_desc')}</p>
          </div>
        </div>

        <!-- CTA -->
        <div class="fade-in" style="background: linear-gradient(135deg, var(--gold-500), var(--gold-700)); border-radius: var(--radius-2xl); padding: var(--space-10); text-align: center; color: white;">
          <h2 style="font-size: var(--text-3xl); font-family: var(--font-serif); margin-bottom: var(--space-3); color: white;">${t('abt_cta_heading')}</h2>
          <p style="font-size: var(--text-base); opacity: 0.95; max-width: 560px; margin: 0 auto var(--space-6);">
            ${t('abt_cta_desc')}
          </p>
          <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
            <a href="#/booking" class="btn btn--lg" style="background: white; color: var(--earth-800); font-weight: 700;">${t('abt_cta_booking')}</a>
            <a href="#/layanan" class="btn btn--ghost btn--lg" style="border-color: white; color: white;">${t('abt_cta_services')}</a>
          </div>
        </div>

      </div>
    </section>
  `;
}
