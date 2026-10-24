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

  // ۱. بررسی دسترسی یا نقش مالک رسانه (Media Owner)
  const isMediaOwner =
    permissions.some((p) =>
      ["media-owner", "media_owner", "mediaowner", "dashboard.media-owner", "dashboard.media_owner", "structures.manage"].includes(p.toLowerCase())
    ) ||
    roleNames.some((r) =>
      ["media-owner", "media_owner", "mediaowner"].includes(r.toLowerCase())
    );

  if (isMediaOwner) {
    return "/media-owner/structures";
  }

  // ۲. بررسی مجوزهای صریح
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

  // ۳. بررسی نقش‌ها (در صورت خالی بودن یا ناقص بودن دسترسی‌ها)
  if (roleNames.includes("admin")) {
    return "/admin";
  }

  // ۴. برای کاربران عادی که ثبت‌نام کرده‌اند و احراز شده‌اند
  return "/dashboard";
}
