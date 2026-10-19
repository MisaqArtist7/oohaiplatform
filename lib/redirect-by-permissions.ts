import type { UserRole } from "@/types/auth";

/**
 * مسیر مناسب برای هدایت کاربر پس از لاگین بر اساس مجوزها (Permissions) یا نقش‌ها (Roles)
 */
export function getRedirectPath(
  permissions: string[] = [],
  roles: (string | UserRole)[] = []
): string {
  // ۱. بررسی مجوزهای صریح
  if (permissions.includes("dashboard.admin")) {
    return "/admin";
  }

  if (permissions.includes("dashboard.client")) {
    return "/dashboard";
  }

  if (permissions.includes("booking.request")) {
    return "/dashboard/bookings";
  }

  if (permissions.includes("proposal.generate-ai")) {
    return "/dashboard/ai-proposal";
  }

  // ۲. بررسی نقش‌ها (در صورت خالی بودن یا ناقص بودن دسترسی‌ها)
  const roleNames = roles.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean);
  if (roleNames.includes("admin") || roleNames.includes("super-admin")) {
    return "/admin";
  }

  if (roleNames.includes("media-owner")) {
    return "/media-owner";
  }

  // ۳. برای کاربران عادی که ثبت‌نام کرده‌اند و احراز شده‌اند
  return "/dashboard";
}
