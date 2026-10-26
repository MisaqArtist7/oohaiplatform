import { format, parse, parseISO, isValid } from "date-fns-jalali";
import { toEnglishDigits } from "./digits";

/**
 * ورودی‌های معتبر تاریخ میلادی یا رشته استاندارد ISO
 */
export type DateInput = string | Date | null | undefined;

/**
 * قالب‌بندی تاریخ میلادی/ISO به تقویم هجری شمسی (جلالی)
 * @param iso تاریخ به صورت شیء Date یا رشته استاندارد ISO 8601 (نظیر "2026-10-25T14:30:00+03:30" یا "2026-10-25")
 * @param withTime آیا ساعت و دقیقه نیز نمایش داده شود؟ (پیش‌فرض false)
 * @returns رشته تاریخ جلالی (مثلاً "1405/08/03" یا "1405/08/03 14:30")
 */
export function formatJalali(iso: DateInput, withTime = false): string {
  if (!iso) return "";

  let date: Date;
  let isUtcZ = false;

  if (iso instanceof Date) {
    date = iso;
  } else {
    const trimmed = iso.trim();
    if (!trimmed) return "";
    isUtcZ = /Z$/i.test(trimmed);
    date = parseISO(trimmed);
    if (!isValid(date)) {
      date = new Date(trimmed);
    }
    // تبدیل زمان‌های UTC (دارای پسوند Z) به منطقه زمانی رسمی ایران (Asia/Tehran)
    if (isUtcZ && isValid(date)) {
      const tehranStr = date.toLocaleString("en-US", { timeZone: "Asia/Tehran" });
      date = new Date(tehranStr);
    }
  }

  if (!isValid(date)) return "";

  const pattern = withTime ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd";
  return format(date, pattern);
}

/**
 * تبدیل تاریخ جلالی (شمسی) به رشته استاندارد میلادی ISO 8601
 * @param date شیء تاریخ، یا رشته جلالی نظیر "1405/08/03" یا "1405-08-03" یا "1405/08/03 14:30"
 * @returns رشته میلادی استاندارد ISO 8601
 */
export function jalaliToIso(date: DateInput): string {
  if (!date) return "";

  if (date instanceof Date) {
    return isValid(date) ? date.toISOString() : "";
  }

  const normalized = toEnglishDigits(date).trim().replace(/-/g, "/");
  if (!normalized) return "";

  // بررسی فرمت به همراه ساعت یا بدون ساعت
  let parsed = parse(normalized, "yyyy/MM/dd HH:mm", new Date());
  if (!isValid(parsed)) {
    parsed = parse(normalized, "yyyy/MM/dd", new Date());
  }

  return isValid(parsed) ? parsed.toISOString() : "";
}
