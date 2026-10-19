import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const store = await cookies();
    const token = store.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "احراز هویت انجام نشده است." },
        { status: 401 }
      );
    }

    const endpoints = [
      process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/media-owner-requests`
        : null,
      "http://localhost/api/v1/admin/media-owner-requests",
      "https://oohaiplatform.ir/api/v1/admin/media-owner-requests",
    ].filter(Boolean) as string[];

    let lastErrorData = null;
    let lastStatus = 500;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          return NextResponse.json(data);
        }

        lastStatus = res.status;
        lastErrorData = await res.json().catch(() => null);
      } catch {
        // try next endpoint
      }
    }

    return NextResponse.json(
      lastErrorData || { success: false, message: "خطا در برقراری ارتباط با سرویس درخواست‌ها." },
      { status: lastStatus }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ارتباط با سرور." },
      { status: 500 }
    );
  }
}
