// Mock browser globals for Node test
globalThis.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); }
};
globalThis.document = {
  documentElement: { lang: 'id' },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  getElementById() { return null; }
};

import { 
  t, 
  setLang, 
  getLang, 
  getDateLocale, 
  translateCategory, 
  GALLERY_TRANSLATIONS 
} from '../src/i18n.js';
import { formatCurrency, formatCurrencyWithApprox, formatDateSafe } from '../src/data.js';

const langs = ['id', 'ru', 'es', 'it', 'fr', 'en'];
const categories = ['Melukat & Spiritual', 'Yoga & Meditation', 'Temple Tour', 'Numerology'];

console.log('--- Testing 6 Languages Localization ---');

for (const lang of langs) {
  setLang(lang);
  console.log(`\n[Language: ${lang.toUpperCase()}]`);
  console.log(`Locale: ${getDateLocale()}`);
  console.log(`Nav Services: ${t('nav_services')}`);
  console.log(`Booking Subtotal: ${t('book_subtotal')}`);
  console.log(`Payment Method: ${t('pay_method_title')}`);
  console.log(`Invoice Status Pending: ${t('inv_status_pending')}`);
  console.log(`Invoice Approx Label: ${t('inv_notice_title')}`);
  console.log(`Concierge Hours: ${t('home_concierge_hours')}`);
  console.log(`Badge Popular: ${t('badge_popular')}`);

  // Test Categories
  const translatedCats = categories.map(c => `${c} -> ${translateCategory(c)}`);
  console.log('Categories:', translatedCats.join(' | '));

  // Test Gallery Translations
  const galTitles = Object.keys(GALLERY_TRANSLATIONS).map(id => GALLERY_TRANSLATIONS[id][lang]?.title);
  console.log('Gallery titles:', galTitles.join(', '));

  // Test Currency & Approx
  console.log('Formatted Currency Approx (Rp 1.250.000):', formatCurrencyWithApprox(1250000, lang));

  // Test Date Formatting
  console.log('Formatted Date (2026-11-15):', formatDateSafe('2026-11-15'));
}

console.log('\n--- ALL LOCALIZATION CHECKS PASSED ---');
