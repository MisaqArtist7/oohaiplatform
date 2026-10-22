import {
  AdminBooking,
  AdminBookingFilterParams,
  AdminMediaOwnerRequest,
  AdminRole,
  AdminUser,
  BookingAuditLog,
} from "@/types/admin-dashboard";
import {
  adminBookingsStore,
  adminAuditLogsStore,
  adminMediaOwnerRequestsStore,
  adminUsersStore,
  initialAdminRoles,
  lockAdminBooking,
  issueAdminProforma,
  approveAdminPayment,
  rejectAdminBooking,
  transitionAdminBookingStatus,
  approveMediaOwnerApplication,
  rejectMediaOwnerApplication,
  assignRoleToUser,
  removeRoleFromUser,
} from "./admin-dashboard-data";

/**
 * دریافت لیست رزروها با فیلترهای پیشرفته
 */
export async function getAdminBookings(
  filters?: AdminBookingFilterParams
): Promise<{ success: boolean; data: AdminBooking[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "all") params.set("status", filters.status);
    if (filters?.customer) params.set("customer", filters.customer);
    if (filters?.structure) params.set("structure", filters.structure);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.search) params.set("search", filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/v1/admin/bookings${queryString}`, {
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // خطای شبکه یا رندر محلی، از استور محلی استفاده می‌کنیم
  }

  // فیلتر کلاینت‌ساید به عنوان فال‌بک
  let list = [...adminBookingsStore];
  if (filters?.status && filters.status !== "all") {
    list = list.filter((b) => b.status.value === filters.status);
  }
  if (filters?.customer) {
    const q = filters.customer.toLowerCase();
    list = list.filter((b) => {
      const cName = (b.customer?.fullName || b.contactPerson || "").toLowerCase();
      const comp = (b.customer?.companyName || b.brandName || "").toLowerCase();
      return cName.includes(q) || comp.includes(q);
    });
  }
  if (filters?.structure) {
    const q = filters.structure.toLowerCase();
    list = list.filter(
      (b) =>
        b.structure.title.toLowerCase().includes(q) ||
        b.structure.code.toLowerCase().includes(q)
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((b) => {
      const cName = (b.customer?.fullName || b.contactPerson || "").toLowerCase();
      const comp = (b.customer?.companyName || b.brandName || "").toLowerCase();
      return (
        b.trackingCode.toLowerCase().includes(q) ||
        cName.includes(q) ||
        comp.includes(q) ||
        b.structure.title.toLowerCase().includes(q)
      );
    });
  }

  return { success: true, data: list, total: list.length };
}

/**
 * دریافت اطلاعات کامل یک رزرو
 */
export async function getAdminBookingById(
  bookingId: string
): Promise<{ success: boolean; data?: AdminBooking; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  const booking = adminBookingsStore.find((b) => b.id === bookingId);
  if (!booking) {
    return { success: false, message: "رزرو مورد نظر در سامانه یافت نشد" };
  }
  return { success: true, data: booking };
}

/**
 * تایید اولیه و قفل ۴۸ ساعته سازه
 */
export async function lockBookingSlot(
  bookingId: string
): Promise<{ success: boolean; data?: AdminBooking; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = lockAdminBooking(bookingId);
  if (!updated) return { success: false, message: "رزرو یافت نشد" };
  return {
    success: true,
    data: updated,
    message: "قفل ۴۸ ساعته سازه اعمال شد و تایید اولیه صادر گردید.",
  };
}

/**
 * صدور و ثبت پیش‌فاکتور رسمی
 */
export async function issueProformaInvoice(
  bookingId: string,
  payload: { invoiceNumber: string; amount: number; fileUrl?: string }
): Promise<{ success: boolean; data?: AdminBooking; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/proforma`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = issueAdminProforma(
    bookingId,
    payload.invoiceNumber,
    payload.amount,
    payload.fileUrl
  );
  if (!updated) return { success: false, message: "رزرو یافت نشد" };
  return {
    success: true,
    data: updated,
    message: "پیش‌فاکتور رسمی با موفقیت صادر و بارگذاری شد.",
  };
}

/**
 * تایید نهایی پرداخت و مجوز اکران توسط مدیر مالی
 */
export async function approvePaymentAndBroadcast(
  bookingId: string,
  approvalNote?: string
): Promise<{ success: boolean; data?: AdminBooking; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/approve-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalNote }),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = approveAdminPayment(bookingId, approvalNote);
  if (!updated) return { success: false, message: "رزرو یافت نشد" };
  return {
    success: true,
    data: updated,
    message: "پرداخت تایید شد و دستور اکران نهایی صادر گردید.",
  };
}

