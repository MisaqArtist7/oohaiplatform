import { http } from "@/shared/lib/http";
import type {
  Booking,
  BookingLog,
  AdminUser,
  UserRoleValue,
  AdminBookingFilters,
  AdminUserFilters,
  Page,
  AdminMediaOwnerRequest,
} from "../types";


/**
 * آداپتر نرمال‌سازی پاسخ‌های صفحه‌بندی‌شده به فرم استاندارد Page<T>
 */
function normalizePageResponse<T>(res: unknown): Page<T> {
  if (!res || typeof res !== "object") {
    return { data: [] };
  }

  const obj = res as Record<string, unknown>;

  // اگر پاسخ مستقیماً آرایه باشد
  if (Array.isArray(res)) {
    return {
      data: res as T[],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: res.length,
        total: res.length,
      },
    };
  }

  // اگر داده در obj.data.data باشد (تودرتو در لاراول)
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const nested = obj.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) {
      return {
        data: nested.data as T[],
        meta: (nested.meta || {
          current_page: Number(nested.current_page || 1),
          last_page: Number(nested.last_page || 1),
          per_page: Number(nested.per_page || nested.data.length || 15),
          total: Number(nested.total || nested.data.length),
        }) as Page<T>["meta"],
        links: nested.links as Page<T>["links"],
      };
    }
  }

  // حالت استاندارد: { data: [...], meta: {...}, links: {...} }
  if (Array.isArray(obj.data)) {
    const metaObj = (obj.meta && typeof obj.meta === "object") ? (obj.meta as Record<string, unknown>) : null;
    return {
      data: obj.data as T[],
      meta: {
        current_page: Number(metaObj?.current_page || obj.current_page || 1),
        last_page: Number(metaObj?.last_page || obj.last_page || 1),
        per_page: Number(metaObj?.per_page || obj.per_page || (obj.data as unknown[]).length || 15),
        total: Number(metaObj?.total || obj.total || (obj.data as unknown[]).length),
        from: (metaObj?.from || obj.from) as number | undefined,
        to: (metaObj?.to || obj.to) as number | undefined,
      },
      links: (obj.links || {}) as Page<T>["links"],
    };
  }

  return { data: [] };
}

/**
 * آداپتر تک آیتم جهت استخراج data در صورت وجود envelope
 */
function unwrapSingleItem<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    const dataObj = (res as { data: unknown }).data;
    if (dataObj && typeof dataObj === "object" && !Array.isArray(dataObj)) {
      return dataObj as T;
    }
  }
  return res as T;
}

// ==========================================
// ۱. وب‌سرویس‌های مدیریت رزروها (Admin Bookings)
// ==========================================

/**
 * دریافت لیست رزروهای ادمین با فیلترهای استاندارد سند
 * GET /api/v1/admin/bookings
 */
export async function listAdminBookings(
  filters?: AdminBookingFilters
): Promise<Page<Booking>> {
  const query: Record<string, string | number | undefined> = {};
  if (filters?.status && filters.status !== "all") query.status = filters.status;
  if (filters?.structure_id) query.structure_id = filters.structure_id;
  if (filters?.client_id) query.client_id = filters.client_id;
  if (filters?.page) query.page = filters.page;

  const res = await http.get<unknown>("/admin/bookings", { query });
  return normalizePageResponse<Booking>(res);
}

/**
 * مشاهده جزییات کامل یک پرونده رزرو برای ادمین
 * GET /api/v1/admin/bookings/{id}
 */
export async function getAdminBooking(id: number | string): Promise<Booking> {
  const res = await http.get<unknown>(`/admin/bookings/${encodeURIComponent(String(id))}`);
  return unwrapSingleItem<Booking>(res);
}

/**
 * مشاهده تاریخچه و لاگ‌های حسابرسی یک پرونده رزرو (Audit Trail)
 * GET /api/v1/admin/bookings/{id}/logs
 */
