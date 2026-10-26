import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/shared/lib/env";

export async function POST() {
  let token: string | undefined = undefined;
  try {
    const store = await cookies();
    token =
      store.get("access_token")?.value ||
      store.get("token")?.value;
  } catch {
    // خطا در دسترسی به کوکی
  }

  if (token) {
    try {
      const rawBackend = getBackendUrl().replace(/\/+$/, "");
      const cleanBackend = rawBackend.replace(/\/api\/?$/, "");
      await fetch(`${cleanBackend}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // خطا نادیده گرفته می‌شود تا عملیات خروج سمت کلاینت مسدود نگردد
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "خروج با موفقیت انجام شد.",
  });

  // پاک کردن کوکی‌های احراز هویت
  response.cookies.delete("access_token");
  response.cookies.delete("user_info");
  response.cookies.delete("token");
  response.cookies.delete("user");

  return response;
}
