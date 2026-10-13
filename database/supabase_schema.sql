-- ==============================================================================
-- SKEMA TABEL: bookings (Supabase PostgreSQL)
-- Sacred Journey Bali / MahawellnesJourney Booking System
-- ==============================================================================

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

-- 3. Indeks untuk performa query Web Admin & Web Booking
CREATE INDEX IF NOT EXISTS idx_bookings_invoice_number ON public.bookings(invoice_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_date ON public.bookings(tour_date);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan Keamanan RLS untuk Role 'anon' (Frontend Public Booking)

-- Izinkan public anon memasukkan data pemesanan baru
DROP POLICY IF EXISTS "Allow public anon insert to bookings" ON public.bookings;
CREATE POLICY "Allow public anon insert to bookings"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (true);

-- Izinkan public anon membaca data booking berdasarkan nomor invoice
DROP POLICY IF EXISTS "Allow public anon select bookings" ON public.bookings;
CREATE POLICY "Allow public anon select bookings"
ON public.bookings
FOR SELECT
TO anon
USING (true);

-- Izinkan public anon mengupdate status booking (misal konfirmasi pembayaran)
DROP POLICY IF EXISTS "Allow public anon update booking status" ON public.bookings;
CREATE POLICY "Allow public anon update booking status"
ON public.bookings
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Catatan untuk Web Admin:
-- Service role key / Authenticated role memiliki akses penuh (bypass RLS / authenticated full access).
