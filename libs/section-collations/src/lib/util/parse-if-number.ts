export function parseIfNumber(str: string): number | null {
  const pattern = /^\d+$/;
  if (pattern.test(str)) {
    return parseInt(str, 10);
  }
  return null;
}

export function parseIfIndoArabicNumber(str: string): number | null {
  const pattern = /^[\u0660-\u0669]+$/;
  if (pattern.test(str)) {
    const convertedStr = Array.from(str)
      .map((ch) => String.fromCharCode(ch.charCodeAt(0) - 0x0660))
      .join('');
    return parseInt(convertedStr, 10);
  }
  return null;
}
