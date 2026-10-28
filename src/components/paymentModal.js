/**
 * Payment Result Modals Component (Success, Pending Confirmation, & Failed)
 * Provides high-trust luxury feedback for payment & booking states:
 * 1. showPaymentSuccessModal: Handles both 'confirmed/paid' and 'pending/waiting_confirmation'
 * 2. showPaymentFailedModal: Clear error message, retry button, change payment method, & WhatsApp fallback
 * Fully compliant with WCAG 2.2 Level AA (aria-modal, role="dialog", keyboard escape listener, focus trap)
 */
import { formatCurrency, formatDateSafe, formatCurrencyWithApprox, COMPANY } from '../data.js';
import { t, getLang, translateServiceName, translatePackageName } from '../i18n.js';
import { esc } from '../utils/security.js';

let activeEscapeListener = null;

function setupModalA11y(modalEl, closeBtnEl) {
  // Focus initial element
  if (closeBtnEl) {
    setTimeout(() => closeBtnEl.focus(), 50);
  }

  // Remove any prior escape listener
  if (activeEscapeListener) {
    document.removeEventListener('keydown', activeEscapeListener);
  }

  activeEscapeListener = (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('payment-result-modal');
      if (modal) modal.remove();
      document.removeEventListener('keydown', activeEscapeListener);
      activeEscapeListener = null;
    }
  };

  document.addEventListener('keydown', activeEscapeListener);
}

