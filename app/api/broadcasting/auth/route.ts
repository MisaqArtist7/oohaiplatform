import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/shared/lib/env";

/**
 * روت احراز هویت کانال‌های خصوصی وب‌سوکت Laravel Echo / Reverb
 * 
 * درخواست دریافت شده را با الصاق توکن احراز هویت از کوکی `access_token`
 * به اندپوینت `/broadcasting/auth` در سرور اصلی لاراول فوروارد می‌کند.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let targetUrl: string;
  try {
    const rawBackend = getBackendUrl().replace(/\/+$/, "");
    const cleanBackend = rawBackend.replace(/\/api(\/v\d+)?\/?$/, "");
    targetUrl = `${cleanBackend}/broadcasting/auth`;
  } catch (err) {
    console.error("Broadcasting auth target resolution error:", err);
    return NextResponse.json(
      { message: "ارتباط با سرور برقرار نشد" },
      { status: 502 }
    );
  }

  const headers = new Headers();
  headers.set("Accept", "application/json");

  // ۱. خواندن توکن از کوکی و افزودن به هدر
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("access_token")?.value ||
      cookieStore.get("token")?.value;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch {
    // عدم دسترسی به کوکی
  }

  // ۲. فوروارد عین هدر Content-Type کلاینت
  const clientContentType = request.headers.get("content-type");
  if (clientContentType) {
    headers.set("Content-Type", clientContentType);
  }

  // ۳. استخراج بادی خام (arrayBuffer) جهت حفظ دقیق فیلدهای socket_id و channel_name
  let body: ArrayBuffer | undefined = undefined;
  try {
    body = await request.arrayBuffer();
  } catch {
    body = undefined;
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "ارتباط با سرور برقرار نشد" },
      { status: 502 }
    );
  }

  const resBody = await backendRes.arrayBuffer();
  const responseHeaders = new Headers();
  const contentType = backendRes.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("Content-Type", contentType);
  }

  return new NextResponse(resBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: responseHeaders,
  });
}
