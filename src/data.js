/**
 * Services & Packages Data
 * Sumber data katalog layanan untuk frontend
 * Pada MVP, data ini akan juga disimpan di Google Sheets
 */

import { getDateLocale } from './i18n.js';

export const SERVICES = [
  {
    service_id: 'SRV001',
    service_name: 'Spiritual Temple Tour',
    description: 'Jelajahi pura-pura suci Bali dengan panduan spiritual yang berpengalaman. Nikmati upacara pembersihan diri, meditasi di tempat-tempat sakral, dan pelajari filosofi Hindu-Bali yang mendalam.',
    category: 'Tour',
    status: 'active',
    image: null, // Will be generated
    slug: 'spiritual-temple-tour',
  },
  {
    service_id: 'SRV002',
    service_name: 'Yoga & Meditation Retreat',
    description: 'Retreat yoga dan meditasi intensif di tengah alam Ubud. Temukan kedamaian batin melalui praktik yoga harian, meditasi mindfulness, dan terapi penyembuhan tradisional Bali.',
    category: 'Retreat',
    status: 'active',
    image: null,
    slug: 'yoga-meditation-retreat',
  },
  {
    service_id: 'SRV003',
    service_name: 'Numerology Consultation',
    description: 'Konsultasi numerologi personal untuk memahami potensi diri, jodoh, karier, dan keberuntungan berdasarkan angka kelahiran. Dipandu oleh praktisi numerologi berpengalaman.',
    category: 'Numerology',
    status: 'active',
    image: null,
    slug: 'numerology-consultation',
  },
  {
    service_id: 'SRV004',
    service_name: 'Healing & Purification',
    description: 'Sesi penyembuhan holistik yang menggabungkan melukat (upacara pembersihan air suci), terapi energi, dan ritual pembersihan aura tradisional Bali untuk memulihkan keseimbangan jiwa.',
    category: 'Healing',
    status: 'active',
    image: null,
    slug: 'healing-purification',
  },
];