export async function getAdminBookingLogs(id: number | string): Promise<BookingLog[]> {
  const res = await http.get<unknown>(`/admin/bookings/${encodeURIComponent(String(id))}/logs`);
  if (Array.isArray(res)) return res as BookingLog[];
  if (res && typeof res === "object" && Array.isArray((res as Record<string, unknown>).data)) {
    return (res as { data: BookingLog[] }).data;
  }
  return [];
}

/**
 * تایید اولیه و اعمال قفل قرارداد ۴۸ ساعته
 * POST /api/v1/admin/bookings/{id}/lock
 */
export async function lockBooking(
  id: number | string,
  note?: string
): Promise<{ message?: string; data?: unknown }> {
  return http.post<{ message?: string; data?: unknown }>(
    `/admin/bookings/${encodeURIComponent(String(id))}/lock`,
    {
      body: note?.trim() ? { note: note.trim() } : {},
    }
  );
}

/**
 * صدور و بارگذاری پیش‌فاکتور رسمی با فرمت Multipart/FormData
 * POST /api/v1/admin/bookings/{id}/proforma
 */
export async function issueProforma(
  id: number | string,
  file: File,
  note?: string
): Promise<{ message?: string; data?: unknown }> {
  const formData = new FormData();
  formData.append("document", file);
  if (note?.trim()) {
    formData.append("note", note.trim());
  }

  // http به صورت خودکار با تشخیص FormData از قرار دادن دستی Content-Type خودداری می‌کند
  return http.post<{ message?: string; data?: unknown }>(
    `/admin/bookings/${encodeURIComponent(String(id))}/proforma`,
    {
      body: formData,
    }
  );
}

/**
 * تایید نهایی سند پرداخت و شروع اکران
 * POST /api/v1/admin/bookings/{id}/approve-payment
 */
export async function approvePayment(
  id: number | string,
  note?: string
): Promise<{ message?: string; data?: unknown }> {
  return http.post<{ message?: string; data?: unknown }>(
    `/admin/bookings/${encodeURIComponent(String(id))}/approve-payment`,
    {
      body: note?.trim() ? { note: note.trim() } : {},
    }
  );
}

/**
 * رد درخواست رزرو با ثبت دلیل اجباری
 * POST /api/v1/admin/bookings/{id}/reject
 */
export async function rejectBooking(
  id: number | string,
  reason: string
): Promise<{ message?: string; data?: unknown }> {
  return http.post<{ message?: string; data?: unknown }>(
    `/admin/bookings/${encodeURIComponent(String(id))}/reject`,
    {
      body: { reason: reason.trim() },
    }
  );
}

/**
 * پایان دوره اکران سازه (انتقال وضعیت از occupied به completed)
 * POST /api/v1/admin/bookings/{id}/transition
 */
export async function completeBooking(
  id: number | string,
  note?: string
): Promise<{ message?: string; data?: unknown }> {
  return http.post<{ message?: string; data?: unknown }>(
    `/admin/bookings/${encodeURIComponent(String(id))}/transition`,
    {
      body: {
        target_status: "completed",
        ...(note?.trim() ? { note: note.trim() } : {}),
      },
    }
  );
}

/**
 * دریافت لینک دانلود امن و امضاشده مدارک و فیش‌ها برای ادمین
 * GET /api/v1/admin/bookings/{id}/documents/{docId}/download
 */
export async function getAdminDocumentDownloadUrl(
  id: number | string,
  docId: number | string
): Promise<{ download_url: string; expires_in_minutes?: number }> {
  const res = await http.get<Record<string, unknown>>(
    `/admin/bookings/${encodeURIComponent(String(id))}/documents/${encodeURIComponent(String(docId))}/download`
  );

  const download_url = (res?.download_url || res?.url || (res?.data as Record<string, unknown>)?.download_url || "") as string;
  const expires_in_minutes = Number(res?.expires_in_minutes || (res?.data as Record<string, unknown>)?.expires_in_minutes || 15);

  return { download_url, expires_in_minutes };
}

// ==========================================
// ۲. وب‌سرویس‌های مدیریت کاربران و نقش‌ها (Admin Users & Roles)
// ==========================================

/**
 * جستجو و واکشی لیست کاربران سیستم
 * GET /api/v1/admin/users
 */