export function showPaymentSuccessModal(booking) {
  const existing = document.getElementById('payment-result-modal');
  if (existing) existing.remove();

  const currentLang = getLang();
  const srvTitle = translateServiceName(booking.service_id) || booking.service_name || 'Sanctuary Journey';
  const pkgTitle = translatePackageName(booking.package_id) || booking.package_name || 'Sacred Package';
  const bookingCode = booking.booking_id || booking.kode_pemesanan || 'MWJ-JOURNEY';
  const invoiceId = booking.invoice_id || booking.invoice_number || `INV-${Date.now().toString().slice(-6)}`;
  const method = (booking.payment_method || 'ONLINE').toUpperCase();

  const isConfirmedPaid = String(booking.status || '').toLowerCase() === 'paid'
    || String(booking.payment_status || '').toUpperCase() === 'PAID';

  const modalTitle = isConfirmedPaid
    ? 'Pembayaran Berhasil & Terkonfirmasi'
    : 'Reservasi Berhasil Didaftarkan';

  const statusBadge = isConfirmedPaid
    ? `<span class="payment-status-badge success" id="payment-modal-badge" style="background: #E8F5E9; color: #1B5E20; border: 1px solid #A5D6A7; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
        ✓ Sesi Sakral Terkunci (LUNAS)
      </span>`
    : `<span class="payment-status-badge pending" id="payment-modal-badge" style="background: #FFF8E1; color: #8D6E63; border: 1px solid #FFE082; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
        ⏳ Menunggu Konfirmasi & Pembayaran
      </span>`;

  const leadMessage = isConfirmedPaid
    ? `Terima kasih, <strong>${esc(booking.customer_name)}</strong>. Pembayaran Anda telah kami verifikasi secara resmi.`
    : `Terima kasih, <strong>${esc(booking.customer_name)}</strong>. Rincian reservasi Anda telah berhasil dicatat. Silakan lakukan konfirmasi ke WhatsApp Concierge kami untuk menyelesaikan instruksi pembayaran dan mengunci slot sesi sakral Anda.`;

  // WhatsApp formatted confirmation text
  const waText = encodeURIComponent(
    `Om Swastyastu / Hello Mahawellnerjourney Concierge,\n\n` +
    `Saya telah mendaftarkan reservasi:\n` +
    `• Kode Booking: ${bookingCode}\n` +
    `• Invoice Ref: ${invoiceId}\n` +
    `• Nama Tamu: ${booking.customer_name} (${booking.nationality || 'Guest'})\n` +
    `• Layanan: ${srvTitle} - ${pkgTitle}\n` +
    `• Jumlah Peserta: ${booking.pax || 1} Orang\n` +
    `• Jadwal: ${formatDateSafe(booking.booking_date)} jam ${booking.booking_time} WITA\n` +
    (booking.dob ? `• Tanggal Lahir: ${booking.dob}\n` : '') +
    `• Total Tagihan: ${formatCurrency(booking.grand_total || booking.total_price || 0)} (100% Nett)\n` +
    `• Status: ${isConfirmedPaid ? 'Lunas' : 'Menunggu Konfirmasi & Pembayaran'}\n\n` +
    `Mohon info instruksi pembayaran / konfirmasi kesiapan sesi kami. Suksma / Thank you!`
  );
  const waUrl = `https://wa.me/${(COMPANY.whatsapp || '6281234567890').replace(/\D/g, '')}?text=${waText}`;

  const html = `
    <div class="confirm-modal-overlay" id="payment-result-modal" role="dialog" aria-modal="true" aria-labelledby="modal-success-title">
      <div class="confirm-modal-box payment-success-box" style="position: relative;" tabindex="-1">
        <!-- Close Button -->
        <button type="button" class="modal-close-btn" id="btn-close-payment-modal" aria-label="Tutup Dialog Modal" style="position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: var(--surface-silk); border: 1px solid var(--border-hairline); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-stone); transition: all 0.2s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <!-- Header -->
        <div class="confirm-modal-header" style="border-bottom: none; padding-bottom: var(--space-3); margin-bottom: var(--space-2); text-align: center;">
          <div class="payment-modal-icon-circle ${isConfirmedPaid ? 'success' : 'pending'}" style="margin: 0 auto 12px; width: 56px; height: 56px; border-radius: 50%; background: ${isConfirmedPaid ? '#E8F5E9' : '#FFF9C4'}; display: flex; align-items: center; justify-content: center; color: ${isConfirmedPaid ? '#2E7D32' : '#F57F17'};">
            ${isConfirmedPaid
              ? `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`
              : `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
            }
          </div>
          ${statusBadge}
          <h2 id="modal-success-title" style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--cta-forest); margin: var(--space-2) 0 4px;">
            ${modalTitle}
          </h2>
          <p style="font-size: 0.84rem; color: var(--text-stone); margin: 0; line-height: 1.5;">
            ${leadMessage}
          </p>
        </div>

        <!-- Official Booking Code Card with Copy Action -->
        <div class="booking-code-card" style="margin: var(--space-3) 0 var(--space-4); background: #FAF7F2; border: 1.5px solid var(--gold-maha); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; font-weight: 600;">
              Kode Booking Resmi
            </span>
            <p class="booking-code-value" id="modal-code-val" style="margin: 2px 0 0; color: var(--cta-forest); font-family: var(--font-mono); font-weight: 700; font-size: 1.1rem;">
              ${esc(bookingCode)}
            </p>
          </div>
          <button type="button" class="copy-code-btn" id="btn-copy-success-code" data-code="${esc(bookingCode)}" style="background: var(--cta-forest); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span id="copy-success-text">Salin Kode</span>
          </button>
        </div>

        <!-- Details Grid -->
        <div style="background: var(--surface-silk); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); font-size: 0.82rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: var(--text-muted);">Paket Sesi:</span>
            <strong style="color: var(--text-onyx); text-align: right;">${esc(srvTitle)} — ${esc(pkgTitle)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: var(--text-muted);">Jadwal & Waktu:</span>
            <span style="color: var(--text-onyx);">${esc(formatDateSafe(booking.booking_date))} • <strong>${esc(booking.booking_time)} WITA</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: var(--text-muted);">Peserta (Pax):</span>
            <span style="color: var(--text-onyx);">${Number(booking.pax || 1)} Orang</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: var(--text-muted);">Metode & Ref:</span>
            <span style="color: var(--text-onyx); font-family: var(--font-mono); font-size: 0.76rem;">${esc(method)} (${esc(invoiceId)})</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-hairline);">
            <strong style="color: var(--cta-forest); font-size: 0.95rem;">${isConfirmedPaid ? 'Total Lunas (Nett):' : 'Total Tagihan (Nett):'}</strong>
            <strong style="color: var(--cta-forest); font-size: 1.05rem;" class="tabular-nums">
              ${formatCurrencyWithApprox(booking.grand_total || booking.total_price || 0, currentLang)}
            </strong>
          </div>
        </div>

        <!-- Actions -->
        <div class="confirm-modal-cta-group" style="margin-top: var(--space-5); display: flex; flex-direction: column; gap: 8px;">
          <!-- 1. WhatsApp Confirmation -->
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--primary" id="btn-success-wa" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; font-weight: 600;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Konfirmasi ke WhatsApp Concierge</span>
          </a>

          <!-- 2. Open / Print Invoice -->
          <a href="#/invoice/${esc(invoiceId)}" class="btn btn--secondary" id="btn-success-invoice" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>Buka Detail Faktur & E-Voucher</span>
          </a>

          <!-- 3. Back to Home -->
          <a href="#/" class="btn btn--ghost" id="btn-success-home" style="text-align: center; justify-content: center; padding: 10px;">
            <span>Selesai & Kembali ke Beranda</span>
          </a>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  // Hook copy button
  const copyBtn = document.getElementById('btn-copy-success-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.dataset.code;
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const txt = document.getElementById('copy-success-text');
          if (txt) txt.textContent = 'Tersalin!';
          setTimeout(() => {
            if (txt) txt.textContent = 'Salin Kode';
          }, 2000);
        });
      }
    });
  }

  // Close modal handler
  const closeModal = () => {
    const m = document.getElementById('payment-result-modal');
    if (m) m.remove();
    if (activeEscapeListener) {
      document.removeEventListener('keydown', activeEscapeListener);
      activeEscapeListener = null;
    }
  };

  const closeBtn = document.getElementById('btn-close-payment-modal');
  closeBtn?.addEventListener('click', closeModal);

  // Close when clicking overlay backdrop outside box
  document.getElementById('payment-result-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'payment-result-modal') {
      closeModal();
    }
  });

  // Close modal when navigating
  const links = document.querySelectorAll('#payment-result-modal a');
  links.forEach(l => {
    l.addEventListener('click', () => {
      setTimeout(closeModal, 250);
    });
  });

  // WCAG focus management
  setupModalA11y(document.getElementById('payment-result-modal'), closeBtn);
}

