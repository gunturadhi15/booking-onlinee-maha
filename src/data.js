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
    image: '/images/spiritual-temple-tour.jpg',
    slug: 'spiritual-temple-tour',
  },
  {
    service_id: 'SRV002',
    service_name: 'Yoga & Meditation Retreat',
    description: 'Retreat yoga dan meditasi intensif di tengah alam Ubud. Temukan kedamaian batin melalui praktik yoga harian, meditasi mindfulness, dan terapi penyembuhan tradisional Bali.',
    category: 'Retreat',
    status: 'active',
    image: '/images/yoga-meditation-retreat.jpg',
    slug: 'yoga-meditation-retreat',
  },
  {
    service_id: 'SRV003',
    service_name: 'Numerology Consultation',
    description: 'Konsultasi numerologi personal untuk memahami potensi diri, jodoh, karier, dan keberuntungan berdasarkan angka kelahiran. Dipandu oleh praktisi numerologi berpengalaman.',
    category: 'Numerology',
    status: 'active',
    image: '/images/numerology-consultation.jpg',
    slug: 'numerology-consultation',
  },
  {
    service_id: 'SRV004',
    service_name: 'Healing & Purification',
    description: 'Sesi penyembuhan holistik yang menggabungkan melukat (upacara pembersihan air suci), terapi energi, dan ritual pembersihan aura tradisional Bali untuk memulihkan keseimbangan jiwa.',
    category: 'Healing',
    status: 'active',
    image: '/images/healing-purification.jpg',
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
    { icon: '•', title: 'Autentisitas Sakral', desc: 'Ritual dan tradisi luhur yang dipandu langsung oleh praktisi lokal berpengalaman' },
    { icon: '•', title: 'Ketenangan Hening', desc: 'Atmosfer sanctuary yang damai tanpa kebisingan untuk relaksasi maksimal' },
    { icon: '•', title: 'Kepastian & Transparansi', desc: 'Konfirmasi instan, jadwal pasti, dan kejelasan detail layanan tanpa biaya tersembunyi' },
    { icon: '•', title: 'Transformasi Holistik', desc: 'Penyelarasan menyeluruh antara raga, rasa, dan jiwa' },
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
  tax_rate: 0, // Pajak dihapus dari invoice & checkout sesuai arahan resmi (harga bersih transparan)
  booking_hold_minutes: 15,
  payment_expiry_hours: 24,
  opening_time: '09:00',
  closing_time: '17:00',
  currency: 'IDR',
  time_slot_interval: 60, // minutes
};

/**
 * Media Koleksi Visual & Video Sanctuary Mahawellnerjourney
 * Memberikan bukti visual konkret & suasana hening multi-sensori
 */
