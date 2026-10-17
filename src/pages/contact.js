/**
 * Contact & FAQ Page
 */
import { COMPANY, FAQ } from '../data.js';
import { t } from '../i18n.js';

export function renderContact() {
  return `
    <section class="page-hero">
      <div class="container">
        <span class="overline">${t('con_overline')}</span>
        <h1 class="heading-1">${t('con_heading')}</h1>
        <div class="divider-gold"></div>
        <p class="subtitle">${t('con_subtitle')}</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width: 960px; margin: 0 auto;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); margin-bottom: var(--space-12);" class="checkout__grid">
          
          <!-- Kontak Info -->
          <div class="fade-in-left">
            <h3 class="heading-3" style="margin-bottom: var(--space-4);">${t('con_info_title')}</h3>
            <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-6);">
              ${t('con_info_desc')}
            </p>

            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: white; border: 1px solid var(--border-hairline); border-radius: var(--radius-lg);">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-silk); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-onyx);">${t('con_office')}</h4>
                  <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">${COMPANY.address}</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: white; border: 1px solid var(--border-hairline); border-radius: var(--radius-lg);">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-silk); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </div>
                <div>
                  <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-onyx);">${t('con_wa_care')}</h4>
                  <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">${COMPANY.phone} ${t('con_wa_hours')}</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: white; border: 1px solid var(--border-hairline); border-radius: var(--radius-lg);">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-silk); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-onyx);">${t('con_email_official')}</h4>
                  <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">${COMPANY.email}</p>
                </div>
              </div>
            </div>

            <a href="https://wa.me/${(COMPANY.whatsapp || '6281234567890').replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(COMPANY.name)},%20saya%20ingin%20bertanya%20seputar%20booking" 
               target="_blank" class="btn btn--primary btn--lg" style="margin-top: var(--space-6); width: 100%; text-align: center;">
              ${t('con_chat_wa')}
            </a>
          </div>

          <!-- Quick Message Form -->
          <div class="fade-in-right">
            <div style="background: white; border: 1px solid var(--cream-200); border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-sm);">
              <h3 class="heading-3" style="margin-bottom: var(--space-4); font-size: var(--text-xl);">${t('con_form_title')}</h3>
              
              <form id="contact-form">
                <div class="form-group">
                  <label class="form-label" for="cf-name">${t('con_form_name')}</label>
                  <input type="text" id="cf-name" class="form-input" placeholder="${t('con_form_name_placeholder')}" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="cf-wa">${t('con_form_wa')}</label>
                  <input type="tel" id="cf-wa" class="form-input" placeholder="08xxxxxxxxxx" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="cf-msg">${t('con_form_msg')}</label>
                  <textarea id="cf-msg" class="form-input" rows="4" placeholder="${t('con_form_msg_placeholder')}" required></textarea>
                </div>
                <button type="submit" class="btn btn--primary" style="width: 100%;">
                  ${t('con_form_send')}
                </button>
              </form>
            </div>
          </div>

        </div>

        <!-- FAQ Section -->
        <div class="fade-in" style="margin-top: var(--space-12);">
          <div class="section__header">
            <span class="overline">${t('con_faq_overline')}</span>
            <h2 class="heading-2">${t('con_faq_heading')}</h2>
            <div class="divider-gold"></div>
          </div>

          <div style="max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-3);" id="faq-accordion">
            ${FAQ.map((item, idx) => {
              const faqQ = t(`data_faq${String(idx + 1).padStart(3, '0')}_q`);
              const faqA = t(`data_faq${String(idx + 1).padStart(3, '0')}_a`);
              const question = faqQ !== `data_faq${String(idx + 1).padStart(3, '0')}_q` ? faqQ : item.question;
              const answer = faqA !== `data_faq${String(idx + 1).padStart(3, '0')}_a` ? faqA : item.answer;
              return `
              <div class="faq-item" style="background: white; border: 1px solid var(--cream-200); border-radius: var(--radius-lg); overflow: hidden; transition: var(--transition);">
                <button class="faq-toggle" style="width: 100%; text-align: left; padding: var(--space-4) var(--space-5); background: none; border: none; font-size: var(--text-base); font-weight: 600; color: var(--earth-800); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                  <span>${question}</span>
                  <span class="faq-icon" style="font-size: var(--text-xl); transition: transform 0.2s;">+</span>
                </button>
                <div class="faq-content" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; padding: 0 var(--space-5);">
                  <p style="padding-bottom: var(--space-4); font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6;">${answer}</p>
                </div>
              </div>
            `}).join('')}
          </div>
        </div>

      </div>
    </section>
  `;
}

export function initContact() {
  const toggles = document.querySelectorAll('.faq-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const content = parent.querySelector('.faq-content');
      const icon = parent.querySelector('.faq-icon');
      const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

      // Close all
      document.querySelectorAll('.faq-content').forEach(c => c.style.maxHeight = '0px');
      document.querySelectorAll('.faq-icon').forEach(i => {
        i.textContent = '+';
        i.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.textContent = '−';
      }
    });
  });

  // Handle form submit
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert(t('con_form_success'));
    });
  }
}
