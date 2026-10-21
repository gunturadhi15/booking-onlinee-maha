# 🎯 PROMPT TAHAP 3: PERBAIKAN PRESISI DIAGNOSTIK LIGHTHOUSE (MENUJU SKOR 95+)

Berdasarkan rincian diagnostik PageSpeed Insights terbaru, tinggal 4 bottleneck spesifik yang menahan waktu FCP dan LCP. Tolong lakukan perbaikan eksak berikut tanpa mengubah database atau merusak tampilan UI:

## 1. Putus Rantai "Hierarki Dependensi Jaringan" (Hapus Lazy Load pada Home & Data Utama)
Saat ini terjadi rantai request beruntun (waterfall):
`index.html` -> `index.js` (5 KiB) -> `home.js` (6.9 KiB) + `data.js` (6.9 KiB) yang memakan latensi 1.114 ms.
- **Tindakan Wajib:** Ubah import komponen halaman utama (`Home`) dan file data utama (`data`) dari `React.lazy()` / dynamic `import()` kembali menjadi **static import biasa** di dalam `App` / `main`. Ukuran keduanya sangat kecil (<14 KiB), sehingga menggabungkannya langsung ke bundle utama akan memangkas 1 putaran request jaringan penuh (hemat ~500 ms).
- Gunakan `React.lazy()` HANYA untuk komponen yang muncul saat diklik pengguna (seperti Modal Booking, Pop-up Detail, atau halaman rute sekunder selain halaman utama).

## 2. Hilangkan "Permintaan Pemblokiran Render" dari CSS (16.59 KiB)
File `/assets/index-*.css` hanya berukuran ~16 KiB namun memblokir render awal selama 804 ms.
- **Tindakan Wajib:** Buat plugin kecil di `vite.config.ts` (atau script post-build pada `dist/index.html`) yang menyisipkan (*inline*) isi file CSS utama ke dalam tag `<style>` di `<head>` `index.html` saat proses `npm run build`, ATAU ubah tag `<link rel="stylesheet" href="/assets/index-*.css">` agar menggunakan `preload` + non-blocking load sementara *critical CSS* untuk bagian Header dan Hero diletakkan secara inline di `index.html`.

## 3. Pangkas Ukuran 4 Gambar WebP (Hemat 165 KiB)
Lighthouse melaporkan 4 gambar ini masih dimuat dengan dimensi `716x402` padahal dimensi tampilnya hanya `381x213`:
1. `/images/sanctuary-ambiance.webp` (64 KiB)
2. `/images/spiritual-temple-tour.webp` (61.1 KiB)
3. `/images/yoga-meditation-retreat.webp` (48.5 KiB)
4. `/images/numerology-consultation.webp` (43 KiB)

**Kenapa masih terunduh ukuran 716x402?** Karena penggunaan `sizes="(max-width: 768px) 100vw, ..."` pada layar mobile dengan DPR 1.75x–2x meminta gambar berukuran ~720w, sehingga browser mengabaikan `480w` (`-sm.webp`) dan memilih file `716w`.
- **Tindakan Wajib A (Kompresi & Resize File Fisik):** Gunakan script Node.js (`sharp`) di terminal untuk mengompres ulang dan mengubah dimensi keempat file utama `.webp` dan `-sm.webp` di folder `public/images/`:
  - File `-sm.webp`: ubah ke dimensi **400x225** dengan WebP `quality: 68` (target ukuran < 12 KiB per file).
  - File utama `.webp`: ubah ke dimensi **600x337** dengan WebP `quality: 70` (target ukuran < 22 KiB per file).
- **Tindakan Wajib B (Perbaiki Atribut `sizes` & `srcset`):**
  - Ubah atribut `sizes` pada keempat gambar tersebut menjadi: `sizes="(max-width: 640px) 220px, (max-width: 1024px) 380px, 400px"` agar pada simulasi mobile Moto G Power browser dipaksa mengambil file `-sm.webp` yang berukuran ~10 KiB.
  - Pada `<link rel="preload" as="image">` di `index.html` untuk `sanctuary-ambiance`, pastikan menggunakan `imagesrcset` dan `imagesizes` yang sama persis (atau langsung preload `/images/sanctuary-ambiance-sm.webp` untuk mobile).

## 4. Hapus "Ubah Posisi/Geometri yang Dipaksa" (Forced Reflow 50 ms + 43 ms)
Lighthouse mendeteksi forced reflow di `[tanpa atribut]` (script inline di `index.html`) dan di `index.js`.
- **Tindakan Wajib:** 
  - Periksa semua `<script>` di dalam `index.html` dan kode inisialisasi di `main.tsx`/`App.tsx`.
  - Hapus semua kode yang memanggil `offsetWidth`, `offsetHeight`, `clientHeight`, `getBoundingClientRect()`, `window.scrollTo()`, atau manipulasi style/class DOM secara sinkron saat halaman baru dimuat.
  - Jangan gunakan `onerror="this.onerror=null;if(this.hasAttribute('srcset'))this.removeAttribute('srcset')"` pada tag `<img>` jika file `-sm.webp` sudah dipastikan ada di folder `public/images/`, karena manipulasi atribut DOM saat gambar gagal/sedang dimuat dapat memicu recalculation layout.

---

## ✅ Verifikasi Akhir Sebelum Selesai
1. Jalankan script resize gambar dan pastikan ukuran file di `public/images/*.webp` sudah turun ke kisaran 10–20 KiB.
2. Jalankan `npm run build` dan pastikan `home.js` serta `data.js` sudah menyatu ke dalam bundle utama (tidak lagi terpisah menjadi rantai request di `dist/assets/`).