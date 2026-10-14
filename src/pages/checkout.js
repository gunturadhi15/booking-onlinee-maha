/**
 * Checkout Page
 */
import { getServiceById, getPackageById, formatCurrency, SETTINGS } from '../data.js';
import { t, getDateLocale } from '../i18n.js';
import { updateBookingStatusInSupabase } from '../api/supabase.js';
import { resetBooking } from './booking.js';

export function renderCheckout() {
  const data = JSON.parse(sessionStorage.getItem('bookingData') || 'null');

  if (!data) {
    return `
      <section class="section" style="text-align: center; padding-top: calc(var(--navbar-height) + var(--space-16));">
        <div class="container">
          <h1 class="heading-2">${t('chk_no_order_title')}</h1>
          <p class="subtitle" style="margin: var(--space-4) auto var(--space-8);">${t('chk_no_order_desc')}</p>
          <a href="#/booking" class="btn btn--primary">${t('chk_no_order_btn')}</a>
        </div>
      </section>
    `;
  }

  const service = getServiceById(data.service_id);
  const pkg = getPackageById(data.package_id);

  if (!service || !pkg) {
    return `
      <section class="section" style="text-align: center; padding-top: calc(var(--navbar-height) + var(--space-16));">
        <div class="container">
          <h1 class="heading-2">${t('chk_invalid_data_title')}</h1>
          <p class="subtitle" style="margin: var(--space-4) auto var(--space-8);">${t('chk_invalid_data_desc')}</p>
          <a href="#/booking" class="btn btn--primary">${t('chk_no_order_btn')}</a>
        </div>
      </section>
    `;
  }

  const expiredAt = new Date(data.expired_at);
  const srvKey = service.service_id.toLowerCase();
  const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;

  return `
    <section class="checkout-page">
      <div class="container">
        <div class="section__header fade-in">
          <span class="overline">${t('chk_overline')}</span>
          <h1 class="heading-2">${t('chk_heading')}</h1>
          <div class="divider-gold"></div>
        </div>

        <div class="checkout__grid">
          <!-- Payment Method -->
          <div class="fade-in-left">
            <!-- Booking Info -->
            <div style="background: var(--gold-50); padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-3);">
              <span style="font-size: var(--text-xl);">⏳</span>
              <div>
                <p style="font-size: var(--text-sm); font-weight: 600;">${t('chk_countdown_text')}</p>
                <p style="font-size: var(--text-sm); color: var(--gold-700); font-weight: 700;" id="countdown-timer">
                  ${expiredAt.toLocaleString(getDateLocale())}
                </p>
              </div>
            </div>

            <h3 style="font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-5);">
              ${t('chk_payment_method')}
            </h3>

            <div class="payment-methods" id="payment-methods">
              <div class="payment-method selected" data-method="qris">
                <div class="payment-method__radio"></div>
                <div style="font-size: var(--text-2xl);">📱</div>
                <div class="payment-method__info">
                  <h4>QRIS</h4>
                  <p>${t('chk_method_qris')}</p>
                </div>
              </div>
              
              <div class="payment-method" data-method="va">
                <div class="payment-method__radio"></div>
                <div style="font-size: var(--text-2xl);">🏦</div>
                <div class="payment-method__info">
                  <h4>Virtual Account</h4>
                  <p>${t('chk_method_va')}</p>
                </div>
              </div>
              
              <div class="payment-method" data-method="card">
                <div class="payment-method__radio"></div>
                <div style="font-size: var(--text-2xl);">💳</div>
                <div class="payment-method__info">
                  <h4>Kartu Debit / Kredit</h4>
                  <p>${t('chk_method_card')}</p>
                </div>
              </div>
            </div>

            <button class="btn btn--primary btn--lg" id="pay-now" style="width: 100%; margin-top: var(--space-8);">
              ${t('chk_pay_now')} — ${formatCurrency(data.grand_total)}
            </button>
            
            <p style="text-align: center; font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-4);">
              🔒 ${t('chk_secure_payment')}
            </p>
          </div>

          <!-- Order Summary -->
          <div class="fade-in-right">
            <div class="booking-summary" style="position: static;">
              <h3 class="booking-summary__title">${t('chk_summary_title')}</h3>
              
              <div style="background: var(--cream-100); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-4); font-size: var(--text-xs);">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Booking ID</span>
                  <span style="font-weight: 700; color: var(--gold-700);">${data.booking_id}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: var(--space-1);">
                  <span style="color: var(--text-muted);">Invoice</span>
                  <span style="font-weight: 700; color: var(--gold-700);">${data.invoice_id}</span>
                </div>
              </div>

              <div class="booking-summary__row">
                <span class="label">${t('book_service_label')}</span>
                <span class="value">${srvName}</span>
              </div>
              <div class="booking-summary__row">
                <span class="label">${t('book_package_label')}</span>
                <span class="value">${pkg.package_name}</span>
              </div>
              <div class="booking-summary__row">
                <span class="label">${t('book_date_label')}</span>
                <span class="value">${new Date(data.booking_date).toLocaleDateString(getDateLocale(), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="booking-summary__row">
                <span class="label">${t('book_time_label')}</span>
                <span class="value">${data.booking_time}</span>
              </div>
              
              <div style="margin: var(--space-4) 0; padding: var(--space-3); background: var(--cream-100); border-radius: var(--radius-md);">
                <p style="font-size: var(--text-xs); font-weight: 600; margin-bottom: var(--space-1);">${t('book_customer_label')}</p>
                <p style="font-size: var(--text-xs); color: var(--text-secondary);">${data.customer_name}</p>
                <p style="font-size: var(--text-xs); color: var(--text-secondary);">${data.email}</p>
                <p style="font-size: var(--text-xs); color: var(--text-secondary);">${data.whatsapp}</p>
              </div>

              <div class="booking-summary__row">
                <span class="label">${t('book_subtotal')}</span>
                <span class="value">${formatCurrency(data.subtotal)}</span>
              </div>
              <div class="booking-summary__row">
                <span class="label">${t('book_tax')} (${SETTINGS.tax_rate * 100}%)</span>
                <span class="value">${formatCurrency(data.tax)}</span>
              </div>
              <div class="booking-summary__total">
                <span class="label">${t('book_grand_total')}</span>
                <span class="value">${formatCurrency(data.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initCheckout() {
  // Payment method selection
  const methods = document.querySelectorAll('.payment-method');
  methods.forEach(method => {
    method.addEventListener('click', () => {
      methods.forEach(m => m.classList.remove('selected'));
      method.classList.add('selected');
    });
  });

  // Pay button
  const payBtn = document.getElementById('pay-now');
  if (payBtn) {
    payBtn.addEventListener('click', async () => {
      const data = JSON.parse(sessionStorage.getItem('bookingData') || 'null');
      if (!data) return;

      // Indikator Loading
      payBtn.disabled = true;
      const originalBtnText = payBtn.innerHTML;
      payBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        ${t('chk_processing')}
      `;

      try {
        const selectedMethod = document.querySelector('.payment-method.selected');
        const paymentMethod = selectedMethod?.dataset.method || 'qris';
        const invoiceNumber = data.invoice_number || data.invoice_id;

        // Simulasi proses gateway 1.5 detik
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update status pembayaran di Supabase menjadi 'paid'
        if (invoiceNumber) {
          const updateRes = await updateBookingStatusInSupabase(invoiceNumber, 'paid');
          if (!updateRes.success && !updateRes.simulated) {
            console.warn('Perhatian: Gagal memperbarui status di Supabase:', updateRes.error);
          }
        }

        data.payment_method = paymentMethod;
        data.payment_status = 'PAID';
        data.status = 'paid';
        data.booking_status = 'CONFIRMED';
        data.paid_at = new Date().toISOString();
        data.transaction_id = 'TRX' + Date.now();

        sessionStorage.setItem('bookingData', JSON.stringify(data));
        resetBooking();
        window.location.hash = `/invoice/${invoiceNumber}`;
      } catch (err) {
        console.error('Error saat pemrosesan pembayaran:', err);
        alert('Terjadi kendala saat memproses pembayaran. Silakan coba kembali.');
        payBtn.disabled = false;
        payBtn.innerHTML = originalBtnText;
      }
    });
  }
}
