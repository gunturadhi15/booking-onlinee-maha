# 🌟 Panduan Integrasi Supabase: Web Booking & Web Admin

Dokumen ini berisi panduan lengkap dan dokumentasi teknis mengenai integrasi **Web Booking** dengan database terpusat **Supabase PostgreSQL** yang terhubung langsung dengan **Web Admin**.

---

## 📋 1. Setup Database & Environment Variables-"-

### A. Dependensi Client
Proyek ini menggunakan library resmi Supabase JS:
```bash
npm install @supabase/supabase-js
```
*(Sudah terpasang di `package.json`)*.

---

### B. Konfigurasi Client (`src/api/supabase.js`)
File konfigurasi dibuat pada `src/api/supabase.js` (dengan re-export di `src/utils/supabase.js`).
Modul ini membaca environment variable:
- `NEXT_PUBLIC_SUPABASE_URL` *(alias fallback: `VITE_SUPABASE_URL`)*
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(alias fallback: `VITE_SUPABASE_ANON_KEY`)*

Pada `vite.config.js`, prefix variabel lingkungan telah dikonfigurasi:
```javascript
export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  // ...
});
```
Dengan konfigurasi ini, variabel dengan awalan `NEXT_PUBLIC_` dapat dibaca secara aman baik pada lingkungan lokal (Vite) maupun deployment produksi Vercel.

---

### C. Daftar Environment Variables untuk Dashboard Vercel
Tambahkan 2 variabel lingkungan berikut pada menu **Settings > Environment Variables** di dashboard project Vercel Anda:

| Variable Name | Nilai / Value | Keterangan |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | URL project Supabase Anda (Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Public `anon` / `public` API Key |

> 💡 **Untuk Pengujian Lokal:**
> Salin file `.env.example` menjadi `.env.local` lalu isi dengan kredensial Supabase Anda:
> ```bash
> NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
> NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
> ```

---

## 🗄️ 2. Skema Tabel Database (`bookings`)

Tabel `bookings` di Supabase dirancang sesuai spesifikasi skema berikut:

### Struktur Kolom Tabel `bookings`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (`DEFAULT gen_random_uuid()`) |
| `customer_name` | `TEXT` | Nama lengkap pemesan |
| `customer_phone` | `TEXT` | Nomor telepon / WhatsApp pemesan |
| `customer_email` | `TEXT` | Alamat email pemesan |
| `package_name` | `TEXT` | Nama paket layanan yang dipilih |
| `tour_date` | `DATE` | Tanggal reservasi / tur |
| `total_price` | `NUMERIC` | Total harga pembayaran |
| `status` | `TEXT` | Default: `'pending'`. Opsi: `'pending'`, `'paid'`, `'completed'`, `'cancelled'` |
| `invoice_number` | `TEXT` | Kode referensi invoice unik (`UNIQUE`) |
| `created_at` | `TIMESTAMPTZ` | Timestamp waktu pembuatan (UTC) |

---

### SQL Migration Script (Siap Dijalankan di Supabase SQL Editor)
File query SQL lengkap telah disediakan pada `database/supabase_schema.sql`. Anda cukup menyalin dan mengeksekusi script berikut pada **Supabase Dashboard > SQL Editor**:

```sql
-- 1. Buat ekstensi UUID jika belum ada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Buat tabel `bookings`
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    package_name TEXT NOT NULL,
    tour_date DATE NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
    invoice_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat Indeks untuk query performa cepat
CREATE INDEX IF NOT EXISTS idx_bookings_invoice_number ON public.bookings(invoice_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_date ON public.bookings(tour_date);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan Keamanan RLS untuk Role 'anon' (Frontend Public)
DROP POLICY IF EXISTS "Allow public anon insert to bookings" ON public.bookings;
CREATE POLICY "Allow public anon insert to bookings"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon select bookings" ON public.bookings;
CREATE POLICY "Allow public anon select bookings"
ON public.bookings
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Allow public anon update booking status" ON public.bookings;
CREATE POLICY "Allow public anon update booking status"
ON public.bookings
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
```

---

## 🔄 3. Implementasi Pemesanan & Pembayaran (Booking Flow)

### A. Alur Pemesanan (Formulir Booking ke Supabase)
1. Calon pelanggan memilih layanan dan paket di halaman `#/layanan`.
2. Pelanggan memilih tanggal dan jam di halaman `#/booking`, lalu mengisi data diri (Nama, Email, WhatsApp).
3. Saat tombol **"Lanjut ke Pembayaran"** diklik:
   - Tombol berubah menjadi status loading dengan animasi spinner (`Menyimpan Pemesanan...`).
   - Fungsi `createBookingInSupabase(bookingPayload)` dipanggil dengan struktur payload:
     ```javascript
     {
       customer_name: bookingState.customer_name,
       customer_phone: bookingState.whatsapp,
       customer_email: bookingState.email,
       package_name: pkg.package_name,
       tour_date: bookingState.booking_date,
       total_price: grandTotal,
       status: 'pending',
       invoice_number: invoiceId
     }
     ```
   - Jika Supabase belum dihubungkan dengan API key valid, sistem menggunakan mode simulasi lokal otomatis tanpa memutus alur pengguna (*graceful fallback*).
   - Seluruh detail pemesanan disimpan ke `sessionStorage` dan user diarahkan ke `#/checkout`.

### B. Alur Pembayaran & Konfirmasi (Checkout & Invoice)
1. Di halaman `#/checkout`, rincian biaya, nomor invoice, dan metode pembayaran ditampilkan.
2. Saat tombol **"Bayar Sekarang"** diklik:
   - Tombol pembayaran menampilkan spinner loading (`Memproses Pembayaran...`).
   - Sistem memanggil `updateBookingStatusInSupabase(invoiceNumber, 'paid')` untuk memperbarui status pesanan menjadi `'paid'` di Supabase.
   - Pelanggan otomatis diarahkan ke halaman invoice resmi `#/invoice/{invoiceNumber}`.
3. Di halaman `#/invoice/{id}`:
   - Sistem melakukan sinkronisasi data dari tabel `bookings` di Supabase melalui `getBookingByInvoiceFromSupabase(invoiceId)`.
   - Menampilkan status **LUNAS / CONFIRMED**, detail paket, data pemesan, serta tombol konfirmasi instan via WhatsApp.

---

## 📁 File yang Terkait & Diperbarui
- `src/api/supabase.js` - Konfigurasi Supabase Client, fungsi `createBookingInSupabase()`, `updateBookingStatusInSupabase()`, dan `getBookingByInvoiceFromSupabase()`.
- `src/pages/booking.js` - Integrasi form submission, indikator loading, dan pengiriman payload ke Supabase.
- `src/pages/checkout.js` - Pembaruan status pembayaran ke Supabase menjadi `'paid'` saat proses pembayaran selesai.
- `src/pages/invoice.js` - Sinkronisasi dan pembacaan invoice langsung dari tabel Supabase.
- `database/supabase_schema.sql` - Skema DDL PostgreSQL dan kebijakan keamanan RLS Supabase.
- `vite.config.js` - Dukungan `envPrefix` untuk variabel lingkungan `NEXT_PUBLIC_`.
- `.env.example` - Template environment variable.