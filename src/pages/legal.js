/**
 * Legal Pages — Privacy Policy & Terms of Service
 * Mahawellnerjourney Bali
 */
import { COMPANY } from '../data.js';
import { getLang } from '../i18n.js';

export function renderPrivacyPolicy() {
  const isEn = getLang() !== 'id';

  return `
    <section class="page-hero" style="padding-top: calc(var(--navbar-height) + var(--space-10)); padding-bottom: var(--space-10); background: var(--canvas); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 860px; margin: 0 auto; text-align: center;">
        <span class="overline" style="color: var(--gold-maha); letter-spacing: 0.12em;">${isEn ? 'LEGAL & COMPLIANCE' : 'LEGAL & KEPATUHAN'}</span>
        <h1 class="heading-1 font-serif" style="margin-bottom: var(--space-4); font-size: clamp(2rem, 4vw, 2.75rem); color: var(--text-onyx);">
          ${isEn ? 'Privacy Policy' : 'Kebijakan Privasi'}
        </h1>
        <div class="divider-gold" style="margin: 0 auto var(--space-4);"></div>
        <p class="subtitle" style="max-width: 680px; margin: 0 auto; color: var(--text-stone); font-size: 0.95rem;">
          ${isEn 
            ? 'Commitment to safeguarding the personal sanctity and privacy of our honored sanctuary guests.' 
            : 'Komitmen kami dalam menjaga kerahasiaan dan keamanan data pribadi setiap tamu terhormat Mahawellnerjourney.'}
        </p>
      </div>
    </section>

    <section class="section" style="padding: var(--space-12) 0; background: var(--surface-silk);">
      <div class="container" style="max-width: 860px; margin: 0 auto;">
        <article class="legal-card" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: clamp(1.5rem, 4vw, 3rem); box-shadow: var(--shadow-sm); line-height: 1.8; color: var(--text-stone);">
          
          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            1. ${isEn ? 'Data We Collect' : 'Data Pribadi yang Kami Kumpulkan'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'To curate your spiritual journey and direct booking, Mahawellnerjourney collects essential details including your full name, email address, WhatsApp/phone number, booking date, preferred session time, and optional wellness preferences (e.g., date of birth for numerology readings, special physical considerations for yoga).'
              : 'Untuk mempersiapkan perjalanan spiritual dan reservasi direct booking Anda, Mahawellnerjourney mengumpulkan informasi penting yang mencakup nama lengkap, alamat email, nomor WhatsApp/telepon aktif, tanggal dan waktu reservasi, serta preferensi wellness (seperti tanggal lahir untuk pembacaan numerology sakral dan catatan kesehatan untuk yoga).'}
          </p>

          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            2. ${isEn ? 'Payment Security & Zero Raw Card Storage' : 'Keamanan Pembayaran & Perlindungan Kartu'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'All monetary transactions are processed through certified, PCI-DSS compliant payment gateways (such as Midtrans, Xendit, and PayPal). Mahawellnerjourney never collects, stores, or transmits raw credit card numbers or CVV codes on our servers.'
              : 'Seluruh transaksi pembayaran digital diproses melalui mitra payment gateway berlisensi resmi Bank Indonesia dan tersertifikasi PCI-DSS (seperti Midtrans, Xendit, dan PayPal). Mahawellnerjourney tidak pernah mencatat, menyimpan, atau melihat nomor kartu kredit lengkap maupun kode CVV Anda.'}
          </p>

          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            3. ${isEn ? 'Personal Data Protection Act (UU PDP & GDPR Compliance)' : 'Kepatuhan UU PDP No. 27/2022 & Standar Internasional'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'We treat your personal data with utmost reverence in strict compliance with the Indonesian Personal Data Protection Act (UU PDP No. 27/2022) and international privacy frameworks (GDPR). Your information will never be sold, rented, or traded to third-party advertisers.'
              : 'Data pribadi Anda dijaga dengan penuh integritas sesuai amanat Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27 Tahun 2022) serta prinsip perlindungan privasi global (GDPR bagi wisatawan mancanegara). Data Anda tidak akan pernah dijual, disewakan, atau dibagikan kepada pihak ketiga untuk kepentingan iklan.'}
          </p>

          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            4. ${isEn ? 'Your Rights & Data Inquiries' : 'Hak Tamu & Kontak Data'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'You have the right to request access to, correction of, or deletion of your stored booking records at any time by contacting our dedicated sanctuary concierge at'
              : 'Anda berhak mengajukan permohonan akses, perbaikan, maupun penghapusan riwayat data reservasi Anda kapan saja dengan menghubungi sanctuary concierge resmi kami di'}
            <a href="mailto:concierge@mahawellnerjourney.com" style="color: var(--gold-maha); font-weight: 500; text-decoration: underline;">concierge@mahawellnerjourney.com</a>.
          </p>

          <div style="margin-top: var(--space-8); padding-top: var(--space-5); border-top: 1px solid var(--border-hairline); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); font-size: 0.85rem; color: var(--text-muted);">
            <span>${isEn ? 'Last Updated: November 2026' : 'Pembaruan Terakhir: November 2026'}</span>
            <a href="#/booking" class="btn btn--secondary btn--sm">${isEn ? '← Return to Booking' : '← Kembali ke Reservasi'}</a>
          </div>
        </article>
      </div>
    </section>
  `;
}

