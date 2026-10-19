import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export async function POST() {
  const store = await cookies();
  const token = store.get("token")?.value;

  if (token) {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // حتی در صورت عدم پاسخ‌دهی سرور، کوکی‌های محلی را پاک می‌کنیم
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "خروج با موفقیت انجام شد.",
  });

  response.cookies.delete("token");
  response.cookies.delete("user");

  return response;
}
