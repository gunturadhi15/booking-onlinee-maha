# Checklist Keamanan Aplikasi Web (OWASP ASVS 5.0.0 Ref)

Aplikasi: **Mahawellnerjourney**  
Tujuan: Menjamin keamanan sistem pemesanan online, kerahasiaan data pelanggan, integritas transaksi, dan ketahanan terhadap ancaman siber berbasis standar industri.  

Status Penilaian:
- **[TERVERIFIKASI]**: Telah diimplementasikan dan diverifikasi lewat kode/test.
- **[DIPERBAIKI]**: Telah diperbaiki dalam refactor ini dan diverifikasi.
- **[PERLU INFO/AKSES]**: Bergantung pada kredensial atau setup pihak ketiga milik pemilik.
- **[RISIKO DITERIMA]**: Fitur di luar cakupan saat ini dengan kontrol kompensasi yang memadai.

---

## 1. Verifikasi Arsitektur Keamanan (V1)

| Kontrol ASVS | Deskripsi Kontrol | Status | Bukti & Catatan Implementasi |
| :--- | :--- | :---: | :--- |
| **V1.1** | Pemisahan peran klien dan server (Zero-Trust Client) | **[DIPERBAIKI]** | Harga layanan, kuota slot, dan status transaksi dihitung dan divalidasi ulang di backend (`server/api-handler.js`). Klien browser tidak dapat menetapkan status transaksi `PAID` secara sepihak. |
| **V1.2** | Perlindungan Kredensial & Secrets | **[TERVERIFIKASI]** | Tidak ada API secret key, service role key, atau database password di bundle frontend. File `.env.example` hanya berisi placeholder. Deny-list di `vite.config.js` memblokir akses ke file `.env` dan `database/**`. |
| **V1.4** | Prinsip Least Privilege pada Database | **[TERVERIFIKASI]** | Database Supabase menerapkan Row-Level Security (RLS). Role public `anon` hanya diizinkan melakukan `INSERT` status `pending`. Operasi `UPDATE` dan `DELETE` ditutup total untuk anon. |

---

## 2. Autentikasi & Manajemen Sesi (V2 & V3)

| Kontrol ASVS | Deskripsi Kontrol | Status | Bukti & Catatan Implementasi |
| :--- | :--- | :---: | :--- |
| **V2.1** | Autentikasi Endpoint Sensitif | **[TERVERIFIKASI]** | Semua endpoint admin (`/api/admin/*`) wajib menyertakan `Authorization: Bearer <ADMIN_API_TOKEN>`. Diuji di `server/security.js:requireAdmin`. |
| **V2.2** | Perlindungan Timing Attack pada Token | **[TERVERIFIKASI]** | Komparasi token admin menggunakan `crypto.timingSafeEqual` dengan buffer panjang identik untuk mencegah eksploitasi timing serangan samping (side-channel attack). |
| **V2.3** | Proteksi Brute-Force & Rate Limiting | **[TERVERIFIKASI]** | Endpoint admin dilindungi oleh `authFailLimiter` (maks. 10 percobaan gagal per 15 menit) dan `adminLimiter` (120 req/menit). Endpoint booking publik dibatasi 20 req/menit. |

---

## 3. Kontrol Akses & Otorisasi (V4)

| Kontrol ASVS | Deskripsi Kontrol | Status | Bukti & Catatan Implementasi |
| :--- | :--- | :---: | :--- |
| **V4.1** | Pencegahan Insecure Direct Object References (IDOR) | **[DIPERBAIKI]** | URL `/#/invoice/:id` tidak lagi merender data pesanan palsu dengan status `PAID`. Invoice hanya dapat diakses melalui nomor invoice resmi dan verifikasi sesi aktif. Pada Supabase, data dilindungi oleh RPC `get_booking_by_invoice` untuk mencegah penyerang melakukan scraping seluruh database pelanggan. |
| **V4.2** | Pencegahan Modifikasi Status Pembayaran Tidak Sah | **[DIPERBAIKI]** | Endpoint `/api/payments/charge` memerlukan otentikasi Admin. Frontend tidak lagi dapat menimpa status transaksi tanpa bukti bayar nyata. |

---

## 4. Validasi Input & Encoding Output (V5)