export const PACKAGES = [
  // SRV001 - Spiritual Temple Tour
  {
    package_id: 'PKG001',
    service_id: 'SRV001',
    package_name: 'Sacred Discovery',
    price: 350000,
    duration: '3 jam',
    description: 'Kunjungi 2 pura sakral dengan panduan spiritual.',
    benefits: [
      'Kunjungan 2 Pura Sakral',
      'Panduan Spiritual Profesional',
      'Upacara Pembersihan Diri',
      'Air Mineral & Snack',
      'Transportasi PP',
    ],
    status: 'active',
    popular: false,
  },
  {
    package_id: 'PKG002',
    service_id: 'SRV001',
    package_name: 'Divine Journey',
    price: 650000,
    duration: '6 jam',
    description: 'Perjalanan spiritual lengkap ke 4 pura dengan meditasi.',
    benefits: [
      'Kunjungan 4 Pura Sakral',
      'Panduan Spiritual Senior',
      'Meditasi di Pura Utama',
      'Upacara Pembersihan Diri',
      'Makan Siang Tradisional',
      'Transportasi PP',
      'Dokumentasi Foto',
    ],
    status: 'active',
    popular: true,
  },
  {
    package_id: 'PKG003',
    service_id: 'SRV001',
    package_name: 'Enlightenment Path',
    price: 1200000,
    duration: '1 Hari Penuh',
    description: 'Pengalaman spiritual penuh sehari dengan ritual dan meditasi mendalam.',
    benefits: [
      'Kunjungan 6 Pura Sakral',
      'Panduan Spiritual Master',
      'Upacara Melukat',
      'Meditasi Mendalam',
      'Sarapan & Makan Siang',
      'Transportasi Mewah',
      'Dokumentasi Foto & Video',
      'Blessing Ceremony',
      'Sertifikat Perjalanan',
    ],
    status: 'active',
    popular: false,
  },

  // SRV002 - Yoga & Meditation Retreat
  {
    package_id: 'PKG004',
    service_id: 'SRV002',
    package_name: 'Morning Bliss',
    price: 250000,
    duration: '2 jam',
    description: 'Sesi yoga pagi di tengah persawahan Ubud.',
    benefits: [
      'Yoga Hatha 90 menit',
      'Meditasi Guided 30 menit',
      'Teh Herbal Bali',
      'Mat & Props Yoga',
    ],
    status: 'active',
    popular: false,
  },
  {
    package_id: 'PKG005',
    service_id: 'SRV002',
    package_name: 'Inner Peace',
    price: 500000,
    duration: '4 jam',
    description: 'Retreat setengah hari dengan yoga, meditasi, dan sound healing.',
    benefits: [
      'Yoga Vinyasa 90 menit',
      'Meditasi Chakra 45 menit',
      'Sound Healing Tibetan Bowl',
      'Brunch Sehat Organik',
      'Essential Oil Therapy',
      'Mat & Props Yoga',
    ],
    status: 'active',
    popular: true,
  },
  {
    package_id: 'PKG006',
    service_id: 'SRV002',
    package_name: 'Awakening Soul',
    price: 950000,
    duration: '1 Hari Penuh',
    description: 'Full day retreat: yoga, meditasi, breathwork, dan terapi holistik.',
    benefits: [
      'Yoga Sunrise 60 menit',
      'Pranayama & Breathwork',
      'Meditasi Transcendental',
      'Sound Healing Session',
      'Sarapan & Makan Siang Organik',
      'Aromatherapy Treatment',
      'Crystal Healing',
      'Personal Mantra',
    ],
    status: 'active',
    popular: false,
  },

  // SRV003 - Numerology Consultation
  {
    package_id: 'PKG007',
    service_id: 'SRV003',
    package_name: 'Basic Reading',
    price: 200000,
    duration: '45 menit',
    description: 'Analisis numerologi dasar berdasarkan tanggal lahir.',
    benefits: [
      'Life Path Number',
      'Karakter & Kepribadian',
      'Angka Keberuntungan',
      'Laporan PDF',
    ],
    status: 'active',
    popular: false,
  },
  {
    package_id: 'PKG008',
    service_id: 'SRV003',
    package_name: 'Deep Analysis',
    price: 450000,
    duration: '90 menit',
    description: 'Analisis numerologi lengkap: jodoh, karier, dan tahun personal.',
    benefits: [
      'Life Path Number',
      'Compatibility Analysis',
      'Career Path Guidance',
      'Personal Year Forecast',
      'Lucky Numbers & Days',
      'Laporan PDF Lengkap',
      'Follow-up Chat 7 Hari',
    ],
    status: 'active',
    popular: true,
  },
  {
    package_id: 'PKG009',
    service_id: 'SRV003',
    package_name: 'Master Blueprint',
    price: 850000,
    duration: '2.5 jam',
    description: 'Blueprint kehidupan lengkap dengan peta numerologi 12 bulan.',
    benefits: [
      'Full Numerology Chart',
      'Soul & Personality Numbers',
      'Compatibility Deep Dive',
      'Career & Finance Forecast',
      'Monthly Guidance 12 Bulan',
      'Personal Mantra & Ritual',
      'Laporan PDF Premium',
      'Follow-up Chat 30 Hari',
      'Voice Note Guidance',
    ],
    status: 'active',
    popular: false,
  },

  // SRV004 - Healing & Purification
  {
    package_id: 'PKG010',
    service_id: 'SRV004',
    package_name: 'Melukat Basic',
    price: 300000,
    duration: '2 jam',
    description: 'Upacara pembersihan air suci di Tirta Empul.',
    benefits: [
      'Upacara Melukat',
      'Doa & Mantra',
      'Sesaji Tradisional',
      'Panduan Spiritual',
    ],
    status: 'active',
    popular: false,
  },
  {
    package_id: 'PKG011',
    service_id: 'SRV004',
    package_name: 'Soul Renewal',
    price: 600000,
    duration: '4 jam',
    description: 'Ritual pembersihan lengkap dengan terapi energi dan aura cleansing.',
    benefits: [
      'Upacara Melukat Premium',
      'Aura Cleansing',
      'Energy Healing Session',
      'Herbal Bath Ritual',
      'Teh Jamu Tradisional',
      'Panduan Spiritual Senior',
    ],
    status: 'active',
    popular: true,
  },
  {
    package_id: 'PKG012',
    service_id: 'SRV004',
    package_name: 'Total Rebirth',
    price: 1100000,
    duration: '1 Hari Penuh',
    description: 'Transformasi total: melukat, healing, dan reborn ceremony.',
    benefits: [
      'Grand Melukat Ceremony',
      'Full Aura & Chakra Healing',
      'Reborn Ceremony',
      'Flower Bath Ritual',
      'Herbal Medicine Treatment',
      'Sarapan & Makan Siang Sacred',
      'Panduan Spiritual Master',
      'Personal Blessing',
      'Sertifikat Spiritual',
    ],
    status: 'active',
    popular: false,
  },
];

export const FAQ = [
  {
    faq_id: 'FAQ001',
    question: 'Apakah saya perlu membuat akun untuk booking?',
    answer: 'Tidak perlu. Anda bisa langsung booking tanpa membuat akun. Cukup isi nama, email, dan nomor WhatsApp.',
    category: 'Booking',
    status: 'active',
  },
  {
    faq_id: 'FAQ002',
    question: 'Bagaimana cara melakukan pembayaran?',
    answer: 'Kami menyediakan beberapa metode pembayaran: QRIS, Transfer Bank (Virtual Account), dan Kartu Debit/Kredit.',
    category: 'Payment',
    status: 'active',
  },
  {
    faq_id: 'FAQ003',
    question: 'Berapa lama batas waktu pembayaran?',
    answer: 'Batas waktu pembayaran adalah 24 jam setelah booking dibuat. Jika melebihi batas waktu, booking akan otomatis dibatalkan.',
    category: 'Payment',
    status: 'active',
  },
  {
    faq_id: 'FAQ004',
    question: 'Apakah bisa reschedule jadwal?',
    answer: 'Ya, reschedule dapat dilakukan maksimal 24 jam sebelum jadwal yang telah ditentukan. Silakan hubungi customer service kami.',
    category: 'Booking',
    status: 'active',
  },
  {
    faq_id: 'FAQ005',
    question: 'Apakah ada dress code khusus?',
    answer: 'Untuk kunjungan pura, wajib menggunakan sarung dan selendang. Untuk yoga & healing, gunakan pakaian yang nyaman. Kami menyediakan sarung untuk peminjaman.',
    category: 'General',
    status: 'active',
  },
  {
    faq_id: 'FAQ006',
    question: 'Apakah layanan tersedia setiap hari?',
    answer: 'Layanan tersedia setiap hari kecuali hari-hari besar keagamaan Hindu (Nyepi, Galungan, dll). Jam operasional: 09:00 - 17:00 WITA.',
    category: 'General',
    status: 'active',
  },
];

