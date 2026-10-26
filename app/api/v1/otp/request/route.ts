import { NextResponse } from "next/server";
import { getBackendUrl } from "@/shared/lib/env";

function resolveBackendRequestUrl(): string {
  try {
    const rawBackend = getBackendUrl();
    const clean = rawBackend.replace(/\/+$/, "").replace(/\/api(\/v1)?\/?$/, "");
    return `${clean}/api/v1/otp/request`;
  } catch {
    const fallback = (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://oohaiplatform.ir/api/v1"
    )
      .replace(/\/+$/, "")
      .replace(/\/api(\/v1)?\/?$/, "");
    return `${fallback}/api/v1/otp/request`;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.phone) {
    return NextResponse.json(
      { success: false, message: "شماره موبایل الزامی است." },
      { status: 400 }
    );
  }

  const backendUrl = resolveBackendRequestUrl();

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ phone: body.phone }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(
      data ?? { success: res.ok, message: res.ok ? "کد تأیید ارسال شد." : "خطا در ارسال کد تأیید." },
      { status: res.status }
    );
  } catch (err) {
    console.error("Connection error in POST /api/v1/otp/request:", err);
    return NextResponse.json(
      { success: false, message: "ارتباط با سرور برقرار نشد." },
      { status: 502 }
    );
  }
}