export const SANCTUARY_MEDIA = {
  hero_ambient: {
    title: 'The Sacred Ubud Sanctuary',
    poster: '/images/sanctuary-ambiance.jpg',
    video_mp4: 'https://assets.mixkit.co/videos/preview/mixkit-sun-rays-in-the-forest-41584-large.mp4',
    badge: 'Sanctuary in Motion'
  },
  gallery: [
    {
      id: 'melukat',
      slug: 'healing-purification',
      title: 'Sacred Water Melukat Blessing',
      category: 'Healing & Purification',
      image: '/images/healing-purification.jpg',
      badge: 'Upacara Melukat',
      quote: 'Penyucian diri melalui tirta suci alami untuk meluruhkan beban energi dan merestorasi ketenangan batin.',
      tag: 'Sacred Springs'
    },
    {
      id: 'yoga',
      slug: 'yoga-meditation-retreat',
      title: 'Tibetan Sound Bath & Forest Meditation',
      category: 'Retreat',
      image: '/images/yoga-meditation-retreat.jpg',
      badge: 'Sound Healing & Yoga',
      quote: 'Resonansi mangkuk Tibet dan pernapasan berkesadaran di pavilion kayu jati yang hening di tengah rimba Ubud.',
      tag: 'Forest Pavilion'
    },
    {
      id: 'temple',
      slug: 'spiritual-temple-tour',
      title: 'Ancient Temple & Spiritual Pilgrimage',
      category: 'Tour',
      image: '/images/spiritual-temple-tour.jpg',
      badge: 'Ziarah Pura Sakral',
      quote: 'Menelusuri gapura candi berukir kuno dan mendalami filosofi Tri Hita Karana dengan bimbingan pemangku senior.',
      tag: 'Sacred Temples'
    },
    {
      id: 'numerology',
      slug: 'numerology-consultation',
      title: 'Sacred Lontar & Numerology Reading',
      category: 'Numerology',
      image: '/images/numerology-consultation.jpg',
      badge: 'Peta Kehidupan',
      quote: 'Menyingkap cetak biru jiwa, potensi diri, dan siklus karma melalui hitungan lontar sakral Bali.',
      tag: 'Personal Blueprint'
    }
  ]
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

/**
 * Generate Kode Pemesanan Standar Mahawellnerjourney
 * Format Wajib: MWJ-nama produk-serial nomber
 * Contoh: MWJ-SACRED-DISCOVERY-20261020-0042
 */
export function generateBookingCode(productName, customSerial = null) {
  const cleanProduct = (productName || 'JOURNEY')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = customSerial || String(Math.floor(1000 + Math.random() * 9000));
  return `MWJ-${cleanProduct}-${dateStr}-${rand}`;
}

/**
 * Safe local date parser to avoid timezone UTC off-by-one day bugs
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  return new Date(dateStr);
}

export function formatDateSafe(dateStr, locale) {
  const date = parseLocalDate(dateStr);
  if (!date || isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale || getDateLocale(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Top Countries & Source Markets for Bali Sanctuary Travelers
 * Includes dial codes, ISO codes, and flags for international guest picker
 */
export const COUNTRIES_LIST = [
  { code: 'AU', dial: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'ID', dial: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'GB', dial: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', dial: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'FR', dial: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'RU', dial: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'ES', dial: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', dial: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'DE', dial: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'SG', dial: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'NL', dial: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CA', dial: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'CH', dial: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'IN', dial: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'MY', dial: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'JP', dial: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', dial: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'NZ', dial: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'CN', dial: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'BR', dial: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'XX', dial: '+', name: 'Other Countries / International', flag: '🌐' }
];

/**
 * E.164 Standard Helper: Sanitizes international WhatsApp phone numbers.
 * Removes leading 0 after country code, strips dashes, spaces, and non-numeric chars.
 * e.g., (+62, "0812-3456-7890") -> "6281234567890"
 * e.g., (+61, "0412 345 678") -> "61412345678"
 */
export function sanitizeInternationalPhone(countryCode, rawPhone) {
  if (!rawPhone) return '';
  let cleanDigits = String(rawPhone).replace(/\D/g, '');
  const cleanCode = String(countryCode || '+62').replace(/\D/g, '');

  if (cleanDigits.startsWith(cleanCode)) {
    return cleanDigits;
  }

  // Remove leading 0 if present (e.g., 0812... -> 812...)
  if (cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.replace(/^0+/, '');
  }

  return `${cleanCode}${cleanDigits}`;
}

/**
 * Bali Local Timezone Locked (WITA / UTC+8 / Asia/Makassar)
 */
export function getBaliNow() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (8 * 3600000));
}

