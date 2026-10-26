/**
 * ورودی‌های معتبر برای عملیات پولی و ارزی
 * مبالغ ممکن است به صورت عددی یا رشته‌های دریافتی از API (نظیر "150000000.00") باشند.
 */
export type MoneyInput = number | string | null | undefined;

/**
 * تبدیل ایمن ورودی به عدد خام
 * @param value ورودی عددی یا رشته‌ای
 * @returns مقدار عددی تمیزشده
 */
export function parseMoney(value: MoneyInput): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const clean = value.toString().trim().replace(/,/g, "");
  if (!clean) return 0;
  const num = Number(clean);
  return Number.isFinite(num) ? num : 0;
}

/**
 * تبدیل ریال به تومان (تقسیم بر ۱۰)
 * مبالغ دیتابیس و API بک‌اند همگی بر حسب ریال هستند.
 * @param rial مبلغ به ریال (عددی یا رشته)
 * @returns مبلغ معادل به تومان (گرد شده به پایین)
 */
export function rialToToman(rial: MoneyInput): number {
  const parsed = parseMoney(rial);
  return Math.floor(parsed / 10);
}

/**
 * تبدیل تومان به ریال (ضربدر ۱۰)
 * برای ارسال داده‌های ورودی کاربر در UI به بک‌اند
 * @param toman مبلغ به تومان (عددی یا رشته)
 * @returns مبلغ معادل به ریال
 */
export function tomanToRial(toman: MoneyInput): number {
  const parsed = parseMoney(toman);
  return Math.round(parsed * 10);
}

/**
 * فرمت مبلغ ریالی به تومان همراه با جداکننده ارقام فارسی و پسوند «تومان»
 * مثال: "150000000.00" -> "۱۵٬۰۰۰٬۰۰۰ تومان"
 * @param rialAmount مبلغ به ریال (ورودی از API یا مدل‌ها)
 * @returns رشته فرمت‌شده به فارسی
 */
export function formatToman(rialAmount: MoneyInput): string {
  const toman = rialToToman(rialAmount);
  return `${new Intl.NumberFormat("fa-IR").format(toman)} تومان`;
}

/**
 * فرمت مستقیم مبلغی که از قبل به تومان است همراه با پسوند «تومان»
 * @param tomanAmount مبلغ به تومان
 * @returns رشته فرمت‌شده به فارسی
 */
export function formatTomanDirect(tomanAmount: MoneyInput): string {
  const toman = Math.floor(parseMoney(tomanAmount));
  return `${new Intl.NumberFormat("fa-IR").format(toman)} تومان`;
}

/**
 * قالب‌بندی خلاصه قیمت برای پین‌های نقشه و برچسب‌های سریع
 * @param rialAmount مبلغ به ریال (یا تومان مستقیم در صورت ارسال)
 */
export function formatShortToman(rialAmount: MoneyInput): string {
  const toman = rialToToman(rialAmount);
  if (toman >= 1_000_000_000) {
    const b = (toman / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
    return `${new Intl.NumberFormat("fa-IR").format(Number(b))} میلیارد`;
  }
  if (toman >= 1_000_000) {
    const m = (toman / 1_000_000).toFixed(0);
    return `${new Intl.NumberFormat("fa-IR").format(Number(m))} م`;
  }
  return formatToman(rialAmount);
}

