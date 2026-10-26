import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { User, AuthRole, AuthPermission } from "@/features/auth/types";

export async function GET() {
  const store = await cookies();
  const token =
    store.get("access_token")?.value ||
    store.get("token")?.value;

  const userInfoRaw =
    store.get("user_info")?.value ||
    store.get("user")?.value;

  if (!token || !userInfoRaw) {
    return NextResponse.json(
      { authenticated: false, message: "نشست کاربر نامعتبر است یا منقضی شده است." },
      { status: 401 }
    );
  }

  try {
    const rawUser = JSON.parse(userInfoRaw);
    if (!rawUser) {
      return NextResponse.json(
        { authenticated: false, message: "اطلاعات نشست نامعتبر است." },
        { status: 401 }
      );
    }

    const rawRole = rawUser.role || (Array.isArray(rawUser.roles) ? rawUser.roles[0] : "client");
    const roleSlug = (typeof rawRole === "string" ? rawRole : rawRole?.slug || rawRole?.name || "client") as AuthRole;

    const user: User = {
      id: rawUser.id,
      uuid: rawUser.uuid,
      name: rawUser.name,
      phone: rawUser.phone,
      is_active: rawUser.is_active ?? true,
      role: ["client", "media_owner", "super_admin"].includes(roleSlug) ? roleSlug : "client",
      permissions: Array.isArray(rawUser.permissions) ? (rawUser.permissions as AuthPermission[]) : [],
    };

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, message: "اطلاعات نشست نامعتبر است." },
      { status: 401 }
    );
  }
}