export const COMPANY = {
  name: 'Mahawellnerjourney',
  tagline: 'Sacred Wellness & Curated Journeys in Ubud, Bali',
  description: 'Mahawellnerjourney adalah sanctuary resmi dan kurator perjalanan wellness berwibawa di Bali. Memadukan kearifan tradisi Bali, pemurnian diri, meditasi hening, dan penyelarasan energi holistik dalam ketenangan yang autentik.',
  history: 'Didirikan berakar pada filosofi Tri Hita Karana, Mahawellnerjourney hadir sebagai oase ketenangan untuk memfasilitasi transformasi batin, pemulihan jiwa, dan eksplorasi kesadaran di tanah sakral Pulau Dewata.',
  vision: 'Menjadi sanctuary terpercaya yang menghadirkan pengalaman spiritual dan wellness berstandar internasional dengan tetap menjunjung kesakralan tradisi leluhur Bali.',
  mission: 'Menyelenggarakan perjalanan spiritual dan sesi wellness personal berkelas dengan bimbingan praktisi senior, kepastian layanan tanpa kompromi, dan atmosfer hening yang mendalam.',
  values: [
    { icon: '✦', title: 'Autentisitas Sakral', desc: 'Ritual dan tradisi luhur yang dipandu langsung oleh praktisi lokal berpengalaman' },
    { icon: '✦', title: 'Ketenangan Hening', desc: 'Atmosfer sanctuary yang damai tanpa kebisingan untuk relaksasi maksimal' },
    { icon: '✦', title: 'Kepastian & Transparansi', desc: 'Konfirmasi instan, jadwal pasti, dan kejelasan detail layanan tanpa biaya tersembunyi' },
    { icon: '✦', title: 'Transformasi Holistik', desc: 'Penyelarasan menyeluruh antara raga, rasa, dan jiwa' },
  ],
  phone: '+62 812 3456 7890',
  whatsapp: '6281234567890',
  email: 'concierge@mahawellnerjourney.com',
  address: 'Jl. Raya Ubud No. 88, Ubud, Gianyar, Bali 80571',
  contact: {
    phone: '+62 812 3456 7890',
    email: 'concierge@mahawellnerjourney.com',
    whatsapp: '6281234567890',
    address: 'Jl. Raya Ubud No. 88, Ubud, Gianyar, Bali 80571',
    maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.7!2d115.27!3d-8.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMzAnMDAuMCJTIDExNcKwMTYnMDAuMCJF!5e0!3m2!1sen!2sid!4v1600000000000!5m2!1sen!2sid',
    hours: '09:00 - 17:00 WITA',
    socials: {
      instagram: 'https://instagram.com/mahawellnerjourney',
      facebook: 'https://facebook.com/mahawellnerjourney',
      youtube: 'https://youtube.com/@mahawellnerjourney',
    },
  },
};

export const SETTINGS = {
  tax_rate: 0.11,
  booking_hold_minutes: 15,
  payment_expiry_hours: 24,
  opening_time: '09:00',
  closing_time: '17:00',
  currency: 'IDR',
  time_slot_interval: 60, // minutes
};

// Helper functions
export function getServiceById(id) {
  if (!id) return undefined;
  const clean = String(id).trim().toLowerCase().replace(/[-_]/g, '');
  return SERVICES.find(s => 
    s.service_id.toLowerCase() === id.toLowerCase() ||
    s.service_id.toLowerCase().replace(/[-_]/g, '') === clean ||
    (s.slug && s.slug.toLowerCase() === id.toLowerCase())
  );
}

export function getPackageById(id) {
  if (!id) return undefined;
  const clean = String(id).trim().toLowerCase().replace(/[-_]/g, '');
  return PACKAGES.find(p => 
    p.package_id.toLowerCase() === id.toLowerCase() ||
    p.package_id.toLowerCase().replace(/[-_]/g, '') === clean
  );
}

export function getPackagesByService(serviceId) {
  return PACKAGES.filter(p => p.service_id === serviceId && p.status === 'active');
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat(getDateLocale(), {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCategories() {
  return [...new Set(SERVICES.map(s => s.category))];
}
