# Mahawellnerjourney — Official Flagship & Direct Wellness Booking Bali

Platform reservasi digital dan sanctuary resmi untuk perjalanan spiritual, retreat yoga & meditasi, upacara melukat sakral, dan konsultasi numerologi di Desa Adat Bindu, Ubud, Bali.

---

## 1. Arsitektur Proyek

Aplikasi dirancang dengan pendekatan **Editorial Tropical Wellness**, zero-bloat, performa tinggi, dan standar keamanan aplikasi web berorientasi produksi:

- **Frontend**: Vanilla JavaScript (ES Modules) + Vite 8.3 SPA dengan Hash Routing (`/#/layanan`, `/#/booking`, `/#/checkout`, `/#/invoice`).
- **Styling**: Vanilla CSS murni (`index.css` & `editorial.css`) dengan design tokens membumi (*Forest Green*, *Ivory/Canvas*, *Gold Maha*).
- **Internationalization (i18n)**: Dukungan multi-bahasa terpadu (Indonesia, English, Russian, Spanish, Italian, French).
- **Backend API Handler**: Shared handler (`server/api-handler.js`) yang berjalan otomatis pada:
  - Vite dev server middleware (`npm run dev`)
  - Standalone Node.js server (`server.js`, `npm run server`)
  - Vercel Serverless Function (`api/index.js`)
- **Database**:
  - **Lokal / Dedicated Server**: SQLite native engine (`node:sqlite`) via `database/init-db.js` dengan transaksi atomik dan constraint `UNIQUE` anti-duplikasi.
  - **Cloud / Production**: Supabase PostgreSQL dengan skema Row-Level Security (RLS) ketat (`database/supabase_schema.sql`).
- **Keamanan (AppSec)**: Mengacu pada kontrol **OWASP ASVS 5.0.0**, validasi sisi server (Zero-Trust client), proteksi brute-force rate limiter, perbandingan token timing-safe, dan sanitasi nomor telepon internasional E.164.

---

## 2. Persyaratan Sistem

- **Node.js**: Versi `v20.x`, `v22.x`, atau `v24.x` LTS (menggunakan native `node:sqlite` dan `node:test`).
- **NPM**: Versi `10.x` ke atas.

---

## 3. Instalasi & Setup Lokal

1. **Clone repository dan buka direktori:**
   ```bash
   git clone <repository-url>
   cd "Booking Online"
   ```

2. **Pasang dependensi:**
   ```bash
   npm install
   ```

3. **Inisialisasi Database SQLite Lokal:**
   ```bash
   npm run db:init
   ```
   *Perintah ini akan membuat database `database/booking.db`, menjalankan skema tabel, mengisi data awal katalog, dan menguji constraint `UNIQUE` order ID.*

4. **Konfigurasi Environment:**
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Isi kredensial sesuai panduan pada file `.env.example`. Jangan pernah mengunggah file `.env` dengan kredensial asli ke Git).*

5. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka peramban pada `http://localhost:5173`. Frontend dan API backend berjalan otomatis secara terintegrasi.

---

## 4. Daftar Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Vite dev server + middleware API di `http://localhost:5173`. |
| `npm run server` | Menjalankan standalone Node.js API server di `http://localhost:3000`. |
| `npm run db:init` | Menginisialisasi dan memverifikasi integritas database SQLite lokal. |
| `npm test` | Menjalankan automated test suite native (`node:test`) mencakup keamanan, validasi, konkurensi, dan webhook. |
| `npm run build` | Melakukan build bundle produksi teroptimasi ke direktori `dist/`. |
| `npm run preview` | Meninjau hasil build produksi secara lokal. |

---

## 5. Menjalankan Automated Test Suite

Pengujian otomatis mencakup 23 test case tanpa library pengujian eksternal yang berat:

```bash
npm test
```

Cakupan pengujian:
1. `test/security.test.js`: Validasi format nama, email, nomor HP E.164, escaping XSS, dan regex ID.
2. `test/api-booking.test.js`: Validasi payload booking, kalkulasi ulang harga server-side, penolakan tanggal lampau, batas peserta.
3. `test/concurrency-capacity.test.js`: Proteksi kuota kapasitas slot (pencegahan overbooking dan race condition transaksi).
4. `test/admin-auth.test.js`: Autentikasi Bearer token endpoint admin, komparasi timing-safe, proteksi brute-force.
5. `test/webhook-idempotency.test.js`: Verifikasi signature payment gateway (Midtrans SHA-512) dan idempotensi transaksi.

---

## 6. Panduan Deployment Produksi

### Opsi A: Deployment di Vercel (Rekomendasi)

Proyek ini telah dilengkapi dengan adapter serverless `api/index.js` dan konfigurasi `vercel.json`:
1. Hubungkan repository ke akun Vercel.
2. Pastikan konfigurasi Build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Tambahkan Environment Variables di dashboard Vercel sesuai `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_API_TOKEN`
   - `PAYMENT_GATEWAY_SERVER_KEY`
   - `ALLOWED_ORIGINS` (contoh: `https://mahawellnerjourney.com`)

### Opsi B: Deployment di VPS / Node.js Host (Docker / PM2)

Untuk menjalankan SQLite persisten atau backend mandiri:
```bash
npm run build
NODE_ENV=production PORT=3000 node server.js
```

---

## 7. Dokumentasi Audit & Keamanan

- [AUDIT_REPORT.md](file:///c:/Users/Guntur/OneDrive/Documents/Booking%20Online/AUDIT_REPORT.md) — Temuan komprehensif, arsitektur, tingkat risiko, dan blocker.
- [IMPLEMENTATION_PLAN.md](file:///c:/Users/Guntur/OneDrive/Documents/Booking%20Online/IMPLEMENTATION_PLAN.md) — Rencana tahapan perbaikan bertahap.
- [SECURITY_CHECKLIST.md](file:///c:/Users/Guntur/OneDrive/Documents/Booking%20Online/SECURITY_CHECKLIST.md) — Pemetaan kontrol keamanan OWASP ASVS 5.0.0.
- [TEST_PLAN.md](file:///c:/Users/Guntur/OneDrive/Documents/Booking%20Online/TEST_PLAN.md) — Rencana pengujian fungsional, konkurensi, dan QA.

---

## 8. Hak Cipta & Lisensi

&copy; 2026 Mahawellnerjourney. All rights reserved. Ubud, Bali, Indonesia.