/**
 * رد درخواست رزرو با ذکر علت
 */
export async function rejectBookingRequest(
  bookingId: string,
  reason: string
): Promise<{ success: boolean; data?: AdminBooking; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = rejectAdminBooking(bookingId, reason);
  if (!updated) return { success: false, message: "رزرو یافت نشد" };
  return {
    success: true,
    data: updated,
    message: "درخواست رزرو رد شد و مراتب به مشتری اعلام گردید.",
  };
}

/**
 * تغییر وضعیت دستی توسط اپراتور سیستم
 */
export async function transitionBookingState(
  bookingId: string,
  status: string,
  statusLabel?: string,
  note?: string
): Promise<{ success: boolean; data?: AdminBooking; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, statusLabel, note }),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = transitionAdminBookingStatus(bookingId, status, statusLabel, note);
  if (!updated) return { success: false, message: "رزرو یافت نشد" };
  return {
    success: true,
    data: updated,
    message: `وضعیت رزرو به «${updated.status.label}» تغییر یافت.`,
  };
}

/**
 * دریافت تاریخچه تغییرات و لاگ‌های بازرسی
 */
export async function getBookingAuditLogs(
  bookingId: string
): Promise<{ success: boolean; data: BookingAuditLog[] }> {
  try {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/logs`, {
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const logs = adminAuditLogsStore.filter((l) => l.bookingId === bookingId);
  return { success: true, data: logs };
}

/**
 * دریافت لیست درخواست‌های همکاری مالکان رسانه
 */
export async function getAdminMediaOwnerRequests(): Promise<{
  success: boolean;
  data: AdminMediaOwnerRequest[];
}> {
  try {
    const res = await fetch(`/api/v1/admin/media-owner-requests`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json && (json.data || Array.isArray(json))) {
        return {
          success: true,
          data: Array.isArray(json) ? json : json.data,
        };
      }
    }
  } catch {
    // fallback
  }

  return { success: true, data: [...adminMediaOwnerRequestsStore] };
}

/**
 * تایید درخواست مالک رسانه
 */
export async function approveMediaOwnerRequest(
  requestId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/media-owner-requests/${requestId}/approve`, {
      method: "POST",
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = approveMediaOwnerApplication(requestId);
  if (!updated) return { success: false, message: "درخواست یافت نشد" };
  return {
    success: true,
    message: "درخواست احراز هویت شرکت با موفقیت تایید و دسترسی صادر شد.",
  };
}

/**
 * رد درخواست مالک رسانه با ذکر دلیل
 */
export async function rejectMediaOwnerRequest(
  requestId: string,
  reason: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/media-owner-requests/${requestId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejection_reason: reason }),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const updated = rejectMediaOwnerApplication(requestId, reason);
  if (!updated) return { success: false, message: "درخواست یافت نشد" };
  return {
    success: true,
    message: "درخواست مالک رسانه رد شد.",
  };
}

/**
 * دریافت لیست کاربران و نقش‌ها
 */
export async function getAdminUsers(
  searchQuery?: string
): Promise<{ success: boolean; data: AdminUser[]; roles: AdminRole[] }> {
  try {
    const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
    const res = await fetch(`/api/v1/admin/users${q}`, {
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  let list = [...adminUsersStore];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (u) =>
        (u.fullName || u.name).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.company ? u.company.toLowerCase().includes(q) : false) ||
        u.department.toLowerCase().includes(q)
    );
  }

  return { success: true, data: list, roles: initialAdminRoles };
}

/**
 * اختصاص نقش به کاربر
 */
export async function assignRoleToUserApi(
  userId: string,
  roleSlug: string
): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/users/${userId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleSlug }),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const user = assignRoleToUser(userId, roleSlug);
  if (!user) return { success: false, message: "کاربر یا نقش یافت نشد" };
  return {
    success: true,
    user,
    message: "نقش کاربری با موفقیت به کاربر اختصاص یافت.",
  };
}

/**
 * حذف نقش از کاربر
 */
export async function removeRoleFromUserApi(
  userId: string,
  roleSlug: string
): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  try {
    const res = await fetch(`/api/v1/admin/users/${userId}/roles`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleSlug }),
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  const user = removeRoleFromUser(userId, roleSlug);
  if (!user) return { success: false, message: "کاربر یافت نشد" };
  return {
    success: true,
    user,
    message: "نقش با موفقیت از کاربر سلب گردید.",
  };
}
