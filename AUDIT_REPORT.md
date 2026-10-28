# Laporan Audit Komprehensif — Mahawellnerjourney

Tanggal Audit: 28 Oktober 2026  
Status Lingkungan: Staging / Local Codebase (Production: `https://booking-onlinee-maha.vercel.app/#/layanan`)  
Auditor: Senior Full-Stack Engineer, UI/UX Designer, AppSec Engineer, Database Architect & QA  

---

## 1. Ringkasan Arsitektur Sistem

| Komponen | Implementasi Saat Ini | Catatan Arsitektur |
| :--- | :--- | :--- |
| **Frontend Framework** | Vanilla JavaScript (ES Modules) + Vite 8.3 | Single Page Application (SPA), zero-dependency UI framework, bundle modular dengan dynamic import per halaman. |
| **Routing** | Hash Router (`/#/`, `/#/layanan`, `/#/booking`, `/#/checkout`, `/#/invoice`, `/#/tentang-kami`, `/#/hubungi-kami`) | Router internal berbasis event `hashchange` dengan parameter dynamic `:slug` dan query params. |
| **Styling & Design Tokens** | Vanilla CSS (`index.css` & `editorial.css`) | Palet warna *Forest Green*, *Ivory/Cream/Canvas*, aksen *Gold/Maha*, font Google *Playfair Display*, *Plus Jakarta Sans*, & *JetBrains Mono*. |
| **Internationalization (i18n)** | Custom i18n (`src/i18n.js`, `benefitTranslations.js`, `packageTranslations.js`) | Mendukung 6 bahasa: Indonesia (id), English (en), Russian (ru), Spanish (es), Italian (it), French (fr). |
| **Backend API Engine** | Node.js `http` native + Vite Dev Middleware (`server/api-handler.js`, `server.js`) | Menggunakan shared handler antara Vite dev server middleware dan standalone `server.js`. |
| **Database Lokal** | SQLite via Node.js native `DatabaseSync` (`database/booking.db`) | Inisialisasi otomatis via `database/init-db.js` dengan constraint `UNIQUE` pada `order_id` dan `idempotency_key`. |
| **Cloud Database (Opsional)** | Supabase PostgreSQL (`database/supabase_schema.sql`, `src/api/supabase.js`) | Client public anon dengan RLS terkonfigurasi. Menyediakan RPC `get_booking_by_invoice` untuk mencegah table scraping. |
| **Deployment Target** | Vercel Static Hosting (`booking-onlinee-maha.vercel.app`) | Hasil build statis dari `dist/`. |

---

## 2. Inventaris Halaman dan Fitur

1. **Beranda (`/#/`)**:
   - Hero Section dengan LCP image optimization (pre-rendered di `index.html`).
   - Quick Booking Bar (pilih layanan, tanggal, sesi, jumlah tamu).
   - Curated Journeys Showcase (4 pilar layanan: Spiritual Temple Tour, Yoga Retreat, Numerology, Melukat & Purification).
   - Video & Photo Reel (Sanctuary in Motion).
   - Filosofi Tri Hita Karana & Nilai Adat Bindu Ubud.
   - Tabel Harga Transparan (versi desktop & mobile cards).
2. **Katalog & Detail Layanan (`/#/layanan`, `/#/layanan/:slug`)**:
   - Filter pencarian dan kategori layanan.
   - Detail paket lengkap (durasi, deskripsi, fasilitas/benefit, harga per orang).
   - Sidebar informasi operasional (jam 09:00 - 17:00 WITA, lokasi Ubud, tombol tanya WhatsApp).
   - Visual Journey Switcher untuk navigasi antar layanan tanpa kembali ke katalog.
3. **Engine Pemesanan Mandiri (`/#/booking`)**:
   - Multi-step booking bar (Layanan -> Paket -> Jadwal -> Data Tamu -> Ringkasan).
   - Lock zona waktu Bali (WITA / UTC+8) dengan lead-time minimal 12 jam.
   - Input nomor WhatsApp internasional dengan selector kode negara & sanitasi E.164.
   - Conditional fields: Tanggal lahir (DOB) untuk Numerologi; Opsi transportasi & persetujuan etiket adat untuk Melukat/Tour.
   - Perhitungan total otomatis tanpa pajak tersembunyi (Zero Tax).
4. **Checkout & Pembayaran (`/#/checkout`)**:
   - Tampilan Kode Booking resmi (`MWJ-xxx`).
   - Countdown timer kedaluwarsa pembayaran (24 jam).
   - Pilihan metode: Kartu Kredit Internasional, PayPal, QRIS.