| Kontrol ASVS | Deskripsi Kontrol | Status | Bukti & Catatan Implementasi |
| :--- | :--- | :---: | :--- |
| **V5.1** | Validasi Input Sisi Server (Whitelist Schema) | **[TERVERIFIKASI]** | Semua field booking divalidasi dengan batasan panjang (`INPUT_LIMITS`), format regex (`isValidName`, `isValidEmail`, `isValidDateString`), dan batasan nilai numerik (`pax` 1 hingga maks service). |
| **V5.2** | Sanitasi Nomor Telepon Internasional (E.164) | **[TERVERIFIKASI]** | Fungsi `digitsOnly` dan `sanitizeInternationalPhone` membersihkan awalan 0, tanda baca, dan karakter berbahaya, membatasi panjang 7–15 digit. |
| **V5.3** | Pencegahan Cross-Site Scripting (XSS) | **[TERVERIFIKASI]** | Seluruh data yang dirender ke DOM di-escape menggunakan fungsi `esc()` atau `sanitizeText()`. Karakter `< > " ' &` dinetralisir menjadi entitas HTML aman. |
| **V5.4** | Parameterized Queries (Anti SQL Injection) | **[TERVERIFIKASI]** | 100% query database SQLite menggunakan prepared statements (`db.prepare(...).all(...)` / `db.prepare(...).run(...)`) dengan parameter binding terpisah. Tidak ada penggabungan string (concatenation) pada SQL query. |

---

## 5. Webhook & Integritas Transaksi Pembayaran (V9 & V10)

| Kontrol ASVS | Deskripsi Kontrol | Status | Bukti & Catatan Implementasi |
| :--- | :--- | :---: | :--- |
| **V9.1** | Verifikasi Signature Webhook | **[TERVERIFIKASI]** | Endpoint `POST /api/payments/webhook` memverifikasi signature SHA-512 (`verifyMidtransSignature`) menggunakan `PAYMENT_GATEWAY_SERVER_KEY`. Request tanpa signature yang valid ditolak dengan HTTP 401. |
| **V9.2** | Pencegahan Replay & Re-entrancy Transaksi | **[TERVERIFIKASI]** | Kolom `idempotency_key` dan `order_id` dilindungi oleh constraint `UNIQUE` di database. Jika webhook atau pembayaran berulang dikirim, sistem mengembalikan status `is_idempotent_replay: true` tanpa mengeksekusi ganda. |
| **V9.3** | Verifikasi Nominal Transaksi (Amount Matching) | **[TERVERIFIKASI]** | Backend membandingkan `gross_amount` dari webhook dengan `amount` di database. Jika terjadi selisih, webhook ditolak dengan HTTP 422 (`ERR_AMOUNT_MISMATCH`). |
| **V9.4** | Konkurensi & Anti Double-Booking | **[DIPERBAIKI]** | Pengecekan kapasitas slot (`booked_pax + pax <= MAX_CAPACITY`) dijalankan secara atomik di dalam `withTransaction(db, ...)` untuk mencegah dua pemesan bersamaan melebihi kuota. |

---

## 6. Komunikasi & Response Headers (V14)

| Kontrol ASVS | Deskripsi Kontrol | Status | Bukti & Catatan Implementasi |
| :--- | :--- | :---: | :--- |
| **V14.1** | Strict Content-Security-Policy & Headers | **[TERVERIFIKASI]** | Backend API menyematkan headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, dan `Cross-Origin-Resource-Policy: same-origin`. |
| **V14.2** | Pembatasan CORS (Cross-Origin Resource Sharing) | **[TERVERIFIKASI]** | CORS tidak menggunakan wildcard `*`, melainkan allowlist domain resmi (`DEFAULT_ALLOWED_ORIGINS` / `ALLOWED_ORIGINS`). |
| **V14.3** | Kebocoran Stack Trace & Data Internal | **[TERVERIFIKASI]** | Fungsi `sendError` di `server/security.js` menangkap seluruh error internal dan hanya mengembalikan pesan terstandarisasi tanpa membocorkan stack trace, struktur SQL, atau path file server. |

---

## 7. Ringkasan Sisa Risiko & Rekomendasi untuk Pemilik

1. **Penyimpanan Token & Kunci Server**:  
   Pastikan nilai `ADMIN_API_TOKEN` dan `PAYMENT_GATEWAY_SERVER_KEY` di dashboard hosting (Vercel/Render/VPS) menggunakan string acak minimal 32 karakter dan tidak pernah dibagikan kepada pihak ketiga.
2. **Setup SSL/HTTPS Wajib**:  
   Domain kustom publik wajib menggunakan sertifikat TLS/SSL aktif (otomatis disediakan oleh Vercel / Cloudflare).