export async function listAdminUsers(
  params?: AdminUserFilters
): Promise<Page<AdminUser>> {
  const query: Record<string, string | number | undefined> = {};
  if (params?.search) query.search = params.search;
  if (params?.page) query.page = params.page;
  if (params?.per_page) query.per_page = params.per_page;

  const res = await http.get<unknown>("/admin/users", { query });
  return normalizePageResponse<AdminUser>(res);
}

/**
 * مشاهده جزییات یک کاربر مشخص با uuid
 * GET /api/v1/admin/users/{userUuid}
 */
export async function getAdminUser(userUuid: string): Promise<AdminUser> {
  const res = await http.get<unknown>(`/admin/users/${encodeURIComponent(userUuid)}`);
  return unwrapSingleItem<AdminUser>(res);
}

/**
 * لیست نقش‌های فعال اختصاص‌یافته به یک کاربر
 * GET /api/v1/admin/users/{userUuid}/roles
 */
export async function getUserRoles(userUuid: string): Promise<UserRoleValue[]> {
  const res = await http.get<unknown>(`/admin/users/${encodeURIComponent(userUuid)}/roles`);

  let rawList: unknown[] = [];
  if (Array.isArray(res)) {
    rawList = res;
  } else if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      rawList = obj.data;
    } else if (Array.isArray(obj.roles)) {
      rawList = obj.roles;
    }
  }

  const validRoles: UserRoleValue[] = ["client", "media_owner", "super_admin"];
  const extracted: UserRoleValue[] = [];

  for (const item of rawList) {
    let slug = "";
    if (typeof item === "string") {
      slug = item;
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      slug = String(o.slug || o.name || "");
    }
    if (validRoles.includes(slug as UserRoleValue) && !extracted.includes(slug as UserRoleValue)) {
      extracted.push(slug as UserRoleValue);
    }
  }

  return extracted;
}

/**
 * اختصاص نقش به کاربر
 * POST /api/v1/admin/users/{userUuid}/roles
 */
export async function assignRole(
  userUuid: string,
  role: UserRoleValue
): Promise<{ message?: string; data?: unknown }> {
  return http.post<{ message?: string; data?: unknown }>(
    `/admin/users/${encodeURIComponent(userUuid)}/roles`,
    {
      body: { role },
    }
  );
}

/**
 * سلب یک نقش از کاربر
 * DELETE /api/v1/admin/users/{userUuid}/roles/{role}
 */
export async function removeRole(
  userUuid: string,
  role: UserRoleValue
): Promise<{ message?: string; data?: unknown }> {
  return http.delete<{ message?: string; data?: unknown }>(
    `/admin/users/${encodeURIComponent(userUuid)}/roles/${encodeURIComponent(role)}`
  );
}

// ==========================================
// ۳. وب‌سرویس‌های درخواست‌های مالکان رسانه (مربوط به تسک ۱۰)
// ==========================================

export async function getAdminMediaOwnerRequests(): Promise<{
  success: boolean;
  data: AdminMediaOwnerRequest[];
}> {
  try {
    const res = await http.get<{ success?: boolean; data?: AdminMediaOwnerRequest[] }>("/admin/media-owner-requests");
    if (res && Array.isArray(res.data)) {
      return { success: true, data: res.data };
    }
    if (Array.isArray(res)) {
      return { success: true, data: res as AdminMediaOwnerRequest[] };
    }
    return { success: true, data: [] };
  } catch {
    return { success: false, data: [] };
  }
}


export async function approveMediaOwnerRequest(
  requestId: string | number
): Promise<{ success: boolean; message: string }> {
  return http.post<{ success: boolean; message: string }>(
    `/admin/media-owner-requests/${encodeURIComponent(String(requestId))}/approve`
  );
}

export async function rejectMediaOwnerRequest(
  requestId: string | number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  return http.post<{ success: boolean; message: string }>(
    `/admin/media-owner-requests/${encodeURIComponent(String(requestId))}/reject`,
    {
      body: { reason },
    }
  );
}
