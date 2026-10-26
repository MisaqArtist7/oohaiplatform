import { BookingStatusValue } from "./types";

export interface StatusFilterOption {
  value: BookingStatusValue | "all";
  label: string;
}

export const BOOKING_STATUS_FILTERS: StatusFilterOption[] = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "pending_review", label: "در انتظار بررسی" },
  { value: "locked_for_contract", label: "قفل برای قرارداد" },
  { value: "proforma_issued", label: "پیش‌فاکتور صادر شد" },
  { value: "payment_submitted", label: "پرداخت ثبت شد" },
  { value: "occupied", label: "در حال اکران" },
  { value: "completed", label: "پایان‌یافته" },
  { value: "rejected", label: "رد شده" },
  { value: "expired", label: "منقضی شده" },
];

/**
 * مراحل اصلی گردش کار رزرو در Stepper
 */
export const BOOKING_STEPPER_STEPS: Array<{
  value: BookingStatusValue;
  label: string;
}> = [
  { value: "pending_review", label: "بررسی اولیه" },
  { value: "locked_for_contract", label: "قفل برای قرارداد" },
  { value: "proforma_issued", label: "صدور پیش‌فاکتور" },
  { value: "payment_submitted", label: "ثبت پرداخت" },
  { value: "occupied", label: "در حال اکران" },
  { value: "completed", label: "پایان‌یافته" },
];
