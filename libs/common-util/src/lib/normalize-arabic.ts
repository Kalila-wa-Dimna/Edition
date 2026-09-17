/**
 * Normalize Arabic text for search routing / matching:
 * NFKC, strip controls & tatweel, remove harakat, fold alef variants.
 */
export function normalizeArabic(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '') // bidi / zero-width
    .replace(/\u0640/g, '') // tatweel
    .replace(/\u0670/g, '') // dagger alef
    .replace(/[\u064B-\u065F\u0670]/g, '') // harakat / Quranic marks in range
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/\u0671/g, 'ا') // alef wasla (if still present)
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True if the string contains Arabic letters (after light cleanup). */
export function hasArabicLetters(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    text
  );
}

/** True if the string is primarily Latin letters; allows German umlauts and ß. */
export function isLatinTitleQuery(text: string): boolean {
  const t = text.trim();
  if (!t) {
    return false;
  }
  if (hasArabicLetters(t)) {
    return false;
  }
  return /[\p{Script=Latin}]/u.test(t);
}

/** Split a query into non-empty tokens on any whitespace. */
export function tokenizeSearchQuery(text: string): string[] {
  return normalizeArabic(text)
    .split(/\s+/)
    .map((w) =>
      w.replace(
        /^[^\u0600-\u06FFa-zA-Z0-9\u0750-\u077F]+|[^\u0600-\u06FFa-zA-Z0-9\u0750-\u077F]+$/g,
        ''
      )
    )
    .filter(Boolean);
}
