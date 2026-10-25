/**
 * تبدیل ارقام انگلیسی به فارسی
 * @param input عدد یا رشته حاوی ارقام انگلیسی
 * @returns رشته با ارقام فارسی
 */
export function toPersianDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return "";
  const str = input.toString();
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * تبدیل ارقام فارسی و عربی به ارقام انگلیسی
 * @param input رشته حاوی ارقام فارسی یا عربی
 * @returns رشته با ارقام استاندارد انگلیسی
 */
export function toEnglishDigits(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .trim();
}
