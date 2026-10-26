/**
 * این فایل صرفاً برای نگه‌داری موقت داده‌های رزرو (Bookings) در حافظه تا انجام تسک مربوطه نگه‌داشته شده است.
 * تمامی داده‌ها، انواع و توابع مربوط به سازه‌ها و شهرها طبق تسک حذف گردیدند.
 */

// شبیه‌ساز ذخیره رزروها در حافظه (موقتی تا تسک رزروها)
export const mockBookingsStore: Array<{
  id: string;
  trackingCode: string;
  structureId: string;
  startDate: string;
  endDate: string;
  fullName: string;
  phone: string;
  brandName: string;
  notes?: string;
  totalPrice: number;
  status: "pending_review" | "confirmed";
  createdAt: string;
}> = [];
