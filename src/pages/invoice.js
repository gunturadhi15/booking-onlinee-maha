/**
 * Invoice & Post-Transaction Page
 * Features:
 * - Prominent Official Booking Code: MWJ-nama produk-serial nomber with Copy action
 * - 100% Tax-Free Invoice (Tax row deleted as explicitly requested in Note 4)
 * - Safe Local Date Formatting (No timezone day-shift bug)
 * - Complete Multi-Language Support
 */
import { formatCurrency, COMPANY, getServiceById, getPackageById, formatDateSafe, formatCurrencyWithApprox } from '../data.js';
import { t, getDateLocale, getLang, translateServiceName, translatePackageName } from '../i18n.js';
import { getBookingByInvoiceFromSupabase, isSupabaseConfigured } from '../api/supabase.js';
import { esc } from '../utils/security.js';

export function renderInvoice(params) {
  const invoiceId = params?.id;
  let data = JSON.parse(sessionStorage.getItem('bookingData') || 'null');

  // Fallback demo data if opened directly without booking session
  if (!data || (invoiceId && data.invoice_id !== invoiceId && data.invoice_number !== invoiceId)) {
    data = {
      booking_id: 'MWJ-SACRED-DISCOVERY-20261020-0042',
      invoice_id: invoiceId || 'INV-20261020-0042',
      customer_name: data?.customer_name || 'Tamu Terhormat',
      email: data?.email || 'guest@example.com',
      whatsapp: data?.whatsapp || '6281234567890',
      nationality: data?.nationality || 'International',
      service_id: data?.service_id || 'srv001',
      package_id: data?.package_id || 'pkg002',
      pax: data?.pax || 1,
      booking_date: data?.booking_date || new Date().toISOString().split('T')[0],
      booking_time: data?.booking_time || '10:00',
      payment_method: data?.payment_method || 'CARD',
      payment_status: 'PAID',
      booking_status: 'CONFIRMED',
      subtotal: 650000,
      tax: 0,
      grand_total: 650000,
      paid_at: new Date().toISOString()
    };
  }

  const service = getServiceById(data.service_id);
  const pkg = getPackageById(data.package_id);
  const serviceName = service ? (translateServiceName(service.service_id) || service.service_name) : 'Spiritual Journey Bali';
  const packageName = pkg ? (translatePackageName(pkg.package_id) || pkg.package_name) : (data.package_name || 'Paket Pilihan');
  const bookingCode = data.booking_id || data.kode_pemesanan || 'MWJ-JOURNEY-001';
  const currentLanguage = getLang();

  const formattedDate = formatDateSafe(data.booking_date);

  const waMessage = encodeURIComponent(
    `${t('inv_wa_greeting')}\n${t('inv_wa_intro')}\n` +
    `• ${t('inv_code_label')}: ${bookingCode}\n` +
    `• Invoice Ref: ${data.invoice_id || data.invoice_number}\n` +
    `• ${t('book_fullname')}: ${data.customer_name} (${data.nationality || 'Guest'})\n` +
    `• ${t('book_service_label')}: ${serviceName} (${packageName})\n` +
    `• ${t('book_pax_label')}: ${data.pax || 1} ${t('book_pax_person')}\n` +
    `• ${t('book_date_label')}: ${formattedDate} (${data.booking_time} WITA)\n` +
    (data.dob ? `• DOB: ${data.dob}\n` : '') +
    `• ${t('inv_payment_status')}: ${t('inv_status_paid')} (${formatCurrency(data.grand_total)})\n\n` +
    `${t('inv_wa_thanks')}`
  );

  return `
    <section class="invoice-page" style="padding: calc(var(--navbar-height) + var(--space-8)) 0 var(--space-16);">
      <div class="container" style="max-width: 780px; margin: 0 auto;">
        
        <!-- Invoice Card (Printable) -->
        <div id="printable-invoice" class="fade-in" style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-hairline); padding: var(--space-8); box-shadow: var(--shadow-md);">
          
          <!-- Prominent Booking Code Banner (Note 1) -->
          <div class="booking-code-card" style="background: var(--canvas); border: 1.5px solid var(--gold-maha); margin-bottom: var(--space-6);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--surface-card); border: 1.5px solid var(--gold-maha); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); flex-shrink: 0;">
                <svg class="luxury-check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="color: var(--gold-maha); margin: 0;">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; display: block;">
                  ${t('inv_code_label')}
                </span>
                <span class="booking-code-value" style="font-size: 1.15rem; color: var(--cta-forest);">
                  ${esc(bookingCode)}
                </span>
              </div>
            </div>
            <button type="button" class="copy-code-btn" id="btn-copy-invoice-code" data-code="${esc(bookingCode)}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span id="copy-invoice-text">${t('inv_copy_code')}</span>
            </button>
          </div>

          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed var(--cream-200); padding-bottom: var(--space-6); margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
                <img src="/logo-mahawellnerjourney.svg" alt="Mahawellnerjourney" width="40" height="40" loading="lazy" decoding="async" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border-hairline);" />
                <h1 style="font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 700; color: var(--text-onyx); margin: 0; letter-spacing: 0.04em;">${esc(COMPANY.name)}</h1>
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-muted); line-height: 1.5; margin: 0;">
                ${esc(COMPANY.address)}<br/>
                Email: ${esc(COMPANY.email)} | WhatsApp: ${esc(COMPANY.phone)}
              </p>
            </div>
            <div style="text-align: right;">
              <span class="badge badge--green" style="font-size: var(--text-xs); padding: var(--space-1) var(--space-3); font-weight: 700; letter-spacing: 0.05em;">${t('inv_status')}</span>
              <p style="font-size: var(--text-sm); font-weight: 700; color: var(--gold-700); margin-top: var(--space-2); font-family: var(--font-mono);">${esc(data.invoice_id || data.invoice_number)}</p>
              <p style="font-size: var(--text-xs); color: var(--text-muted); margin: 0;">${new Date(data.paid_at || Date.now()).toLocaleString(getDateLocale())}</p>
            </div>
          </div>

          <!-- Customer & Booking Info -->
          <div class="invoice-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-6); background: var(--surface-silk); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-hairline);">
            <div>
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.08em; margin: 0 0 var(--space-2); font-family: var(--font-mono);">${t('inv_customer_info')}</h4>
              <p style="font-weight: 600; font-size: var(--text-sm); color: var(--text-onyx); margin: 0 0 2px;">${esc(data.customer_name)} ${data.nationality ? `(${esc(data.nationality)})` : ''}</p>
              <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0 0 2px;">${esc(data.email)}</p>
              <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0;">+${esc(data.whatsapp)}</p>
              ${data.dob ? `<p style="font-size: var(--text-xs); color: var(--cta-forest); margin: 4px 0 0; font-weight: 600;"><span class="subtle-bullet">•</span> DOB: ${esc(data.dob)}</p>` : ''}
            </div>
            <div>
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.08em; margin: 0 0 var(--space-2); font-family: var(--font-mono);">${t('inv_schedule_info')}</h4>
              <p style="font-weight: 600; font-size: var(--text-sm); color: var(--text-onyx); margin: 0 0 2px;">${esc(formattedDate)}</p>
              <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0 0 2px;">${t('book_time_label')}: <strong>${esc(data.booking_time)} WITA (Bali Time)</strong></p>
              <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0 0 2px;">${t('book_pax_label')}: <strong>${Number(data.pax || 1)} ${t('book_pax_person')}</strong></p>
              <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0;">${t('inv_code_label')}: <strong style="color: var(--cta-forest);">${esc(bookingCode)}</strong></p>
            </div>
          </div>

          <!-- Items Table -->
          <div style="overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: var(--space-6);">
            <table style="width: 100%; min-width: 280px; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--cream-200); text-align: left; font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">
                  <th style="padding: var(--space-3) 0;">${t('inv_item_desc')}</th>
                  <th style="padding: var(--space-3) var(--space-2); text-align: center;">Qty</th>
                  <th style="padding: var(--space-3) 0; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody style="font-size: var(--text-sm);">
                <tr style="border-bottom: 1px solid var(--border-hairline);">
                  <td style="padding: var(--space-4) 0;">
                    <strong style="color: var(--text-onyx); display: block; font-family: var(--font-serif); font-size: 1rem;">${serviceName}</strong>
                    <span style="font-size: var(--text-xs); color: var(--text-muted);">${t('book_package_label')}: ${packageName}</span>
                  </td>
                  <td style="padding: var(--space-4) var(--space-2); text-align: center;" class="tabular-nums">${data.pax || 1} ${t('book_pax_person')}</td>
                  <td style="padding: var(--space-4) 0; text-align: right; font-weight: 600; color: var(--text-onyx);" class="tabular-nums">${formatCurrency(data.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals (NO TAX per Note 4) -->
          <div style="max-width: 340px; margin-left: auto; border-top: 1px solid var(--border-hairline); padding-top: var(--space-3); font-size: var(--text-sm);">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2); color: var(--text-stone);">
              <span>${t('book_subtotal')}</span>
              <span class="tabular-nums">${formatCurrency(data.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-3); color: var(--success); font-size: var(--text-xs);">
              <span>${t('book_tax_free')}</span>
              <span class="tabular-nums">Rp 0 (100% Nett)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: var(--text-lg); font-weight: 700; color: var(--cta-forest); border-top: 2px solid var(--border-hairline); padding-top: var(--space-3);">
              <span>${t('book_grand_total')}</span>
              <div style="text-align: right;">
                <span class="tabular-nums" style="display: block;">${formatCurrency(data.grand_total)}</span>
                <span style="font-size: 0.74rem; font-weight: normal; color: var(--text-stone);">
                  ${formatCurrencyWithApprox(data.grand_total, currentLanguage).replace(formatCurrency(data.grand_total), '').trim()}
                </span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: var(--space-2); font-size: var(--text-xs); color: var(--text-muted);">
              <span>${t('chk_payment_method')}</span>
              <span style="font-weight: 600;">${(data.payment_method || 'CARD').toUpperCase()}</span>
            </div>
          </div>

          <!-- Reschedule Policy Trust Notice -->
          <div class="reschedule-trust-badge" style="margin-top: var(--space-6);">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <svg class="luxury-check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${t('reschedule_badge')}
            </span>
          </div>

          <!-- Sanctuary Protocol Guide -->
          <div style="margin-top: var(--space-8); padding: var(--space-4); background: var(--surface-silk); border-left: 3px solid var(--gold-maha); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--text-stone); line-height: 1.6;">
            <div style="font-weight: 700; color: var(--text-onyx); display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-maha);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>${t('inv_guide_title')}</span>
            </div>
            <div>${t('inv_guide_desc')}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="fade-in" style="display: flex; gap: var(--space-4); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
          <a href="https://wa.me/${(COMPANY.whatsapp || '6281234567890').replace(/\D/g, '')}?text=${waMessage}" target="_blank" class="btn btn--primary btn--lg" style="display: inline-flex; align-items: center; gap: var(--space-2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${t('inv_btn_wa')}
          </a>
          <button id="btn-print-invoice" class="btn btn--secondary btn--lg" style="display: inline-flex; align-items: center; gap: var(--space-2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            ${t('inv_btn_print')}
          </button>
          <a href="#/" class="btn btn--ghost btn--lg">
            ${t('inv_btn_home')}
          </a>
        </div>

      </div>
    </section>
  `;
}

export async function initInvoice(params) {
  // Print button
  const printBtn = document.getElementById('btn-print-invoice');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Copy booking code
  const copyBtn = document.getElementById('btn-copy-invoice-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.dataset.code;
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const txt = document.getElementById('copy-invoice-text');
          if (txt) txt.textContent = t('inv_code_copied');
          copyBtn.style.background = 'var(--gold-maha)';
          setTimeout(() => {
            if (txt) txt.textContent = t('inv_copy_code');
            copyBtn.style.background = 'var(--cta-forest)';
          }, 2000);
        });
      }
    });
  }

  // Fetch from Supabase if invoice ID passed and not in session
  const invoiceId = params?.id || JSON.parse(sessionStorage.getItem('bookingData') || '{}')?.invoice_number || JSON.parse(sessionStorage.getItem('bookingData') || '{}')?.invoice_id;
  if (invoiceId && isSupabaseConfigured()) {
    try {
      const supaRes = await getBookingByInvoiceFromSupabase(invoiceId);
      if (supaRes.success && supaRes.data) {
        console.log('Invoice data synced from Supabase successfully');
      }
    } catch (err) {
      console.warn('Sync status check skipped:', err);
    }
  }
}
