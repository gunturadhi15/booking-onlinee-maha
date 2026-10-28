import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeText,
  digitsOnly,
  isValidName,
  isValidEmail,
  isValidPhoneDigits,
  isValidDateString,
  isValidTimeString,
  isValidOrderId,
  isValidBookingCode,
  esc,
  INPUT_LIMITS
} from '../src/utils/security.js';

test('Security Utility Tests', async (t) => {
  await t.test('isValidName rejects invalid or malicious names', () => {
    assert.strictEqual(isValidName(''), false);
    assert.strictEqual(isValidName('A'), false);
    assert.strictEqual(isValidName('<script>alert(1)</script>'), false);
    assert.strictEqual(isValidName('Guntur Adhi'), true);
    assert.strictEqual(isValidName("O'Connor-Smith"), true);
  });

  await t.test('isValidEmail strictly validates email format', () => {
    assert.strictEqual(isValidEmail(''), false);
    assert.strictEqual(isValidEmail('plainaddress'), false);
    assert.strictEqual(isValidEmail('user@domain'), false);
    assert.strictEqual(isValidEmail('guest@example.com'), true);
    assert.strictEqual(isValidEmail('user.name+tag@gmail.com'), true);
  });

  await t.test('digitsOnly cleans non-digit characters', () => {
    assert.strictEqual(digitsOnly('+62 812-3456-7890'), '6281234567890');
    assert.strictEqual(digitsOnly('abc123xyz456'), '123456');
    assert.strictEqual(digitsOnly(''), '');
  });

  await t.test('isValidPhoneDigits enforces 7-15 digits E.164', () => {
    assert.strictEqual(isValidPhoneDigits('12345'), false);
    assert.strictEqual(isValidPhoneDigits('6281234567890'), true);
    assert.strictEqual(isValidPhoneDigits('123456789012345678'), false);
  });

  await t.test('isValidDateString strictly accepts YYYY-MM-DD', () => {
    assert.strictEqual(isValidDateString('2026-10-28'), true);
    assert.strictEqual(isValidDateString('28-10-2026'), false);
    assert.strictEqual(isValidDateString('2026/10/28'), false);
    assert.strictEqual(isValidDateString('invalid-date'), false);
  });

  await t.test('isValidTimeString strictly accepts HH:MM', () => {
    assert.strictEqual(isValidTimeString('09:00'), true);
    assert.strictEqual(isValidTimeString('15:30'), true);
    assert.strictEqual(isValidTimeString('25:00'), false);
    assert.strictEqual(isValidTimeString('09:65'), false);
    assert.strictEqual(isValidTimeString('9:00'), false);
  });

  await t.test('esc escapes dangerous HTML special characters', () => {
    assert.strictEqual(
      esc('<script>alert("xss")</script>'),
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    assert.strictEqual(
      esc("Tom & Jerry's"),
      'Tom &amp; Jerry&#39;s'
    );
  });

  await t.test('isValidOrderId and isValidBookingCode match expected formats', () => {
    assert.strictEqual(isValidOrderId('TRX-20261028-ABC123DEF456'), true);
    assert.strictEqual(isValidOrderId('INV-20261028-1234'), true);
    assert.strictEqual(isValidOrderId('INVALID ORDER ID!'), false);

    assert.strictEqual(isValidBookingCode('MWJ-SACRED-20261028-ABC1'), true);
    assert.strictEqual(isValidBookingCode('INVALID-CODE-1234'), false);
    assert.strictEqual(isValidBookingCode('MWJ'), false);
  });
});
