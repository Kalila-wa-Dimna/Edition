export const intRegEx = new RegExp('^[0-9]+$');
export const latinLettersRegex = new RegExp('^[a-zA-Z\\s]+$');
/** Broad Arabic block + whitespace (routing still uses hasArabicLetters for mixed text). */
export const arabicLettersRegex = new RegExp(
  '^[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF\\s]+$'
);
