import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '..', 'public', 'images');

const targets = [
  'sanctuary-ambiance',
  'spiritual-temple-tour',
  'yoga-meditation-retreat',
  'numerology-consultation'
];

async function optimize() {
  console.log('🚀 Memulai kompresi & resize 4 gambar WebP presisi...\n');

  for (const name of targets) {
    const jpgSource = path.join(imagesDir, `${name}.jpg`);
    const webpSource = path.join(imagesDir, `${name}.webp`);
    const sourceFile = fs.existsSync(jpgSource) ? jpgSource : webpSource;

    const outSm = path.join(imagesDir, `${name}-sm.webp`);
    const outMain = path.join(imagesDir, `${name}.webp`);

    // 1. Generate -sm.webp: 400x225, targeting < 14 KiB (near ~10-12 KiB)
    let qSm = 58;
    let smBuffer = await sharp(sourceFile)
      .resize(400, 225, { fit: 'cover', position: 'center' })
      .webp({ quality: qSm, effort: 6, smartSubsample: true })
      .toBuffer();

    while (smBuffer.length > 13 * 1024 && qSm > 28) {
      qSm -= 3;
      smBuffer = await sharp(sourceFile)
        .resize(400, 225, { fit: 'cover', position: 'center' })
        .webp({ quality: qSm, effort: 6, smartSubsample: true })
        .toBuffer();
    }
    fs.writeFileSync(outSm, smBuffer);

    // 2. Generate main .webp: 600x337, targeting < 25 KiB (near ~20-22 KiB)
    let qMain = 62;
    let mainBuffer = await sharp(sourceFile)
      .resize(600, 337, { fit: 'cover', position: 'center' })
      .webp({ quality: qMain, effort: 6, smartSubsample: true })
      .toBuffer();

    while (mainBuffer.length > 24 * 1024 && qMain > 32) {
      qMain -= 3;
      mainBuffer = await sharp(sourceFile)
        .resize(600, 337, { fit: 'cover', position: 'center' })
        .webp({ quality: qMain, effort: 6, smartSubsample: true })
        .toBuffer();
    }
    fs.writeFileSync(outMain, mainBuffer);

    console.log(`✓ ${name}:`);
    console.log(`    -sm.webp: 400x225, ${(smBuffer.length / 1024).toFixed(1)} KiB (q=${qSm})`);
    console.log(`    .webp:    600x337, ${(mainBuffer.length / 1024).toFixed(1)} KiB (q=${qMain})`);
  }

  console.log('\n✨ Semua gambar berhasil dioptimasi sesuai target EksekusiPresisi.md!');
}

optimize().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});

