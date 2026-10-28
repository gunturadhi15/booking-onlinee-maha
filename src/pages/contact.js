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
        
        <div class="contact__grid">
          
          <!-- Kontak Info -->
          <div class="fade-in-left">
            <h2 class="heading-2 font-serif" style="margin-bottom: var(--space-4); font-size: var(--text-2xl);">${t('con_info_title')}</h2>
            <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-6);">
              ${t('con_info_desc')}
            </p>

            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: white; border: 1px solid var(--border-hairline); border-radius: var(--radius-lg);">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-silk); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h3 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-onyx); margin: 0;">${t('con_office')}</h3>
                  <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">${COMPANY.address}</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: white; border: 1px solid var(--border-hairline); border-radius: var(--radius-lg);">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-silk); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </div>
                <div>
                  <h3 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-onyx); margin: 0;">${t('con_wa_care')}</h3>
                  <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">${COMPANY.phone} ${t('con_wa_hours')}</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: white; border: 1px solid var(--border-hairline); border-radius: var(--radius-lg);">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--surface-silk); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h3 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-onyx); margin: 0;">${t('con_email_official')}</h3>
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
              <h2 class="heading-2 font-serif" style="margin-bottom: var(--space-4); font-size: var(--text-xl);">${t('con_form_title')}</h2>
              
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

  // Handle form submit with elegant inline feedback
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name')?.value.trim() || 'Tamu';
      const wa = document.getElementById('cf-wa')?.value.trim() || '';
      const msg = document.getElementById('cf-msg')?.value.trim() || '';

      const waText = encodeURIComponent(
        `Halo Concierge Mahawellnerjourney,\n` +
        `Nama: ${name}\n` +
        (wa ? `WhatsApp: ${wa}\n` : '') +
        `Pesan: ${msg}`
      );
      const waLink = `https://wa.me/${(COMPANY.whatsapp || '6281234567890').replace(/\D/g, '')}?text=${waText}`;

      form.innerHTML = `
        <div style="background: var(--surface-silk); border: 1.5px solid var(--gold-maha); border-radius: var(--radius-lg); padding: var(--space-6); text-align: center;" class="fade-in">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #E8F5E9; color: #2E7D32; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--text-onyx); margin-bottom: var(--space-2);">
            Pesan Anda Telah Diterima
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-stone); line-height: 1.6; margin-bottom: var(--space-5);">
            Terima kasih, <strong>${name}</strong>. Tim concierge kami akan merespons pertanyaan Anda sesegera mungkin. Anda juga dapat melanjutkan percakapan langsung via WhatsApp resmi kami.
          </p>
          <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
            <a href="${waLink}" target="_blank" class="btn btn--primary btn--sm" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Lanjut via WhatsApp
            </a>
            <button type="button" class="btn btn--secondary btn--sm" id="btn-reset-contact-form">
              Kirim Pesan Lain
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-reset-contact-form')?.addEventListener('click', () => {
        const container = document.getElementById('page-content');
        if (container) {
          container.innerHTML = renderContact();
          initContact();
        }
      });
    });
  }
}
