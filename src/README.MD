# 🚀 Project Update & Development Roadmap: Booking, Payment Gateway, & Admin API

Dokumentasi ini berisi catatan pengembangan, perbaikan bug, dan spesifikasi API untuk modul *Booking*, *Payment Gateway*, *Idempotency Key* (pencegahan pembayaran ganda), serta *Web Admin Dashboard*.

---

## 🛠️ 1. Perbaikan Alur Booking & Tombol Pembayaran
Masalah saat ini: Beberapa tombol booking langsung di website tidak bisa diklik atau belum terhubung secara otomatis ke halaman/proses pembayaran gateway.

### Tugas & Implementasi:
* **Event Listener & Routing:** Pastikan tombol "Book Now" atau "Pesan Sekarang" memiliki event `onclick` atau form submission yang mengarah ke endpoint pemesanan (`/api/bookings` atau controller checkout).
* **Data Payload:** Pastikan data berikut dikirimkan saat tombol diklik:
  * ID Layanan / Paket / Produk
  * Tanggal & Jam Booking (`booking_date`, `booking_time`)
  * Data Customer (Nama, Email, No. Telepon)
  * Total Harga (`total_amount`)
* **Redirect Otomatis:** Setelah data booking berhasil disimpan dengan status `pending`, sistem harus langsung mengarahkan user (atau memunculkan modal/Snap token) ke halaman pembayaran *Payment Gateway*.

---

## 🛡️ 2. Mekanisme Key / Primary (Idempotency Key) untuk Mencegah Double Payment
Untuk menghindari pembayaran ganda atau duplikasi transaksi jika terjadi *error* pada server, timeout, atau user menekan tombol bayar berulang kali saat koneksi terputus.

### Solusi Teknis:
* **Unique Transaction / Order Reference Key:** 
  * Setiap transaksi wajib menghasilkan satu `order_id` atau `idempotency_key` unik sebelum dikirim ke Payment Gateway.
  * Format rekomendasi: `TRX-{USER_ID}-{TIMESTAMP}-{RANDOM_STRING}` (Contoh: `TRX-102-20261012103000-A8F3`).
* **Database Constraint:**
  * Kolom `order_id` atau `payment_reference` pada tabel `payments` harus diset sebagai **UNIQUE** dan **PRIMARY/INDEX**.
* **Alur Validasi Server:**
  1. Ketika webhook/callback dari payment gateway masuk, server mengecek apakah `order_id` tersebut sudah berstatus `success` atau `paid`.
  2. Jika sudah `paid`, abaikan callback kedua untuk mencegah duplikasi pembaruan status atau saldo.
  3. Jika terjadi kegagalan server saat proses checkout, gunakan `order_id` yang sama untuk melanjutkan transaksi yang tertunda tanpa membuat data baru.

---

## 🔌 3. Dokumentasi API untuk Web Admin
API ini dirancang untuk mendukung Web Admin Dashboard agar pengelola dapat memantau transaksi, data pemesan, jadwal, dan ketersediaan, serta mempermudah komunikasi saat terjadi kendala.

### A. Endpoint Pemesanan & Ketersediaan (Bookings & Schedule)
* **`GET /api/admin/bookings`**
  * **Deskripsi:** Mendapatkan daftar semua pesanan masuk.
  * **Query Params (Opsional):** `status` (pending/success/failed), `date` (YYYY-MM-DD).
  * **Response JSON:**
    ```json
    {
      "status": "success",
      "data": [
        {
          "booking_id": "BKG-001",
          "customer_name": "Budi Santoso",
          "phone": "+6281234567890",
          "service_name": "Paket Wisata Desa",
          "booking_date": "2026-10-15",
          "booking_time": "10:00:00",
          "pax": 2,
          "status": "confirmed"
        }
      ]
    }
    ```

* **`GET /api/admin/availability`**
  * **Deskripsi:** Mengecek ketersediaan slot waktu dan kuota tanggal tertentu.
  * **Query Params:** `date=2026-10-15`

---

### B. Endpoint Pembayaran (Payments)
* **`GET /api/admin/payments`**
  * **Deskripsi:** Melacak status pembayaran (siapa yang sudah bayar, nominal, dan metode pembayaran).
  * **Query Params (Opsional):** `start_date`, `end_date`, `status`

* **`GET /api/admin/payments/{order_id}`**
  * **Deskripsi:** Detail spesifik transaksi berdasarkan `order_id` (berguna saat investigasi error pembayaran).

---

### C. Endpoint Kontak Pelanggan (Customer Support)
* **`GET /api/admin/customers`**
  * **Deskripsi:** Menampilkan daftar pelanggan lengkap dengan riwayat booking dan nomor kontak (WhatsApp/Telepon) untuk memudahkan admin menghubungi jika ada kendala atau perubahan jadwal.
* **`POST /api/admin/customers/notify`**
  * **Deskripsi:** (Opsional) Trigger integrasi notifikasi (WhatsApp Gateway / Email) ke customer terkait kendala atau konfirmasi pesanan.

---

## 📋 Checklist Pengembangan Selanjutnya (Todo List)
- [x] Memperbaiki routing tombol booking di frontend agar mengirim data parameter secara utuh. *(Selesai di `src/router.js`, `src/pages/booking.js`, `src/pages/services.js`)*
- [x] Mengimplementasikan fungsi `generateIdempotencyKey()` pada backend sebelum melakukan request ke Payment Gateway. *(Selesai di `src/utils/idempotency.js`, `vite.config.js`, `server.js`)*
- [x] Menambahkan constraint `UNIQUE` pada kolom referensi pembayaran di database. *(Selesai di `database/schema.sql`, `database/init-db.js`, `database/booking.db`)*
- [x] Membuat route dan controller API admin untuk manajemen data booking, pembayaran, dan kontak customer. *(Selesai di `vite.config.js`, `server.js`, `src/api/adminController.js`)*
- [x] Menghubungkan Web Admin Dashboard dengan endpoint API yang telah dibuat. *(Selesai di `src/pages/admin.js` & rute `#/admin`)*