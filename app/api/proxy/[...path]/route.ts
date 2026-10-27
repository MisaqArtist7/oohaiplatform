import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/shared/lib/env";

interface RouteParams {
  params: Promise<{
    path: string[];
  }>;
}

/**
 * پراکسی عمومی کلیه درخواست‌های API به بک‌اند اصلی لاراول
 * 
 * ویژگی‌ها:
 * ۱. خواندن خودکار توکن از کوکی HttpOnly `access_token` و تزریق در هدر `Authorization: Bearer <token>`
 * ۲. فوروارد هدر `Accept: application/json` به صورت دائمی
 * ۳. عبور دست‌نخورده هدر `Content-Type` به همراه مرزهای باینری (boundary) برای درخواست‌های چندبخشی (Multipart)
 * ۴. انتقال بادی به صورت باینری خام (`arrayBuffer`) جهت تضمین عدم خرابی آپلود فایل‌ها
 * ۵. حفظ کامل پارامترهای کوئری‌استرینگ و اعمال سیاست `cache: no-store`
 * ۶. کپی هدرهای `content-type` و `retry-after` پاسخ سرور و بازگرداندن بادی و وضعیت پاسخ به کلاینت
 * ۷. پاکسازی کوکی احراز هویت در صورت دریافت وضعیت ۴۰۱ Unauthorized از بک‌اند
 * ۸. بازگرداندن وضعیت ۵۰۲ (Bad Gateway) در صورت عدم دسترسی به سرور بدون ایجاد داده جعلی
 */
async function handleProxy(request: NextRequest, segmentData: RouteParams): Promise<NextResponse> {
  const { path: pathSegments } = await segmentData.params;

  let targetUrl: string;
  try {
    const rawBackend = getBackendUrl().replace(/\/+$/, "");
    const cleanBackend = rawBackend.replace(/\/api(\/v\d+)?\/?$/, "");
    const { search } = new URL(request.url);
    const subPath = pathSegments.join("/");
    targetUrl = `${cleanBackend}/api/${subPath}${search}`;
  } catch (err) {
    console.error("Proxy target resolution error:", err);
    return NextResponse.json(
      { message: "ارتباط با سرور برقرار نشد" },
      { status: 502 }
    );
  }

  const headers = new Headers();
  headers.set("Accept", "application/json");

  // ۱. خواندن توکن از کوکی و تنظیم هدر Authorization
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

  // ۲. عبور عین هدر Content-Type کلاینت همراه با boundary
  const clientContentType = request.headers.get("content-type");
  if (clientContentType) {
    headers.set("Content-Type", clientContentType);
  }

  // ۳. استخراج بادی به شکل باینری خام برای حفظ آپلودهای multipart
  let body: ArrayBuffer | undefined = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    try {
      body = await request.arrayBuffer();
    } catch {
      body = undefined;
    }
  }

  // ۴. ارسال درخواست به بک‌اند با no-store
  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: request.method,
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

  // ۵. کپی هدرهای ضروری پاسخ بک‌اند (content-type و retry-after)
  const responseHeaders = new Headers();
  const resContentType = backendRes.headers.get("content-type");
  if (resContentType) {
    responseHeaders.set("Content-Type", resContentType);
  }

  const retryAfter =
    backendRes.headers.get("retry-after") ??
    backendRes.headers.get("Retry-After");
  if (retryAfter) {
    responseHeaders.set("Retry-After", retryAfter);
  }

  const resBody = await backendRes.arrayBuffer();

  const response = new NextResponse(resBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: responseHeaders,
  });

  // ۶. پاک کردن کوکی در صورت بروز خطای ۴۰۱ از سمت بک‌اند
  if (backendRes.status === 401) {
    response.cookies.delete("access_token");
    response.cookies.delete("user_info");
    response.cookies.delete("token");
    response.cookies.delete("user");
  }

  return response;
}

export async function GET(request: NextRequest, segmentData: RouteParams) {
  return handleProxy(request, segmentData);
}

export async function POST(request: NextRequest, segmentData: RouteParams) {
  return handleProxy(request, segmentData);
}

export async function PUT(request: NextRequest, segmentData: RouteParams) {
  return handleProxy(request, segmentData);
}

export async function PATCH(request: NextRequest, segmentData: RouteParams) {
  return handleProxy(request, segmentData);
}

export async function DELETE(request: NextRequest, segmentData: RouteParams) {
  return handleProxy(request, segmentData);
}
