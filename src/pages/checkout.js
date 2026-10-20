/**
 * Checkout Page
 * Features:
 * - Prominent Booking Code: MWJ-nama produk-serial nomber with Copy button
 * - Zero Tax (Grand Total = Subtotal per Note 4)
 * - Live Real-Time Countdown Timer (Bug Fix)
 * - Safe Local Date Formatting
 * - Multi-Language support
 */
import { getServiceById, getPackageById, formatCurrency, formatDateSafe, formatCurrencyWithApprox } from '../data.js';
import { t, getDateLocale, getLang } from '../i18n.js';
import { updateBookingStatusInSupabase } from '../api/supabase.js';
import { resetBooking } from './booking.js';

let countdownInterval = null;

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

  const srvKey = service.service_id.toLowerCase();
  const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;
  const bookingCode = data.booking_id || data.kode_pemesanan || 'MWJ-JOURNEY-001';
  const currentLanguage = getLang();
  const selectedMethod = data.payment_method || 'card';

  return `
    <section class="checkout-page">
      <div class="container">
        <div class="section__header fade-in">
          <span class="overline">${t('chk_overline')}</span>
          <h1 class="heading-2">${t('chk_heading')}</h1>
          <div class="divider-gold"></div>
        </div>

        <!-- Prominent Official Booking Code Card (Note 1) -->
        <div class="booking-code-card fade-in" style="max-width: 960px; margin: 0 auto var(--space-8);">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--surface-silk); border: 1.5px solid var(--gold-maha); display: flex; align-items: center; justify-content: center; color: var(--gold-maha); font-size: 1.2rem; flex-shrink: 0;">
              ✦
            </div>
            <div>
              <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em;">
                ${t('chk_booking_code')}
              </span>
              <p class="booking-code-value" id="display-booking-code" style="margin: 2px 0 0;">
                ${bookingCode}
              </p>
            </div>
          </div>
          <button type="button" class="copy-code-btn" id="btn-copy-checkout-code" data-code="${bookingCode}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span id="copy-btn-text">${t('inv_copy_code')}</span>
          </button>
        </div>

        <div class="checkout__grid">
          <!-- Payment Method -->
          <div class="fade-in-left">
            <!-- Countdown Ticker Box -->
            <div style="background: var(--surface-silk); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-3);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha); flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <p style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 2px;">
                  ${t('chk_countdown_text')}
                </p>
                <p style="font-size: var(--text-base); color: var(--cta-forest); font-family: var(--font-mono); font-weight: 700; margin: 0;" id="countdown-timer">
                  --:--:--
                </p>
              </div>
            </div>

            <h3 style="font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-5);">
              ${t('pay_method_title')}
            </h3>

            <!-- Payment Methods (Section 4.2: Card, PayPal, QRIS) -->
            <div class="payment-methods" id="payment-methods">
              
              <!-- 1. International Credit/Debit Card -->
              <div class="payment-method ${selectedMethod === 'card' ? 'selected' : ''}" data-method="card">
                <div class="payment-method__radio"></div>
                <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--surface-silk); border-radius: var(--radius-sm); color: var(--gold-maha);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <div class="payment-method__info">
                  <h4>${t('pay_method_card')}</h4>
                  <p>${t('pay_method_card_desc')}</p>
                </div>
              </div>

              <!-- 2. PayPal International -->
              <div class="payment-method ${selectedMethod === 'paypal' ? 'selected' : ''}" data-method="paypal">
                <div class="payment-method__radio"></div>
                <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--surface-silk); border-radius: var(--radius-sm); color: #003087; font-weight: 800; font-style: italic; font-size: 1.15rem;">
                  P
                </div>
                <div class="payment-method__info">
                  <h4>${t('pay_method_paypal')}</h4>
                  <p>${t('pay_method_paypal_desc')}</p>
                </div>
              </div>
              
              <!-- 3. QRIS & Local Indonesian Bank Transfer -->
              <div class="payment-method ${selectedMethod === 'qris' ? 'selected' : ''}" data-method="qris">
                <div class="payment-method__radio"></div>
                <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--surface-silk); border-radius: var(--radius-sm); color: var(--gold-maha);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <div class="payment-method__info">
                  <h4>${t('pay_method_qris')}</h4>
                  <p>${t('pay_method_qris_desc')}</p>
                </div>
              </div>

            </div>

            <!-- Reschedule Policy Trust Badge (Section 4.3) -->
            <div class="reschedule-trust-badge" style="margin: var(--space-5) 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha); flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>✦ ${t('reschedule_badge')}</span>
            </div>

            <button class="btn btn--primary btn--lg" id="pay-now" style="width: 100%; margin-top: var(--space-6);">
              ${t('chk_pay_now')} — <span class="tabular-nums">${formatCurrency(data.grand_total)}</span>
            </button>
            
            <p style="text-align: center; font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-4); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-maha);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>${t('chk_secure_payment')}</span>
            </p>
          </div>

          <!-- Order Summary (100% Tax-Free per Note 4) -->
          <div class="fade-in-right">
            <div class="booking-summary" style="position: static;">
              <h3 class="booking-summary__title" style="font-family: var(--font-serif);">${t('chk_summary_title')}</h3>
              
              <div style="background: var(--surface-silk); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); margin-bottom: var(--space-4); font-size: var(--text-xs);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span style="color: var(--text-muted); font-family: var(--font-mono);">Kode Booking</span>
                  <span style="font-weight: 700; color: var(--cta-forest); font-family: var(--font-mono);">${bookingCode}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted); font-family: var(--font-mono);">Invoice Ref</span>
                  <span style="font-weight: 700; color: var(--gold-700); font-family: var(--font-mono);">${data.invoice_id}</span>
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
              ${data.pax && data.pax > 1 ? `
                <div class="booking-summary__row">
                  <span class="label">${t('book_pax_label')}</span>
                  <span class="value"><strong>${data.pax} ${t('book_pax_person')}</strong></span>
                </div>
              ` : ''}
              <div class="booking-summary__row">
                <span class="label">${t('book_date_label')}</span>
                <span class="value">${formatDateSafe(data.booking_date)}</span>
              </div>
              <div class="booking-summary__row">
                <span class="label">${t('book_time_label')}</span>
                <span class="value">${data.booking_time} WITA (Bali Time)</span>
              </div>
              
              <div style="margin: var(--space-4) 0; padding: var(--space-3); background: var(--surface-silk); border-radius: var(--radius-md); border: 1px solid var(--border-hairline);">
                <p style="font-size: var(--text-xs); font-family: var(--font-mono); text-transform: uppercase; color: var(--gold-maha); font-weight: 600; margin-bottom: var(--space-1);">${t('book_customer_label')}</p>
                <p style="font-size: var(--text-xs); color: var(--text-onyx); font-weight: 600; margin: 0 0 2px;">${data.customer_name} ${data.nationality ? `(${data.nationality})` : ''}</p>
                <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0 0 2px;">${data.email}</p>
                <p style="font-size: var(--text-xs); color: var(--text-stone); margin: 0;">+${data.whatsapp}</p>
                
                ${data.dob ? `<p style="font-size: var(--text-xs); color: var(--cta-forest); margin: 3px 0 0; font-weight: 600;">✦ DOB: ${data.dob}</p>` : ''}
                ${data.transport_option ? `<p style="font-size: var(--text-xs); color: var(--cta-forest); margin: 3px 0 0; font-weight: 600;">✦ Transport: ${data.transport_option === 'need_pickup' ? 'Pickup (' + (data.pickup_address || '') + ')' : 'Direct Meet Bindu'}</p>` : ''}
              </div>

              <div class="booking-summary__row">
                <span class="label">${t('book_subtotal')}</span>
                <span class="value tabular-nums">${formatCurrency(data.subtotal)}</span>
              </div>
              <div class="booking-summary__row" style="color: var(--success); font-size: 0.82rem;">
                <span class="label">${t('book_tax_free')}</span>
                <span class="value">Rp 0 (100% Nett)</span>
              </div>
              <div class="booking-summary__total">
                <span class="label">${t('book_grand_total')}</span>
                <div style="text-align: right;">
                  <span class="value tabular-nums" style="display: block;">${formatCurrency(data.grand_total)}</span>
                  <span style="font-size: 0.76rem; font-weight: normal; color: var(--text-stone);">
                    ${formatCurrencyWithApprox(data.grand_total, currentLanguage).replace(formatCurrency(data.grand_total), '').trim()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}


export function initCheckout() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Copy booking code button
  const copyBtn = document.getElementById('btn-copy-checkout-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.dataset.code;
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const btnText = document.getElementById('copy-btn-text');
          if (btnText) btnText.textContent = t('inv_code_copied');
          copyBtn.style.background = 'var(--gold-maha)';
          setTimeout(() => {
            if (btnText) btnText.textContent = t('inv_copy_code');
            copyBtn.style.background = 'var(--cta-forest)';
          }, 2000);
        });
      }
    });
  }

  // Real-time Live Countdown Timer
  const timerEl = document.getElementById('countdown-timer');
  const data = JSON.parse(sessionStorage.getItem('bookingData') || 'null');
  if (timerEl && data?.expired_at) {
    const target = new Date(data.expired_at).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        timerEl.textContent = t('chk_countdown_expired');
        timerEl.style.color = '#C92A2A';
        clearInterval(countdownInterval);
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const pad = (n) => String(n).padStart(2, '0');
      timerEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${t('chk_countdown_remaining')}`;
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
  }

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
      const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || 'null');
      if (!bookingData) return;

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
        const invoiceNumber = bookingData.invoice_number || bookingData.invoice_id;

        await new Promise(resolve => setTimeout(resolve, 1200));

        if (invoiceNumber) {
          const updateRes = await updateBookingStatusInSupabase(invoiceNumber, 'paid');
          if (!updateRes.success && !updateRes.simulated) {
            console.warn('Perhatian: Gagal memperbarui status di Supabase:', updateRes.error);
          }
        }

        bookingData.payment_method = paymentMethod;
        bookingData.payment_status = 'PAID';
        bookingData.status = 'paid';
        bookingData.booking_status = 'CONFIRMED';
        bookingData.paid_at = new Date().toISOString();
        bookingData.transaction_id = 'TRX' + Date.now();

        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
        resetBooking();
        if (countdownInterval) clearInterval(countdownInterval);
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
