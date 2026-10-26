import type { AuthRole } from "../types";

/**
 * تعیین مسیر مقصد کاربر پس از ورود بر اساس نقش (user.role)
 *
 * | نقش (user.role) | مقصد بعد از ورود |
 * |---|---|
 * | client | /client |
 * | media_owner | /media-owner/structures |
 * | super_admin | /admin |
 */
export function getHomePath(role: AuthRole | string | undefined | null): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "media_owner":
      return "/media-owner/structures";
    case "client":
    default:
      return "/client";
  }
}

/**
 * اعتبارسنجی پارامتر next جهت جلوگیری از حملات Open Redirect:
 * پارامتر باید حتماً با "/" شروع شود و هرگز با "//" شروع نشود.
 */
export function isValidNextPath(next: string | null | undefined): boolean {
  if (!next) return false;
  return next.startsWith("/") && !next.startsWith("//");
}

/**
 * تعیین مسیر نهایی انتقال کاربر:
 * اولویت با پارامتر next معتبر است و در غیر این صورت به صفحه خانگی نقش هدایت می‌شود.
 */
export function getRedirectDestination(
  role: AuthRole | string | undefined | null,
  nextParam?: string | null
): string {
  if (isValidNextPath(nextParam)) {
    return nextParam as string;
  }
  return getHomePath(role);
}
