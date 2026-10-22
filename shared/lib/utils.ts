import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * قالب‌بندی اعداد به فرمت فارسی
 */
export function formatPersianNumber(value: number | string): string {
  if (value === undefined || value === null) return "";
  return Number(value).toLocaleString("fa-IR");
}

/**
 * قالب‌بندی مبلغ به تومان
 */
export function formatToman(amount: number): string {
  return `${formatPersianNumber(amount)} تومان`;
}
