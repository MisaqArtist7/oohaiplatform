// TODO: جایگزینی با GET /api/v1/auth/me پس از آماده شدن بک‌اند

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface SessionUser {
  id?: string | number;
  uuid?: string;
  name?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
}

export async function GET() {
  const store = await cookies();
  const token =
    store.get("access_token")?.value ||
    store.get("token")?.value;

  const userInfoRaw =
    store.get("user_info")?.value ||
    store.get("user")?.value;

  // در صورت نبود توکن یا کوکی کاربر، وضعیت ۴۰۱ Unauthorized بازگردانده می‌شود
  if (!token || !userInfoRaw) {
    return NextResponse.json(
      { authenticated: false, message: "نشست کاربر نامعتبر است یا منقضی شده است." },
      { status: 401 }
    );
  }

  let user: SessionUser | null = null;
  try {
    user = JSON.parse(userInfoRaw);
  } catch {
    return NextResponse.json(
      { authenticated: false, message: "اطلاعات نشست نامعتبر است." },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { authenticated: false, message: "کاربر یافت نشد." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      role: user.role,
      roles: user.roles || (user.role ? [user.role] : []),
      permissions: user.permissions || [],
    },
  });
}
