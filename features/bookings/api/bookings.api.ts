import { http, QueryParams } from "@/shared/lib/http";
import {
  Page,
  fromResource,
  LaravelResourceResponse,
} from "@/shared/lib/pagination";
import {
  Booking,
  CreateBookingPayload,
  BookingListFilters,
  DocumentDownloadResponse,
} from "../types";

/**
 * ثبت درخواست رزرو سازه (POST /api/v1/client/bookings)
 * پشتیبانی از هر دو فرمت احتمالی پاسخ ۲۰۱ سرور ({ data: Booking } یا خود Booking)
 */
export async function createBooking(
  payload: CreateBookingPayload
): Promise<Booking> {
  const response = await http.post<{ data?: Booking } & Partial<Booking>>(
    "/client/bookings",
    payload as unknown as Record<string, unknown>
  );

  if (
    response &&
    typeof response === "object" &&
    response.data &&
    typeof response.data === "object" &&
    "uuid" in response.data
  ) {
    return response.data as Booking;
  }

  return response as Booking;
}

/**
 * دریافت لیست رزروهای مشتری جاری با فیلتر وضعیت و صفحه‌بندی (GET /api/v1/client/bookings)
 */
export async function listBookings(
  filters: BookingListFilters = {}
): Promise<Page<Booking>> {
  const query: QueryParams = {
    page: filters.page ?? 1,
    per_page: filters.per_page ?? 15,
  };

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  const response = await http.get<LaravelResourceResponse<Booking>>(
    "/client/bookings",
    { query }
  );

  return fromResource(response);
}

/**
 * دریافت اطلاعات کامل یک رزرو با UUID (GET /api/v1/client/bookings/{uuid})
 */
export async function getBooking(uuid: string): Promise<Booking> {
  const response = await http.get<{ data?: Booking } & Partial<Booking>>(
    `/client/bookings/${encodeURIComponent(uuid)}`
  );

  if (
    response &&
    typeof response === "object" &&
    response.data &&
    typeof response.data === "object" &&
    "uuid" in response.data
  ) {
    return response.data as Booking;
  }

  return response as Booking;
}

/**
 * ثبت فیش واریز یا چک صیادی (POST /api/v1/client/bookings/{bookingUuid}/payment)
 * ارسال با فرمت multipart/form-data بدون تنظیم دستی Content-Type (هندل خودکار توسط http.ts)
 */
export async function submitPayment(
  bookingUuid: string,
  formData: FormData
): Promise<unknown> {
  return http.post<unknown>(
    `/client/bookings/${encodeURIComponent(bookingUuid)}/payment`,
    formData
  );
}

/**
 * دریافت لینک دانلود امن مدارک و پیش‌فاکتور (GET /api/v1/client/bookings/{bookingUuid}/documents/{documentId}/download)
 * خروجی بدون envelope و دارای download_url با امضای موقت ۱۵ دقیقه‌ای است
 */
export async function getDocumentDownloadUrl(
  bookingUuid: string,
  documentId: number | string
): Promise<DocumentDownloadResponse> {
  return http.get<DocumentDownloadResponse>(
    `/client/bookings/${encodeURIComponent(bookingUuid)}/documents/${encodeURIComponent(String(documentId))}/download`
  );
}

