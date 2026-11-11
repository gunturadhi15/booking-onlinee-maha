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

import assert from 'node:assert';
import { 
  t, 
  setLang, 
  getLang, 
  getDateLocale, 
  translateCategory, 
  GALLERY_TRANSLATIONS 
} from '../src/i18n.js';
import { FAQ, formatCurrency, formatCurrencyWithApprox, formatDateSafe } from '../src/data.js';

const langs = ['id', 'ru', 'es', 'it', 'fr', 'en'];
const categories = ['Melukat & Spiritual', 'Yoga & Meditation', 'Temple Tour', 'Numerology'];

console.log('--- Testing 6 Languages Localization & FAQ ---');

for (const lang of langs) {
  setLang(lang);
  console.log(`\n[Language: ${lang.toUpperCase()}]`);
  
  // Basic keys
  assert.notStrictEqual(t('nav_services'), 'nav_services');
  assert.notStrictEqual(t('book_subtotal'), 'book_subtotal');
  assert.notStrictEqual(t('pay_method_title'), 'pay_method_title');
  assert.notStrictEqual(t('con_faq_heading'), 'con_faq_heading');
  assert.notStrictEqual(t('chat_title'), 'chat_title');

  // Test FAQ translation keys
  FAQ.forEach((item, idx) => {
    const qKey = `data_faq${String(idx + 1).padStart(3, '0')}_q`;
    const aKey = `data_faq${String(idx + 1).padStart(3, '0')}_a`;
    const q = t(qKey);
    const a = t(aKey);
    assert.notStrictEqual(q, qKey, `Missing translation for ${qKey} in ${lang}`);
    assert.notStrictEqual(a, aKey, `Missing translation for ${aKey} in ${lang}`);
    if (lang !== 'id') {
      assert.notStrictEqual(q, item.question, `FAQ question in ${lang} should not be Indonesian`);
    }
  });

  // Test Categories
  categories.forEach(c => {
    const translated = translateCategory(c);
    assert.ok(translated && translated.length > 0);
  });

  // Test Gallery Translations
  Object.keys(GALLERY_TRANSLATIONS).forEach(id => {
    const item = GALLERY_TRANSLATIONS[id][lang];
    assert.ok(item && item.title && item.tag && item.quote);
  });
}

console.log('\n--- ALL LOCALIZATION & FAQ CHECKS PASSED ---');
