# 🚀 MASTER PROMPT: OPTIMASI PERFORMA WEB BOOKING (TARGET LIGHTHOUSE 90-99%)

## 🎯 Konteks & Tujuan Utama
Saya ingin meningkatkan skor Google Lighthouse **Performance** pada web utama booking saya (`https://booking-onlinee-maha.vercel.app/#/`) yang saat ini berada di angka **69** agar mencapai **90–99%**. 
Saat ini skor lainnya sudah sangat baik: **Accessibility (95)**, **Best Practices (100)**, dan **SEO (92)**.

Tugas Anda sebagai Senior Web Performance Engineer adalah melakukan audit menyeluruh pada codebase ini dan menerapkan optimasi performa tingkat lanjut (Core Web Vitals: LCP, TBT, FCP, CLS, dan Speed Index).

---

## ⚠️ BATASAN MUTLAK (STRICT GUARDRAILS)
1. **FOKUS WEB UTAMA BOOKING:** Proyek ini adalah **web utama untuk booking pelanggan (publik)**, BUKAN web admin. Jangan menambahkan halaman admin atau mengubah alur utama pemesanan.
2. **DILARANG MENGUBAH DATABASE:** Jangan mengubah skema tabel, kolom, atau struktur database (Supabase) yang sudah ada. Semua *payload* pengiriman data booking harus tetap 100% kompatibel dengan sistem saat ini.
3. **PERTAHANKAN UI/UX & SKOR LAINNYA:** Jangan mengubah desain visual, warna, tipografi brand **MAHAWELLNERJOURNEY**, maupun tata letak komponen. Pastikan optimasi ini tidak menurunkan skor Accessibility (95), Best Practices (100), dan SEO (92).

---

## 🛠️ LANGKAH OPTIMASI TEKNIS YANG HARUS DIKERJAKAN

Tolong periksa seluruh file di repositori ini dan terapkan optimasi berikut secara bertahap:

### 1. Optimasi Largest Contentful Paint (LCP) & Aset Gambar
- **Hero Image / Elemen Atas (*Above the Fold*):** Temukan gambar atau banner utama yang pertama kali dimuat di bagian atas halaman, lalu tambahkan atribut `fetchpriority="high"`, `loading="eager"`, dan `decoding="sync"`. Pastikan gambar utama tidak tertunda oleh animasi *fade-in* JS yang lambat saat inisialisasi awal.
- **Gambar Katalog / Paket di Bawah (*Below the Fold*):** Tambahkan `loading="lazy"` dan `decoding="async"` pada seluruh gambar kartu paket tur, galeri, dan elemen yang berada di bawah layar pertama.
- **Optimasi URL Gambar Eksternal:** Jika mengambil gambar dari URL eksternal/CDN atau Supabase Storage, pastikan parameter ukuran/kompresi (atau format WebP/AVIF) digunakan secara optimal.

### 2. Code Splitting, Lazy Loading & Pengurangan Bundle JS (TBT & FCP)
- **Dynamic Imports / React.lazy:** Ubah pemuatan komponen berat yang tidak langsung dibutuhkan saat *initial render* (seperti Modal Form Booking, Datepicker/Kalender, Detail Paket Pop-up, halaman syarat & ketentuan, atau komponen *below-the-fold*) menggunakan `React.lazy()` + `<Suspense>` (atau `next/dynamic`).
- **Optimasi Build & Chunking (`vite.config` / `next.config`):** 
  - Pisahkan *vendor chunk* (seperti `react`, `react-dom`, `@supabase/supabase-js`, dan library ikon/UI) menggunakan `manualChunks` di konfigurasi Rollup/Vite agar tidak menumpuk di satu file `index.js` raksasa.
  - Aktifkan minifikasi penuh dan hapus `console.log` serta `debugger` pada mode *production*.
- **Tree-Shaking Import:** Periksa seluruh `import` di kode. Pastikan library ikon (seperti `lucide-react` atau `react-icons`) dan utilitas hanya mengimpor modul spesifik yang dipakai, bukan keseluruhan library.

### 3. Eliminasi Render-Blocking Resources & Optimasi Font
- **Preconnect & DNS-Prefetch:** Di dalam file `index.html` (atau `<Head>`), tambahkan `<link rel="preconnect">` dan `<link rel="dns-prefetch">` menuju domain Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) serta URL API Supabase dan CDN gambar yang digunakan.
- **Font Loading:** Pastikan seluruh Google Fonts menggunakan parameter `&display=swap` agar teks langsung dirender oleh browser tanpa menunggu file font selesai diunduh (mencegah *Flash of Invisible Text*).

### 4. Pencegahan Cumulative Layout Shift (CLS = 0)
- **Dimensi Eksplisit:** Pastikan semua tag `<img>` dan kontainer kartu paket memiliki atribut `width` dan `height` atau properti CSS `aspect-ratio` yang jelas.
- **Skeleton Loader:** Saat data paket sedang dimuat dari database, gunakan *skeleton placeholder* dengan tinggi yang presisi agar halaman tidak melompat saat data selesai dirender.

### 5. Efisiensi State & Pemanggilan Data (Tanpa Mengubah Struktur DB)
- Pastikan pemanggilan data awal ke database berjalan secara paralel (*non-blocking* terhadap proses *first paint* UI kerangka utama).
- Gunakan `useMemo` dan `useCallback` pada proses *filtering* bahasa (ID/EN), kalkulasi harga booking, atau *mapping* daftar paket agar tidak memicu *re-render* berulang yang membebani *Main Thread*.

---

## 📋 FORMAT EKSEKUSI YANG SAYA INGINKAN
1. **Analisis Singkat:** Sebutkan 3–5 *bottleneck* utama yang Anda temukan di kode saya saat ini yang menyebabkan skor Performance tertahan di angka 69.
2. **Eksekusi Kode:** Lakukan perubahan langsung pada file terkait (`index.html`, `vite.config.ts`/`next.config.js`, komponen Hero, daftar paket, dan modal booking).
3. **Verifikasi Build:** Pastikan tidak ada *error* TypeScript/ESLint dan jalankan simulasi build produksi untuk memastikan ukuran *bundle* menyusut secara signifikan.