import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminMediaOwnerRequestsStore } from "@/lib/admin-dashboard-data";

export async function GET() {


  try {
    const store = await cookies();
    const token = store.get("token")?.value;

    const endpoints = [
      process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/media-owner-requests`
        : null,
      "https://oohaiplatform.ir/api/v1/admin/media-owner-requests",
    ].filter(Boolean) as string[];

    if (token) {
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
            if (data) return NextResponse.json(data);
          }
        } catch {
          // try next endpoint
        }
      }
    }

    // بازگردانی داده‌های موک پایدار در صورت عدم دسترسی به سرور خارجی
    return NextResponse.json({
      success: true,
      data: adminMediaOwnerRequestsStore,
      total: adminMediaOwnerRequestsStore.length,
    });
  } catch (err) {
    console.error("Error in GET admin media-owner-requests:", err);
    return NextResponse.json({
      success: true,
      data: adminMediaOwnerRequestsStore,
      total: adminMediaOwnerRequestsStore.length,
    });
  }
}
