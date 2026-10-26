import { getHomePath } from "./lib/get-home-path";

/**
 * @deprecated از getHomePath در @/features/auth استفاده کنید.
 */
export function getRedirectPath(
  _permissions: string[] = [],
  roleOrRoles?: unknown
): string {
  let role = "client";
  if (typeof roleOrRoles === "string") {
    role = roleOrRoles;
  } else if (Array.isArray(roleOrRoles) && roleOrRoles.length > 0) {
    const first = roleOrRoles[0];
    role = typeof first === "string" ? first : first?.slug || first?.name || "client";
  }
  return getHomePath(role);
}

export * from "./lib/get-home-path";