5. **E-Voucher & Faktur Digital (`/#/invoice`, `/#/invoice/:id`)**:
   - Format cetak ramah printer (`window.print()`).
   - Tombol salin kode booking & tombol konfirmasi WhatsApp concierge.
6. **Tentang Kami (`/#/tentang-kami`)**:
   - Narasi Sanctuary Desa Adat Bindu Ubud, etos Tri Hita Karana, profil praktisi lokal.
7. **Kontak & FAQ (`/#/hubungi-kami`)**:
   - Alamat fisik, jam respons concierge, accordion tanya-jawab (FAQ), form pesan singkat.
8. **Widget Concierge Floating (Chatbot)**:
   - Floating action button dengan balasan otomatis dwibahasa untuk pertanyaan harga, jadwal, dan lokasi.

---

## 3. Temuan Terbukti (Prioritas Temuan)

### Prioritas P0 — Kritis (Risiko Integritas Data, Keamanan, & Transaksi Palsu)

#### 1. Simulasi Pembayaran Client-Side yang Mengeluarkan E-Voucher "LUNAS" Palsu
- **Lokasi File**: `src/pages/booking.js` (L1210–L1255) dan `src/pages/checkout.js` (L325–L360)
- **Kondisi**:
  Frontend memanggil `/api/payments/charge` yang di backend dibatasi untuk Admin saja (`requireAdmin`). Namun frontend membungkusnya dalam blok `try { ... } catch (_) {}` kosong, lalu langsung menetapkan status lokal `bookingData.payment_status = 'PAID'` dan `bookingData.status = 'paid'`.
- **Dampak**:
  Pengguna di browser dapat menyelesaikan pemesanan tanpa pembayaran nyata, lalu sistem menampilkan modal "Pembayaran Sukses" dan mencetak E-Voucher dengan stempel resmi "LUNAS / PAID".
- **Cara Reproduksi**:
  1. Buka `/#/booking`, lengkapi formulir hingga langkah ringkasan.
  2. Klik "Proceed to Checkout" / "Bayar Sekarang".
  3. Meskipun backend mengembalikan `401 Unauthorized` atau request gagal, popup sukses tetap muncul dan voucher "PAID" langsung terbit.

#### 2. Ketiadaan Routing API Serverless di Deployment Vercel
- **Lokasi File**: Akar proyek (`/`, tidak ada `vercel.json` atau folder `api/`)
- **Kondisi**:
  Aplikasi dipublikasikan di Vercel sebagai static site. File `server.js` dan database SQLite `database/booking.db` hanya berjalan di mesin lokal atau VPS. Di Vercel, request ke `/api/bookings` menghasilkan `404 Not Found` (atau fallback SPA `index.html`).
- **Dampak**:
  Pada website produksi publik (`https://booking-onlinee-maha.vercel.app`), tidak ada data pemesanan yang pernah tersimpan di backend Node/SQLite. Jika kredensial Supabase juga tidak diisi di environment Vercel, pemesanan hanya disimpan di `sessionStorage` pengguna.
- **Cara Reproduksi**:
  Jalankan `fetch('https://booking-onlinee-maha.vercel.app/api/bookings', {method: 'POST'})` -> mengembalikan HTML `index.html` (200 OK text/html) bukan JSON API endpoint (404/405/422).

#### 3. IDOR dan Kebocoran Data Palsu pada Direct Invoice URL (`/#/invoice/:id`)
- **Lokasi File**: `src/pages/invoice.js` (L18–L41)
- **Kondisi**:
  Jika pengguna membuka URL seperti `/#/invoice/INV-999999` secara langsung tanpa sesi aktif, kode langsung menyuntikkan data dummy statis dengan status `PAID` dan nama `"Tamu Terhormat"`, alih-alih menampilkan pesan bahwa invoice tidak ditemukan atau memerlukan verifikasi identitas pemesan.
- **Dampak**:
  Membingungkan pelanggan, memungkinkan siapa saja melihat tampilan konfirmasi pembayaran untuk nomor pesanan sembarang.

---

### Prioritas P1 — Tinggi (Konsistensi Kuota, Concurrency, & Robustness)

#### 4. Ketiadaan Atomic Slot Quota Lock pada Endpoint `POST /api/bookings`
- **Lokasi File**: `server/api-handler.js` (L398–L435)
- **Kondisi**:
  Meskipun pengecekan kuota ada di endpoint admin `/api/admin/availability`, pada saat `POST /api/bookings` dieksekusi di backend, transaksi database **tidak memeriksa sisa kuota kapasitas** (`MAX_CAPACITY_PER_SLOT = 8`).
- **Dampak**:
  Dua atau lebih pemohon bersamaan (race condition) dapat memesan slot yang sama hingga melampaui kapasitas maksimal (overbooking).