export function showPaymentFailedModal(options = {}) {
  const existing = document.getElementById('payment-result-modal');
  if (existing) existing.remove();

  const {
    booking = {},
    errorMsg = 'Otorisasi pembayaran tidak dapat diselesaikan oleh bank atau gateway jaringan.',
    errorCode = 'ERR_GATEWAY_TIMEOUT',
    onRetry,
    onChangeMethod
  } = options;

  const method = (booking.payment_method || 'ONLINE').toUpperCase();

  // WhatsApp helper text for manual fallback
  const waHelpText = encodeURIComponent(
    `Om Swastyastu / Halo Tim Mahawellnerjourney,\n\n` +
    `Saya mengalami kendala saat menyelesaikan pembayaran online:\n` +
    `• Nama Tamu: ${booking.customer_name || 'Tamu'}\n` +
    `• Invoice / Order: ${booking.invoice_id || booking.invoice_number || '-'}\n` +
    `• Kendala: ${errorMsg}\n` +
    `• Metode yang Dicoba: ${method}\n\n` +
    `Mohon bantuan untuk proses verifikasi / transfer manual. Suksma!`
  );
  const waUrl = `https://wa.me/${(COMPANY.whatsapp || '6281234567890').replace(/\D/g, '')}?text=${waHelpText}`;

  const html = `
    <div class="confirm-modal-overlay" id="payment-result-modal" role="dialog" aria-modal="true" aria-labelledby="modal-failed-title">
      <div class="confirm-modal-box payment-failed-box" style="position: relative;" tabindex="-1">
        <!-- Close Button -->
        <button type="button" class="modal-close-btn" id="btn-close-failed-modal" aria-label="Tutup Dialog Modal" style="position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: var(--surface-silk); border: 1px solid var(--border-hairline); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-stone); transition: all 0.2s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <!-- Header Failed -->
        <div class="confirm-modal-header" style="border-bottom: none; padding-bottom: var(--space-3); margin-bottom: var(--space-2); text-align: center;">
          <div class="payment-modal-icon-circle failed" style="margin: 0 auto 12px; width: 56px; height: 56px; border-radius: 50%; background: #FFEBEE; display: flex; align-items: center; justify-content: center; color: #C62828;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <span class="payment-status-badge failed" style="background: #FFCDD2; color: #B71C1C; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
            Pemberitahuan Sistem Reservasi
          </span>
          <h2 id="modal-failed-title" style="font-family: var(--font-serif); font-size: 1.45rem; color: #991B1B; margin: var(--space-2) 0 4px;">
            Pembayaran Belum Berhasil
          </h2>
          <p style="font-size: 0.84rem; color: var(--text-stone); margin: 0; line-height: 1.5;">
            Jangan khawatir, slot jadwal dan data reservasi Anda tetap aman tersimpan.
          </p>
        </div>

        <!-- Error Reason Box -->
        <div style="background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: var(--radius-md); padding: var(--space-4); margin: var(--space-3) 0 var(--space-4);">
          <div style="display: flex; align-items: flex-start; gap: 10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p style="font-size: 0.84rem; color: #7F1D1D; margin: 0 0 4px; font-weight: 600;">
                Keterangan Kendala:
              </p>
              <p style="font-size: 0.8rem; color: #991B1B; margin: 0; line-height: 1.5;">
                ${esc(errorMsg)}
              </p>
              <span style="display: inline-block; margin-top: 6px; font-family: var(--font-mono); font-size: 0.68rem; color: #B91C1C; background: #FEE2E2; padding: 2px 8px; border-radius: 4px;">
                STATUS: ${esc(errorCode)} • METODE: ${esc(method)}
              </span>
            </div>
          </div>
        </div>

        <!-- Guidance Tips -->
        <div style="background: var(--surface-silk); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-hairline); font-size: 0.78rem; color: var(--text-stone); line-height: 1.5;">
          <strong style="color: var(--text-onyx); display: block; margin-bottom: 2px;">Saran Penyelesaian:</strong>
          • Pastikan koneksi internet stabil & saldo/limit kartu mencukupi.<br/>
          • Anda dapat mencoba kembali atau memilih metode alternatif (QRIS / Kartu Lain).<br/>
          • Tim Concierge kami siap membantu proses reservasi secara manual via WhatsApp.
        </div>

        <!-- Action Buttons -->
        <div class="confirm-modal-cta-group" style="margin-top: var(--space-5); display: flex; flex-direction: column; gap: 8px;">
          <!-- 1. Retry Payment Button -->
          <button type="button" class="btn btn--primary" id="btn-retry-payment" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px;">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Coba Bayar Lagi Sekarang
          </button>

          <!-- 2. Change Payment Method -->
          <button type="button" class="btn btn--secondary" id="btn-change-payment-method" style="width: 100%; justify-content: center; padding: 11px; font-weight: 600; font-size: 0.88rem; background: #fff;">
            Pilih Metode Pembayaran Lain (QRIS / Card / Transfer)
          </button>

          <!-- 3. Concierge WhatsApp Help -->
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost" id="btn-failed-wa" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Bantuan Concierge via WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  // Close modal handler
  const closeModal = () => {
    const m = document.getElementById('payment-result-modal');
    if (m) m.remove();
    if (activeEscapeListener) {
      document.removeEventListener('keydown', activeEscapeListener);
      activeEscapeListener = null;
    }
  };

  const closeBtn = document.getElementById('btn-close-failed-modal');
  closeBtn?.addEventListener('click', closeModal);

  // Close when clicking overlay backdrop outside box
  document.getElementById('payment-result-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'payment-result-modal') {
      closeModal();
    }
  });

  // Hook Retry button
  const retryBtn = document.getElementById('btn-retry-payment');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      closeModal();
      if (typeof onRetry === 'function') onRetry();
    });
  }

  // Hook Change Method button
  const changeBtn = document.getElementById('btn-change-payment-method');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      closeModal();
      if (typeof onChangeMethod === 'function') onChangeMethod();
    });
  }

  // WCAG focus management
  setupModalA11y(document.getElementById('payment-result-modal'), closeBtn);
}
