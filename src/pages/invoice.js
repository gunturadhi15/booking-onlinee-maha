/**
 * Invoice & Post-Transaction Page
 */
import { formatCurrency, COMPANY, getServiceById, getPackageById } from '../data.js';
import { t, getDateLocale } from '../i18n.js';

export function renderInvoice(params) {
  const invoiceId = params?.id;
  let data = JSON.parse(sessionStorage.getItem('bookingData') || 'null');

  // Fallback demo data if opened directly without booking session
  if (!data || (invoiceId && data.invoice_id !== invoiceId)) {
    data = {
      booking_id: 'BK-20261008-8821',
      invoice_id: invoiceId || 'INV-20261008-8821',
      customer_name: data?.customer_name || 'Tamu Terhormat',
      email: data?.email || 'guest@example.com',
      whatsapp: data?.whatsapp || '081234567890',
      service_id: data?.service_id || 'srv-001',
      package_id: data?.package_id || 'pkg-002',
      booking_date: data?.booking_date || new Date().toISOString().split('T')[0],
      booking_time: data?.booking_time || '10:00',
      payment_method: data?.payment_method || 'QRIS Instan',
      payment_status: 'PAID',
      booking_status: 'CONFIRMED',
      subtotal: 1250000,
      tax: 137500,
      grand_total: 1387500,
      paid_at: new Date().toISOString()
    };
  }

  const service = getServiceById(data.service_id);
  const pkg = getPackageById(data.package_id);
  const srvKey = service ? service.service_id.toLowerCase() : 'srv_001';
  const serviceName = service ? (t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name) : 'Spiritual Journey Bali';
  const packageName = pkg ? pkg.package_name : 'Paket Pilihan';

  const formattedDate = new Date(data.booking_date).toLocaleDateString(getDateLocale(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const waMessage = encodeURIComponent(
    `${t('inv_wa_greeting')} ${COMPANY.name},\n${t('inv_wa_intro')}\n` +
    `• Invoice: ${data.invoice_id}\n` +
    `• Booking ID: ${data.booking_id}\n` +
    `• ${t('book_fullname')}: ${data.customer_name}\n` +
    `• ${t('book_service_label')}: ${serviceName} (${packageName})\n` +
    `• ${t('book_date_label')}: ${formattedDate} ${t('book_time_label')} ${data.booking_time}\n` +
    `• ${t('inv_payment_status')}: ${t('inv_status_paid')} (${formatCurrency(data.grand_total)})\n\n${t('inv_wa_thanks')}`
  );

  return `
    <section class="invoice-page" style="padding: calc(var(--navbar-height) + var(--space-8)) 0 var(--space-16);">
      <div class="container" style="max-width: 760px; margin: 0 auto;">
        
        <!-- Status Banner -->
        <div class="fade-in" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: var(--radius-xl); padding: var(--space-6); text-align: center; margin-bottom: var(--space-8); box-shadow: var(--shadow-lg);">
          <div style="font-size: 40px; margin-bottom: var(--space-2);">✨ 🙏 ✨</div>
          <h1 style="font-size: var(--text-2xl); font-weight: 700; color: white; margin-bottom: var(--space-2);">${t('inv_success_title')}</h1>
          <p style="font-size: var(--text-sm); opacity: 0.95; max-width: 500px; margin: 0 auto;">
            ${t('inv_success_desc').replace('{name}', `<strong>${data.customer_name}</strong>`)}
          </p>
        </div>

        <!-- Invoice Card (Printable) -->
        <div id="printable-invoice" class="fade-in" style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--cream-300); padding: var(--space-8); box-shadow: var(--shadow-md);">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed var(--cream-200); padding-bottom: var(--space-6); margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                <span style="font-size: var(--text-2xl); color: var(--gold-600);">☸</span>
                <span style="font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 700; color: var(--earth-800);">${COMPANY.name}</span>
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-muted); line-height: 1.5;">
                ${COMPANY.address}<br/>
                Email: ${COMPANY.email} | WA: ${COMPANY.phone}
              </p>
            </div>
            <div style="text-align: right;">
              <span class="badge badge--green" style="font-size: var(--text-xs); padding: var(--space-1) var(--space-3); font-weight: 700; letter-spacing: 0.05em;">LUNAS / CONFIRMED</span>
              <p style="font-size: var(--text-sm); font-weight: 700; color: var(--gold-700); margin-top: var(--space-2);">${data.invoice_id}</p>
              <p style="font-size: var(--text-xs); color: var(--text-muted);">${new Date(data.paid_at || Date.now()).toLocaleString(getDateLocale())}</p>
            </div>
          </div>

          <!-- Customer & Booking Info -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-6); background: var(--cream-50); padding: var(--space-4); border-radius: var(--radius-lg);">
            <div>
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: var(--space-2);">${t('inv_customer_info')}</h4>
              <p style="font-weight: 600; font-size: var(--text-sm); color: var(--earth-800);">${data.customer_name}</p>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">${data.email}</p>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">${data.whatsapp}</p>
            </div>
            <div>
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: var(--space-2);">${t('inv_schedule_info')}</h4>
              <p style="font-weight: 600; font-size: var(--text-sm); color: var(--earth-800);">${formattedDate}</p>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">${t('book_time_label')}: <strong>${data.booking_time} WITA</strong></p>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">Booking ID: <strong>${data.booking_id}</strong></p>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: var(--space-6);">
            <thead>
              <tr style="border-bottom: 2px solid var(--cream-200); text-align: left; font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">
                <th style="padding: var(--space-3) 0;">${t('inv_item_desc')}</th>
                <th style="padding: var(--space-3) var(--space-2); text-align: center;">Qty</th>
                <th style="padding: var(--space-3) 0; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody style="font-size: var(--text-sm);">
              <tr style="border-bottom: 1px solid var(--cream-100);">
                <td style="padding: var(--space-4) 0;">
                  <strong style="color: var(--earth-800); display: block;">${serviceName}</strong>
                  <span style="font-size: var(--text-xs); color: var(--text-muted);">${t('book_package_label')}: ${packageName}</span>
                </td>
                <td style="padding: var(--space-4) var(--space-2); text-align: center;">1 ${t('inv_session')}</td>
                <td style="padding: var(--space-4) 0; text-align: right; font-weight: 600; color: var(--earth-800);">${formatCurrency(data.subtotal)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div style="max-width: 300px; margin-left: auto; border-top: 1px solid var(--cream-200); padding-top: var(--space-3); font-size: var(--text-sm);">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2); color: var(--text-secondary);">
              <span>${t('book_subtotal')}</span>
              <span>${formatCurrency(data.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-3); color: var(--text-secondary);">
              <span>${t('book_tax')}</span>
              <span>${formatCurrency(data.tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: var(--text-lg); font-weight: 700; color: var(--gold-700); border-top: 2px solid var(--cream-300); padding-top: var(--space-3);">
              <span>${t('book_grand_total')}</span>
              <span>${formatCurrency(data.grand_total)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: var(--space-2); font-size: var(--text-xs); color: var(--text-muted);">
              <span>${t('chk_payment_method')}</span>
              <span>${(data.payment_method || 'QRIS').toUpperCase()}</span>
            </div>
          </div>

          <!-- Note -->
          <div style="margin-top: var(--space-8); padding: var(--space-4); background: var(--gold-50); border-left: 3px solid var(--gold-500); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--earth-700); line-height: 1.6;">
            <strong>📌 ${t('inv_guide_title')}</strong><br/>
            ${t('inv_guide_desc')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="fade-in" style="display: flex; gap: var(--space-4); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
          <a href="https://wa.me/${COMPANY.whatsapp.replace(/\D/g, '')}?text=${waMessage}" target="_blank" class="btn btn--primary btn--lg" style="display: inline-flex; align-items: center; gap: var(--space-2);">
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

export function initInvoice() {
  const printBtn = document.getElementById('btn-print-invoice');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
