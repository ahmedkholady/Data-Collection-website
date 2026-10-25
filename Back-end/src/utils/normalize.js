/**
 * Normalization utilities for phone numbers and names
 */

// Mapping Eastern Arabic (Hindi) digits to Western digits
const ARABIC_INDIC_DIGITS = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

/**
 * Normalizes an Arabic or international phone number
 * - Converts Arabic-Indic numerals to standard 0-9
 * - Strips all whitespace, dashes, slashes, and symbols
 * - Handles Egyptian international prefixes (+20, 0020, 20) -> standard 01xxxxxxxxx
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return '';
  }

  // 1. Convert Arabic digits to Western digits
  let cleaned = rawPhone.replace(/[٠-٩]/g, (d) => ARABIC_INDIC_DIGITS[d] || d);

  // 2. Remove all non-numeric characters except leading '+'
  cleaned = cleaned.trim().replace(/[^\d+]/g, '');

  // 3. Handle international prefixes
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('20') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
    // Missing leading zero for Egyptian mobile (e.g. 1012345678 -> 01012345678)
    cleaned = '0' + cleaned;
  }

  // Final cleanup of any stray non-digits
  return cleaned.replace(/\D/g, '');
}

/**
 * Normalizes person/business names (with full Arabic language normalization)
 * - Removes Arabic diacritics / Tashkeel
 * - Unifies Alef variations (أ, إ, آ, ٱ -> ا)
 * - Unifies Teh Marbuta (ة -> ه)
 * - Unifies Alef Maksura (ى -> ي)
 * - Removes Tatweel / Kashida
 * - Normalizes multiple spaces and trims
 */
export function normalizeName(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return '';
  }

  return rawName
    // Remove Arabic diacritics (Harakat / Tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel (Kashida)
    .replace(/\u0640/g, '')
    // Unify Alef variations
    .replace(/[أإآٱ]/g, 'ا')
    // Unify Teh Marbuta
    .replace(/ة/g, 'ه')
    // Unify Alef Maksura
    .replace(/ى/g, 'ي')
    // Collapse multiple whitespaces and trim
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export default {
  normalizePhone,
  normalizeName,
};