export function renderTerms() {
  const isEn = getLang() !== 'id';

  return `
    <section class="page-hero" style="padding-top: calc(var(--navbar-height) + var(--space-10)); padding-bottom: var(--space-10); background: var(--canvas); border-bottom: 1px solid var(--border-hairline);">
      <div class="container" style="max-width: 860px; margin: 0 auto; text-align: center;">
        <span class="overline" style="color: var(--gold-maha); letter-spacing: 0.12em;">${isEn ? 'SANCTUARY GUIDELINES' : 'KETENTUAN SANCTUARY'}</span>
        <h1 class="heading-1 font-serif" style="margin-bottom: var(--space-4); font-size: clamp(2rem, 4vw, 2.75rem); color: var(--text-onyx);">
          ${isEn ? 'Terms of Service' : 'Syarat & Ketentuan'}
        </h1>
        <div class="divider-gold" style="margin: 0 auto var(--space-4);"></div>
        <p class="subtitle" style="max-width: 680px; margin: 0 auto; color: var(--text-stone); font-size: 0.95rem;">
          ${isEn 
            ? 'Guidelines fostering reverence, peaceful ambiance, and transparent direct booking experiences.' 
            : 'Panduan kehormatan, kedamaian sanctuary, dan transparansi reservasi resmi Mahawellnerjourney Bali.'}
        </p>
      </div>
    </section>

    <section class="section" style="padding: var(--space-12) 0; background: var(--surface-silk);">
      <div class="container" style="max-width: 860px; margin: 0 auto;">
        <article class="legal-card" style="background: var(--surface-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-lg); padding: clamp(1.5rem, 4vw, 3rem); box-shadow: var(--shadow-sm); line-height: 1.8; color: var(--text-stone);">
          
          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            1. ${isEn ? 'Sanctuary Harmony & Sacred Adat Etiquette' : 'Keharmonisan Sanctuary & Tata Krama Sakral'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'Mahawellnerjourney ceremonies (including Sacred Melukat and Temple Pilgrimages) honor ancient Balinese spiritual traditions. Guests are provided with customary Balinese ceremonial sarong and sash. We kindly request guests to maintain mindful serenity, speak in subdued tones, and turn cellular devices to silent during all ceremonies.'
              : 'Seluruh ritual dan perjalanan Mahawellnerjourney (termasuk Melukat Sakral dan Pilgrimage Pura) berlandaskan adat luhur Bali dan kearifan Tri Hita Karana. Perlengkapan busana sakral (kain kamen, selendang, dan sarung upacara) telah kami sediakan. Tamu dimohon menjaga ketenangan, tutur kata santun, dan mematikan nada dering gawai selama ritual berlangsung.'}
          </p>

          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            2. ${isEn ? 'Transparent 100% Tax-Free Pricing' : 'Jaminan Harga Pasti 100% Bebas Pajak & Biaya Tersembunyi'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'In accordance with our direct booking philosophy, all quoted package prices are all-inclusive (100% Tax-Free). There are no unexpected administrative markups, service taxes, or mandatory gratuities added at checkout.'
              : 'Sesuai dengan filosofi direct booking kami, nominal harga yang tertera pada setiap paket adalah harga final (100% Tax-Free). Tidak ada biaya administrasi tersembunyi, pajak tambahan, atau pungutan tak terduga saat checkout.'}
          </p>

          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            3. ${isEn ? 'Rescheduling & Cancellation Policy' : 'Kebijakan Perubahan Jadwal (Reschedule) & Pembatalan'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'We understand that travel itineraries may shift. You may reschedule your booking free of charge up to 24 hours prior to the reserved time slot by contacting our Concierge via WhatsApp. Cancellations made at least 48 hours prior are eligible for full refund or perpetual sanctuary credit vouchers.'
              : 'Kami memahami dinamika perjalanan Anda di Bali. Anda dapat melakukan perubahan jadwal (reschedule) tanpa biaya tambahan hingga 24 jam sebelum jam sesi reservasi dengan menghubungi Concierge via WhatsApp. Pembatalan minimal 48 jam sebelum jadwal berhak mendapatkan pengembalian dana penuh atau voucher kredit sanctuary tanpa batas waktu kadaluwarsa.'}
          </p>

          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-onyx); margin-bottom: var(--space-3);">
            4. ${isEn ? 'Tropical Weather & Rain Guarantees' : 'Kondisi Cuaca Tropis & Perlindungan Ritual'}
          </h2>
          <p style="margin-bottom: var(--space-6);">
            ${isEn
              ? 'Bali experiences tropical showers throughout the year. Our purification springs and yoga pavilions feature traditional sheltered bales, ensuring ceremonies proceed with authentic peaceful grace regardless of ambient rainfall.'
              : 'Pulau Bali memiliki keindahan iklim tropis yang dinamis. Area pancuran pembersihan dan bale yoga kami dilengkapi perlindungan alami dan bale tertutup beratap alang-alang sakral, sehingga seluruh rangkaian ritual tetap berjalan khidmat dan nyaman dalam kondisi cuaca apa pun.'}
          </p>

          <div style="margin-top: var(--space-8); padding-top: var(--space-5); border-top: 1px solid var(--border-hairline); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); font-size: 0.85rem; color: var(--text-muted);">
            <span>${isEn ? 'Official Sanctuary Flagship: Ubud, Gianyar, Bali' : 'Official Sanctuary Flagship: Ubud, Gianyar, Bali'}</span>
            <a href="#/booking" class="btn btn--secondary btn--sm">${isEn ? '← Return to Booking' : '← Kembali ke Reservasi'}</a>
          </div>
        </article>
      </div>
    </section>
  `;
}