export function getBaliDateString(dateObj = getBaliNow()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Fixed Time Slots - Comprehensive Daily Schedule (08:00 - 18:00 WITA)
 */
export const FIXED_TIME_SLOTS = [
  { time: '08:00', labelKey: 'book_slot_08', period: 'Early Morning' },
  { time: '09:00', labelKey: 'book_slot_09', period: 'Morning Session' },
  { time: '10:00', labelKey: 'book_slot_10', period: 'Mid-Morning' },
  { time: '11:00', labelKey: 'book_slot_11', period: 'Late Morning' },
  { time: '12:00', labelKey: 'book_slot_12', period: 'Midday / Noon' },
  { time: '13:00', labelKey: 'book_slot_13', period: 'Early Afternoon' },
  { time: '14:00', labelKey: 'book_slot_14', period: 'Afternoon Session' },
  { time: '15:00', labelKey: 'book_slot_15', period: 'Mid-Afternoon' },
  { time: '16:00', labelKey: 'book_slot_16', period: 'Late Afternoon' },
  { time: '17:00', labelKey: 'book_slot_17', period: 'Sunset Session' },
  { time: '18:00', labelKey: 'book_slot_18', period: 'Twilight Session' }
];

/**
 * Converts HH:mm time string to total minutes from midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + (m || 0);
}

/**
 * Storage helpers for confirmed bookings to ensure collision locking
 */
export const LOCAL_BOOKINGS_KEY = 'mwj_confirmed_bookings';

export function getStoredBookings() {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
    if (!raw) {
      // Seed an initial booking so the user immediately sees conflict locking in action!
      const baliToday = getBaliNow();
      const tomorrow = new Date(baliToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = getBaliDateString(tomorrow);
      
      const seed = [
        {
          tour_date: tomorrowStr,
          booking_time: '09:00',
          customer_name: 'Guest (Reserved)',
          status: 'confirmed'
        }
      ];
      localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

export function saveConfirmedBooking(booking) {
  try {
    const existing = getStoredBookings();
    const date = booking.tour_date || booking.booking_date;
    const time = booking.booking_time;
    if (!date || !time) return;

    // Avoid duplicate entry
    const alreadyExists = existing.some(b => 
      (b.tour_date === date || b.booking_date === date) && 
      (b.booking_time === time || b.time === time)
    );

    if (!alreadyExists) {
      existing.push({
        tour_date: date,
        booking_time: time,
        booking_id: booking.booking_id || booking.id,
        customer_name: booking.customer_name || 'Guest',
        status: 'confirmed',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(existing));
    }
  } catch (_) {}
}

export function getBookedTimesForDate(dateStr) {
  if (!dateStr) return [];
  const bookings = getStoredBookings();
  const times = new Set();
  bookings.filter(b => (b.tour_date === dateStr || b.booking_date === dateStr) && b.status !== 'cancelled')
          .forEach(b => {
            if (b.booking_time) times.add(b.booking_time);
            if (b.time) times.add(b.time);
          });
  return Array.from(times);
}

/**
 * Evaluates whether a slot collides with any booked slot on the same date.
 * Per user instruction:
 * "semisal di hari yang sama ada yang booking di jam itu, otomatis di 2 jam yang sama langsung tidak bisa di pesan,
 * semisal di jam 9 di booking, jam 9-11/12 sudah tidak bisa di booking"
 *
 * Buffer window: 120 minutes (2 hours).
 * For a booked session at Tb (e.g. 09:00 / 540 min):
 * - Slot at Tb: 'booked' (Sudah Dipesan)
 * - Slots where Tb < Ts <= Tb + 120 (e.g. 10:00, 11:00): 'in_session' (Dalam Sesi / 2 Jam Buffer)
 * - Slots where Tb - 119 <= Ts < Tb (e.g. 08:00): 'overlap' (Bentrok dengan Sesi Berikutnya)
 */
export function checkSlotCollision(slotTime, bookedTimes = []) {
  if (!bookedTimes || bookedTimes.length === 0) {
    return { isBlocked: false, reason: 'available', bookedTime: null };
  }

  const slotMin = timeToMinutes(slotTime);

  for (const bookedTime of bookedTimes) {
    const bookedMin = timeToMinutes(bookedTime);
    
    // 1. Exact match: this slot is already booked
    if (slotMin === bookedMin) {
      return { isBlocked: true, reason: 'booked', bookedTime };
    }

    // 2. In session / 2-hour window after booked start (e.g. 09:00 booked -> 10:00 & 11:00 blocked)
    if (slotMin > bookedMin && slotMin <= bookedMin + 120) {
      return { isBlocked: true, reason: 'in_session', bookedTime };
    }

    // 3. Overlap before: a 2-hour session starting now would collide with booked session (e.g. 08:00 would collide with 09:00)
    if (slotMin < bookedMin && slotMin >= bookedMin - 119) {
      return { isBlocked: true, reason: 'overlap', bookedTime };
    }
  }

  return { isBlocked: false, reason: 'available', bookedTime: null };
}

/**
 * Minimum Lead Time Check: Must be booked at least 12 hours ahead in Bali Local Time (WITA).
 */
export function isSlotLeadTimeValid(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const parts = dateStr.split('-').map(Number);
  const timeParts = timeStr.split(':').map(Number);
  if (parts.length !== 3 || timeParts.length < 2) return false;

  // Build target UTC timestamp for session in WITA (UTC+8)
  const targetUtcMs = Date.UTC(parts[0], parts[1] - 1, parts[2], timeParts[0] - 8, timeParts[1], 0);
  const nowUtcMs = Date.now();

  const diffHours = (targetUtcMs - nowUtcMs) / 3600000;
  return diffHours >= 12; // Strictly 12 hours minimum lead time
}

/**
 * Max participants (Pax) constraint based on service category
 */
export function getMaxPaxForService(serviceOrCategory) {
  const cat = (typeof serviceOrCategory === 'string' ? serviceOrCategory : serviceOrCategory?.category || '').toLowerCase();
  if (cat.includes('numerology') || cat.includes('reading')) return 8;
  if (cat.includes('spa') || cat.includes('retreat') || cat.includes('healing')) return 6;
  if (cat.includes('tour') || cat.includes('melukat')) return 12;
  return 8;
}

/**
 * Foreign Currency Reference Estimation for Psychological Reassurance
 * Transparansi Harga: IDR Utama + Estimasi Mata Uang Asing
 */
export function formatCurrencyWithApprox(amount, currentLang = 'en') {
  const idrFormatted = formatCurrency(amount);
  const usdApprox = Math.round(amount / 15800);
  const eurApprox = Math.round(amount / 16800);

  switch (currentLang) {
    case 'ru':
      return `${idrFormatted} <span class="price-currency-approx">(Около ~$${usdApprox} USD / €${eurApprox} EUR)</span>`;
    case 'es':
      return `${idrFormatted} <span class="price-currency-approx">(Aprox. ~€${eurApprox} EUR / $${usdApprox} USD)</span>`;
    case 'it':
      return `${idrFormatted} <span class="price-currency-approx">(Circa ~€${eurApprox} EUR / $${usdApprox} USD)</span>`;
    case 'fr':
      return `${idrFormatted} <span class="price-currency-approx">(Env. ~€${eurApprox} EUR / $${usdApprox} USD)</span>`;
    case 'id':
      return `${idrFormatted} <span class="price-currency-approx">(Harga Bersih All-Inclusive)</span>`;
    case 'en':
    default:
      return `${idrFormatted} <span class="price-currency-approx">(Approx. ~$${usdApprox} USD)</span>`;
  }
}

