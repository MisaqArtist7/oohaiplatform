import type { UserRole } from "@/types/auth";

/**
 * مسیر مناسب برای هدایت کاربر پس از لاگین بر اساس مجوزها (Permissions) یا نقش‌ها (Roles)
 */
export function getRedirectPath(
  permissions: string[] = [],
  roles: (string | UserRole)[] = []
): string {
  // ۰. بررسی دسترسی یا نقش سوپر ادمین
  const roleNames = roles.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean);
  const isSuperAdmin =
    permissions.some((p) =>
      ["superadmin", "super-admin", "super_admin", "dashboard.superadmin"].includes(p.toLowerCase())
    ) ||
    roleNames.some((r) =>
      ["superadmin", "super-admin", "super_admin"].includes(r.toLowerCase())
    );

  if (isSuperAdmin) {
    return "/dashboard/superadmin";
  }

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
  if (roleNames.includes("admin")) {
    return "/admin";
  }

  if (roleNames.includes("media-owner")) {
    return "/media-owner";
  }

  // ۳. برای کاربران عادی که ثبت‌نام کرده‌اند و احراز شده‌اند
  return "/dashboard";
}
