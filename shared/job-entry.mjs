export function parseJobEntry(input) {
  const value = String(input).trim().replace(/[٠-٩۰-۹]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit >= "۰" ? 0x6f0 : 0x660)));
  const idPattern = /^[1-9]\d{0,11}$/;
  if (idPattern.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.origin !== "https://jobs.cvsira.com" || url.username || url.password) return null;
    const match = url.pathname.match(/^\/(?:j|jobs)\/([1-9]\d{0,11})(?:\/[^/]+)?\/?$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
