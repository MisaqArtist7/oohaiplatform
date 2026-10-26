import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createBooking,
  listBookings,
  getBooking,
  submitPayment,
  getDocumentDownloadUrl,
} from "../api/bookings.api";
import { CreateBookingPayload, BookingListFilters, Booking } from "../types";
import { Page } from "@/shared/lib/pagination";

export const bookingsQueryKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingsQueryKeys.all, "list"] as const,
  list: (filters: BookingListFilters) =>
    [...bookingsQueryKeys.all, "list", filters] as const,
  details: () => [...bookingsQueryKeys.all, "detail"] as const,
  detail: (uuid: string) =>
    [...bookingsQueryKeys.all, "detail", uuid] as const,
};

/**
 * هوک واکشی لیست رزروهای کاربر
 */
export function useBookingsListQuery(filters: BookingListFilters = {}) {
  return useQuery<Page<Booking>>({
    queryKey: bookingsQueryKeys.list(filters),
    queryFn: () => listBookings(filters),
  });
}

/**
 * هوک واکشی جزئیات رزرو با UUID
 */
export function useBookingDetailQuery(uuid: string) {
  return useQuery<Booking>({
    queryKey: bookingsQueryKeys.detail(uuid),
    queryFn: () => getBooking(uuid),
    enabled: Boolean(uuid),
  });
}

/**
 * هوک ثبت رزرو جدید، اینولیدیت کردن کش لیست، و هدایت به صفحه جزئیات با UUID
 */
export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.lists(),
      });
      if (booking?.uuid) {
        router.push(`/client/bookings/${booking.uuid}`);
      }
    },
  });
}

/**
 * هوک ثبت سند پرداخت (فیش واریز یا چک صیادی)
 * پس از موفقیت، کوئری‌های جزئیات و لیست اینولیدیت می‌شوند تا وضعیت جدید با refetch بازیابی گردد.
 */
export function useSubmitPayment(bookingUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => submitPayment(bookingUuid, formData),
    onSuccess: () => {
      // شکل پاسخ سرور فرض نمی‌شود و صرفاً کش‌ها اینولیدیت می‌گردند
      queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.detail(bookingUuid),
      });
      queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.lists(),
      });
    },
  });
}

/**
 * هوک دریافت لینک دانلود امن مدارک (Signed URL با انقضای ۱۵ دقیقه)
 * به صورت mutation مستقیم اجرا می‌شود و خروجی در کش ذخیره نمی‌گردد
 */
export function useDocumentDownload(bookingUuid: string) {
  return useMutation({
    mutationFn: (documentId: number | string) =>
      getDocumentDownloadUrl(bookingUuid, documentId),
  });
}
