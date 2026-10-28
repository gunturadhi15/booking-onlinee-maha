# Rencana Pengujian & Quality Assurance (Test Plan)

Proyek: **Mahawellnerjourney**  
Framework Pengujian: Native Node.js Test Runner (`node:test`, `node:assert`)  
Lingkungan: Node.js v24.x LTS  

---

## 1. Skenario Pengujian Fungsional (Functional Tests)

| ID | Skenario Pengujian | Input Uji | Hasil yang Diharapkan | Lokasi Test |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F01** | Pemesanan Valid dengan Paket Resmi | Data pelanggan lengkap, `package_id: PKG001`, tanggal valid H+2, waktu `09:00`, `pax: 2` | Response `201 Created`, total harga dihitung ulang oleh server (`subtotal = pkg.price * pax`), status awal = `pending`. | `test/api-booking.test.js` |
| **TC-F02** | Validasi Format Nama Tamu | Nama < 2 karakter atau mengandung karakter injeksi | Ditolak HTTP `422 Unprocessable Entity` dengan kode `ERR_VALIDATION`. | `test/security.test.js` |
| **TC-F03** | Validasi Email Standar | Format email salah (contoh: `user@domain`, `invalid-email`) | Ditolak HTTP `422 Unprocessable Entity`. | `test/security.test.js` |
| **TC-F04** | Sanitasi Nomor Telepon Internasional (E.164) | `+62 0812-3456-7890` atau `62 812 3456 7890` | Dikonversi bersih menjadi `6281234567890` (7–15 digit tanpa 0 di depan). | `test/security.test.js` |
| **TC-F05** | Perlindungan Manipulasi Harga dari Client | Client mengirim `total_amount: 1000` padahal harga paket Rp 350.000 | Server mengabaikan harga dari client dan menghitung `total_amount = 350000`. | `test/api-booking.test.js` |
| **TC-F06** | Penolakan Tanggal Masa Lalu (Past Date) | Tanggal sebelum hari ini (kemarin) | Ditolak HTTP `422 Unprocessable Entity` ("Tanggal di luar rentang yang diizinkan"). | `test/api-booking.test.js` |
| **TC-F07** | Batasan Jumlah Peserta (Max Pax) | `pax: 0` atau `pax: 99` (melebihi kapasitas layanan) | Ditolak HTTP `422 Unprocessable Entity`. | `test/api-booking.test.js` |

---

## 2. Skenario Edge Cases & Concurrency (Pengujian Konkurensi)

| ID | Skenario Pengujian | Input Uji | Hasil yang Diharapkan | Lokasi Test |
| :--- | :--- | :--- | :--- | :--- |
| **TC-C01** | Pengujian Kapasitas Slot Maksimal (Overbooking) | Slot waktu sudah terisi 6 pax, datang permintaan baru memesan 4 pax (total 10 pax > kapasitas 8) | Transaksi kedua ditolak dengan HTTP `409 Conflict` (`ERR_SLOT_FULL`). Database tetap konsisten. | `test/concurrency-capacity.test.js` |
| **TC-C02** | Pencegahan Klik Ganda / Double Submission | Dua request dengan `idempotency_key` yang sama dikirim bersamaan | Request pertama sukses `201 Created`, request kedua ditolak oleh constraint `UNIQUE` database atau dicegah idempotency lock. | `test/concurrency-capacity.test.js` |
| **TC-C03** | Akses Endpoint Admin Tanpa Token | `GET /api/admin/bookings` tanpa header `Authorization` | Ditolak HTTP `401 Unauthorized`. | `test/admin-auth.test.js` |
| **TC-C04** | Akses Endpoint Admin dengan Token Salah | `GET /api/admin/bookings` dengan header `Authorization: Bearer wrong-token` | Ditolak HTTP `401 Unauthorized` secara timing-safe. | `test/admin-auth.test.js` |
| **TC-C05** | Proteksi Brute-Force Percobaan Login Admin | 11 request gagal berturut-turut ke endpoint admin | Request ke-11 diblokir dengan HTTP `429 Too Many Requests`. | `test/admin-auth.test.js` |

---

## 3. Skenario Aksesibilitas & UI (Manual QA & Visual)

| ID | Aspek Pengujian | Kriteria Pemeriksaan | Status / Target |
| :--- | :--- | :--- | :--- |
| **TC-UI01** | Kontras Warna & Keterbacaan Teks | Rasio kontras teks utama terhadap background minimal 4.5:1 (WCAG AA). | Terpenuhi pada palet Forest Green & Canvas. |
| **TC-UI02** | Navigasi Keyboard (Tab, Enter, Space) | Seluruh tombol, link, opsi input form, dan tab booking dapat diakses tanpa mouse. Tampilan fokus terlihat jelas. | Terpenuhi via `:focus-visible` styling. |
| **TC-UI03** | Perilaku Dialog Modal (Chatbot & Payment) | Menekan tombol `Escape` menutup modal; fokus keyboard terkurung di dalam modal saat aktif. | Diuji pada komponen modal. |
| **TC-UI04** | Responsivitas Layar Ponsel (360px, 390px, 768px, 1440px) | Tidak ada teks atau tabel harga yang terpotong secara horizontal di layar kecil. Ukuran area sentuh minimal 44x44px. | Diuji via dual-mode catalog table & mobile cards. |
| **TC-UI05** | Form Kontak Inline Feedback | Form kontak menampilkan feedback visual elegan tanpa native `alert()` yang memblokir layar. | Terverifikasi setelah refactor. |

---

## 4. Cara Menjalankan Test Otomatis

Jalankan rangkaian pengujian otomatis di terminal proyek:

```bash
# 1. Jalankan seluruh automated test suite (Unit & Integration)
npm test

# 2. Jalankan build produksi Vite untuk memastikan tidak ada syntax/bundling error
npm run build

# 3. Jalankan pengujian inisialisasi & constraint database SQLite
npm run db:init
```