#### 5. Ketiadaan Test Suite Otomatis di `package.json`
- **Lokasi File**: `package.json`
- **Kondisi**:
  Tidak ada script `npm test` atau file test unit/integrasi untuk validasi input, sanitasi, kalkulasi harga server-side, concurrency lock, dan proteksi idempotency.
- **Dampak**:
  Perubahan kode berisiko merusak keamanan dan logika bisnis tanpa terdeteksi (regresi).

---

### Prioritas P2 — Menengah (SEO, Aksesibilitas, & Feedback UI)

#### 6. Formulir Kontak Menggunakan Browser `alert()` Saja
- **Lokasi File**: `src/pages/contact.js` (L155–L158)
- **Kondisi**:
  Pengiriman form di halaman Hubungi Kami hanya memanggil `alert(t('con_form_success'))` tanpa menyimpan data pertanyaan atau mengarahkannya ke WhatsApp Concierge resmi.
- **Dampak**:
  Pesan pelanggan hilang dan pengalaman pengguna terganggu oleh pop-up modal native browser yang memblokir thread UI.

#### 7. Judul Dokumen (SEO `<title>` & `<meta description>`) Statis saat Pindah Halaman
- **Lokasi File**: `src/router.js` & `index.html`
- **Kondisi**:
  Saat berpindah dari `/#/` ke `/#/layanan`, `/#/booking`, atau `/#/layanan/spiritual-temple-tour`, tag `<title>` dan `<meta name="description">` tidak diperbarui secara dinamis oleh router.
- **Dampak**:
  Penjelajahan mesin pencari dan riwayat browser tidak mencerminkan halaman yang sedang aktif.

#### 8. Manajemen Aksesibilitas Keyboard & Dialog (WCAG 2.2 Level AA)
- **Lokasi File**: `src/components/paymentModal.js`, `index.html` (Chatbot dialog & Mobile menu)
- **Kondisi**:
  Dialog modal belum memiliki atribut `role="dialog"`, `aria-modal="true"`, *focus trap* saat terbuka, dan penutupan dengan tombol keyboard `Escape`.

---

### Prioritas P3 — Rendah (Pembersihan Kode & Konsistensi Teks)

#### 9. Duplikasi Helper Sanitasi & Konfigurasi Supabase
- **Lokasi File**: `src/utils/supabase.js` (file 36 byte yang hanya me-re-export `src/api/supabase.js`).
- **Pembersihan**: Menghindari kebingungan jalur import dengan dokumentasi yang jelas.

---

## 4. Risiko yang Belum Dapat Dikonfirmasi & Rencana Verifikasi

1. **Kredensial & Proyek Supabase Aktif**:
   - Status: File `.env.example` masih menggunakan placeholder (`your-project-id.supabase.co`).
   - Uji Verifikasi: Memeriksa apakah pemilik proyek sudah membuat project Supabase aktif dan mengaktifkan skema `database/supabase_schema.sql`.
2. **Kunci Server Payment Gateway Produksi (Midtrans / Xendit)**:
   - Status: Nilai `PAYMENT_GATEWAY_SERVER_KEY` masih berupa placeholder.
   - Uji Verifikasi: Integrasi webhook hanya dapat diverifikasi penuh setelah akun merchant resmi dan Server Key disediakan.
3. **Nomor Kontak Resmi WhatsApp Concierge**:
   - Status: Menggunakan nomor demo `+62 812 3456 7890`. Perlu konfirmasi nomor resmi dari pemilik usaha.

---

## 5. Daftar Blocker yang Membutuhkan Akses/Informasi Pemilik

1. **Konfirmasi Akun & Kredensial Database**:
   - URL & Public Anon Key Supabase untuk produksi (jika menggunakan cloud database).
   - Atau persetujuan hosting backend Node.js (VPS/Render/Railway) jika ingin database SQLite lokal berjalan persisten.
2. **Konfirmasi Alur Pembayaran Nyata**:
   - Apakah pembayaran saat ini ditangani secara manual via transfer bank & konfirmasi WhatsApp Concierge, atau sudah memiliki akun Payment Gateway (Midtrans/Xendit)?
   - *Rekomendasi Aman*: Terapkan status `pending / awaiting_payment` secara default dengan invoice berstatus **"Menunggu Pembayaran / Verifikasi Manual"** sehingga tidak ada klaim pembayaran palsu.
3. **Data Bisnis Resmi**:
   - Nomor WhatsApp resmi concierge untuk pengalihan notifikasi dan bantuan reservasi.
   - Alamat email resmi untuk konfirmasi reservasi otomatis.
