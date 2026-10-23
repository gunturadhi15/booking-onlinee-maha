-- ==============================================================================
-- SKEMA TABEL: bookings (Supabase PostgreSQL) - HIGH SECURITY HARDENED
-- Sacred Journey Bali / Mahawellnerjourney Booking System
-- ==============================================================================

-- 1. Buat ekstensi UUID jika belum ada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Buat tabel `bookings` dengan validasi constraint ketat
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) >= 2 AND length(customer_name) <= 100),
    customer_phone TEXT NOT NULL CHECK (length(trim(customer_phone)) >= 7 AND length(customer_phone) <= 20),
    customer_email TEXT NOT NULL CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    package_name TEXT NOT NULL CHECK (length(package_name) <= 150),
    tour_date DATE NOT NULL,
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled')),
    invoice_number TEXT NOT NULL UNIQUE CHECK (invoice_number ~* '^INV-[A-Z0-9-]{6,40}$'),
    notes TEXT CHECK (notes IS NULL OR length(notes) <= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indeks untuk performa query Web Admin & Web Booking
CREATE INDEX IF NOT EXISTS idx_bookings_invoice_number ON public.bookings(invoice_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_date ON public.bookings(tour_date);

-- 4. Aktifkan Row Level Security (RLS) Wajib
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Bersihkan policy lama yang longgar / rentan
DROP POLICY IF EXISTS "Allow public anon insert to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public anon select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public anon update booking status" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon insert pending booking only" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon select single invoice" ON public.bookings;

-- 6. Policy INSERT: Public/anon HANYA diizinkan mendaftar booking dengan status 'pending'
--    Mencegah penyerang menyisipkan status 'paid' atau memanipulasi kolom terlarang langsung via frontend.
CREATE POLICY "Allow anon insert pending booking only"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (
    status = 'pending'
    AND total_price >= 0
    AND length(trim(customer_name)) >= 2
    AND length(trim(customer_phone)) >= 7
);

-- 7. Policy UPDATE: DITUTUP TOTAL untuk anon (Zero-Trust)
--    Perubahan status ke 'paid' / 'confirmed' / 'cancelled' HANYA boleh dilakukan oleh:
--    - Service Role (Backend API / Web Admin terverifikasi)
--    - Webhook Payment Gateway resmi (Midtrans/Xendit/Stripe)
--    Tidak ada policy UPDATE untuk role 'anon'.

-- 8. Policy DELETE: DITUTUP TOTAL untuk anon
--    Tidak ada policy DELETE untuk role 'anon'.

-- 9. Pencegahan Data Scraping: RPC aman untuk membaca invoice tunggal
--    Jika anon diizinkan SELECT * langsung dari tabel, penyerang bisa scraping seluruh nama & no HP pelanggan.
--    Sebagai gantinya, gunakan function SECURITY DEFINER yang mewajibkan nomor invoice spesifik.
CREATE OR REPLACE FUNCTION public.get_booking_by_invoice(p_invoice_number TEXT)
RETURNS TABLE (
    invoice_number TEXT,
    customer_name TEXT,
    package_name TEXT,
    tour_date DATE,
    total_price NUMERIC,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.invoice_number,
        b.customer_name,
        b.package_name,
        b.tour_date,
        b.total_price,
        b.status,
        b.created_at
    FROM public.bookings b
    WHERE b.invoice_number = trim(p_invoice_number)
    LIMIT 1;
END;
$$;

-- Beri izin eksekusi RPC hanya untuk anon dan authenticated
GRANT EXECUTE ON FUNCTION public.get_booking_by_invoice(TEXT) TO anon, authenticated;

-- Catatan Keamanan:
-- 1. Gunakan SUPABASE_SERVICE_ROLE_KEY HANYA di server-side backend (Web Admin / Webhook),
--    JANGAN PERNAH diekspos ke frontend (Vite/Browser/Vercel Client).
-- 2. Frontend hanya memegang NEXT_PUBLIC_SUPABASE_ANON_KEY.
