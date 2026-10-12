/**
 * Database Initializer & Migration Runner
 * Menggunakan engine SQLite bawaan Node.js 24 (node:sqlite)
 * Menguji dan menegakkan constraint UNIQUE pada kolom order_id & idempotency_key
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'booking.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

export function getDatabase() {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export function initDatabase() {
  console.log('🔄 Menginisialisasi Database SQLite di:', DB_PATH);
  const db = getDatabase();

  // 1. Eksekusi Schema DDL
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);
  console.log('✅ Skema tabel berhasil dieksekusi (Customers, Services, Packages, Bookings, Payments, Availability).');

  // 2. Cek apakah data sudah ada
  const countRow = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  if (countRow.count > 0) {
    console.log('ℹ️ Database sudah terisi dengan', countRow.count, 'pelanggan. Melewati seeding.');
    return db;
  }

  // 3. Seed Customers
  const insertCustomer = db.prepare(`
    INSERT INTO customers (customer_id, name, email, phone, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertCustomer.run('CUST-001', 'Budi Santoso', 'budi.santoso@example.com', '+6281234567890', 'Pelanggan setia');
  insertCustomer.run('CUST-002', 'Sarah Jenkins', 'sarah.j@outlook.com', '+6281987654321', 'Wisatawan asing - Australia');
  insertCustomer.run('CUST-003', 'Wayan Arya Wiguna', 'wayan.arya@bali.com', '+6287711223344', 'Warga lokal Ubud');
  insertCustomer.run('CUST-004', 'Elena Rostova', 'elena.rostova@mail.ru', '+79161234567', 'Wisatawan Rusia');

  // 4. Seed Services & Packages
  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (service_id, service_name, category, description, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertService.run('SRV001', 'Spiritual Temple Tour', 'Tour', 'Jelajahi pura-pura suci Bali dengan panduan spiritual.', 'active');
  insertService.run('SRV002', 'Yoga & Meditation Retreat', 'Retreat', 'Retreat yoga dan meditasi intensif di tengah alam Ubud.', 'active');
  insertService.run('SRV003', 'Numerology Consultation', 'Numerology', 'Konsultasi numerologi personal untuk memahami potensi diri.', 'active');
  insertService.run('SRV004', 'Healing & Purification', 'Healing', 'Sesi penyembuhan holistik melukat di tirta empul.', 'active');

  const insertPackage = db.prepare(`
    INSERT OR IGNORE INTO packages (package_id, service_id, package_name, price, duration, description, popular)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertPackage.run('PKG001', 'SRV001', 'Sacred Discovery', 350000, '3 jam', 'Kunjungan 2 pura sakral.', 0);
  insertPackage.run('PKG002', 'SRV001', 'Divine Journey', 650000, '6 jam', 'Perjalanan spiritual lengkap ke 4 pura.', 1);
  insertPackage.run('PKG003', 'SRV001', 'Enlightenment Path', 1200000, '1 Hari Penuh', 'Pengalaman spiritual penuh sehari ritual melukat.', 0);

  // 5. Seed Bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings (booking_id, customer_id, service_id, package_id, booking_date, booking_time, pax, subtotal, tax, total_amount, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBooking.run('BKG-001', 'CUST-001', 'SRV001', 'PKG002', '2026-10-15', '10:00:00', 2, 1300000, 143000, 1443000, 'confirmed', 'Mohon pakaian putih');
  insertBooking.run('BKG-002', 'CUST-002', 'SRV001', 'PKG003', '2026-10-16', '09:00:00', 1, 1200000, 132000, 1332000, 'pending', 'Vegetarian lunch');
  insertBooking.run('BKG-003', 'CUST-003', 'SRV004', 'PKG002', '2026-10-14', '14:00:00', 2, 800000, 88000, 888000, 'confirmed', 'Upacara keluarga');
  insertBooking.run('BKG-004', 'CUST-004', 'SRV003', 'PKG001', '2026-10-12', '11:00:00', 1, 350000, 38500, 388500, 'failed', 'Koneksi terputus');

  // 6. Seed Payments dengan UNIQUE order_id & idempotency_key
  const insertPayment = db.prepare(`
    INSERT INTO payments (payment_id, booking_id, order_id, idempotency_key, payment_reference, payment_method, amount, status, paid_at, expired_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPayment.run('PAY-001', 'BKG-001', 'TRX-101-20261011091500-A8F3', 'TRX-101-20261011091500-A8F3', 'PGW-MDTR-99881122', 'QRIS', 1443000, 'paid', '2026-10-11 09:16:30', '2026-10-12 09:15:00');
  insertPayment.run('PAY-002', 'BKG-002', 'TRX-102-20261011134000-B7C4', 'TRX-102-20261011134000-B7C4', 'PGW-MDTR-99881144', 'BCA Virtual Account', 1332000, 'pending', null, '2026-10-12 13:40:00');
  insertPayment.run('PAY-003', 'BKG-003', 'TRX-103-20261010102000-E3D9', 'TRX-103-20261010102000-E3D9', 'PGW-MDTR-99881099', 'Credit Card', 888000, 'paid', '2026-10-10 10:22:15', '2026-10-11 10:20:00');
  insertPayment.run('PAY-004', 'BKG-004', 'TRX-104-20261012011000-F1A2', 'TRX-104-20261012011000-F1A2', 'PGW-MDTR-99881011', 'QRIS', 388500, 'failed', null, '2026-10-13 01:10:00');

  console.log('✅ Seeding awal berhasil disimpan ke SQLite.');

  // 7. Test Constraint UNIQUE pada order_id
  try {
    console.log('🧪 Menguji perlindungan UNIQUE constraint pada kolom order_id...');
    insertPayment.run('PAY-DUP', 'BKG-001', 'TRX-101-20261011091500-A8F3', 'TRX-101-20261011091500-A8F3', 'PGW-DUP', 'QRIS', 1443000, 'paid', null, '2026-10-12');
    console.error('❌ Error: UNIQUE constraint gagal mencegah duplikasi!');
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.log('🛡️ SUKSES: UNIQUE constraint aktif! Duplikasi order_id berhasil ditolak:', err.message);
    } else {
      console.warn('Peringatan error lain:', err.message);
    }
  }

  return db;
}

// Jalankan otomatis jika dipanggil langsung via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase();
}
