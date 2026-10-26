import { cookies } from "next/headers";
import type { User, AuthRole, AuthPermission } from "../types";

/**
 * دریافت سشن کاربر در سرور کامپوننت‌ها از روی کوکی‌های معتبر
*/

export async function getServerSession(): Promise<User | null> {
  try {
    const store = await cookies();
    const token =
      store.get("access_token")?.value ||
      store.get("token")?.value;

    const userInfoRaw =
      store.get("user_info")?.value ||
      store.get("user")?.value;

    if (!token || !userInfoRaw) {
      return null;
    }

    const parsed = JSON.parse(userInfoRaw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const role = (parsed.role as AuthRole) || "client";
    const permissions = Array.isArray(parsed.permissions)
      ? (parsed.permissions as AuthPermission[])
      : [];

    const user: User = {
      id: parsed.id ?? 0,
      uuid: parsed.uuid,
      name: parsed.name ?? "",
      phone: parsed.phone ?? "",
      is_active: parsed.is_active ?? true,
      role,
      permissions,
    };

    return user;
  } catch {
    return null;
  }
}
