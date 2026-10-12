-- =====================================================================
-- Sacred Journey Bali - Database Schema & Constraints
-- Modul: Booking, Payment Gateway, Idempotency Protection, & Admin API
-- =====================================================================

-- 1. Tabel Pelanggan (Customers)
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 2. Tabel Layanan & Paket (Services & Packages)
CREATE TABLE IF NOT EXISTS services (
    service_id VARCHAR(20) PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
    package_id VARCHAR(20) PRIMARY KEY,
    service_id VARCHAR(20) NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    package_name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Pemesanan (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(customer_id),
    service_id VARCHAR(20) NOT NULL REFERENCES services(service_id),
    package_id VARCHAR(20) NOT NULL REFERENCES packages(package_id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    pax INT DEFAULT 1,
    notes TEXT,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);

-- 4. Tabel Pembayaran (Payments)
-- KUNCI TEKNIS PENTING:
-- Kolom 'order_id' dan 'idempotency_key' memiliki constraint UNIQUE
-- untuk mencegah pembayaran ganda / duplikasi transaksi akibat server error,
-- timeout, atau double-click pada frontend/payment gateway.
CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    order_id VARCHAR(64) NOT NULL UNIQUE,          -- FORMAT: TRX-{USER_ID}-{TIMESTAMP}-{RANDOM_STRING}
    idempotency_key VARCHAR(64) NOT NULL UNIQUE,   -- Idempotency key untuk memblokir duplikasi request
    payment_reference VARCHAR(64) UNIQUE,          -- Nomor referensi transaksi dari Payment Gateway
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'IDR',
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    expired_at TIMESTAMP NOT NULL,
    raw_gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index khusus untuk query monitoring admin & callback gateway
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 5. Tabel Ketersediaan Slot (Availability Slots)
CREATE TABLE IF NOT EXISTS availability_slots (
    slot_id VARCHAR(50) PRIMARY KEY,
    service_id VARCHAR(20) NOT NULL REFERENCES services(service_id),
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    max_capacity INT DEFAULT 10,
    booked_count INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (service_id, slot_date, slot_time)
);

-- 6. Tabel Log Notifikasi Pelanggan (Customer Notifications)
CREATE TABLE IF NOT EXISTS customer_notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(customer_id),
    booking_id VARCHAR(50) REFERENCES bookings(booking_id),
    channel VARCHAR(20) NOT NULL,
    template VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
