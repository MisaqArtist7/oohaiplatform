import { NextResponse } from "next/server";
import { getBackendUrl } from "@/shared/lib/env";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.phone || !body?.otp) {
    return NextResponse.json(
      { success: false, message: "شماره موبایل و کد تأیید الزامی است." },
      { status: 400 }
    );
  }

  let backendUrl: string;
  try {
    const rawBackend = getBackendUrl().replace(/\/+$/, "");
    const cleanBackend = rawBackend.replace(/\/api\/?$/, "");
    backendUrl = `${cleanBackend}/api/v1/otp/verify`;
  } catch (err) {
    console.error("Backend URL configuration error in verify:", err);
    return NextResponse.json(
      { success: false, message: "ارتباط با سرور برقرار نشد." },
      { status: 502 }
    );
  }

  let res: Response;
  try {
    res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ phone: body.phone, otp: body.otp }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "ارتباط با سرور برقرار نشد." },
      { status: 502 }
    );
  }

  const data = await res.json().catch(() => null);

  // در صورت بروز خطا از سمت بک‌اند (مثلاً ۴۲۲ برای کد اشتباه یا منقضی)
  if (!res.ok || !data?.success) {
    return NextResponse.json(
      data ?? { success: false, message: "تأیید کد با خطا مواجه شد." },
      { status: res.status }
    );
  }

  const token: string | undefined = data?.data?.token || data?.token;
  const user = data?.data?.user || data?.user;

  if (!token || !user) {
    return NextResponse.json(
      { success: false, message: "پاسخ سرور فاقد توکن یا اطلاعات کاربر است." },
      { status: 500 }
    );
  }

  const userRole = user.role || (Array.isArray(user.roles) ? user.roles[0] : "client");
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : user.role
      ? [user.role]
      : ["client"];

  const safeUserInfo = {
    id: user.id,
    uuid: user.uuid,
    name: user.name,
    role: typeof userRole === "string" ? userRole : userRole?.slug || userRole?.name || "client",
    roles: userRoles.map((r: unknown) =>
      typeof r === "string"
        ? r
        : (r as { slug?: string; name?: string })?.slug ||
          (r as { slug?: string; name?: string })?.name ||
          "client"
    ),
    permissions: user.permissions || [],
  };

  // توکن هرگز در بدنه پاسخ کلاینت قرار نمی‌گیرد
  const response = NextResponse.json({
    success: true,
    message: data.message || "ورود با موفقیت انجام شد.",
    user: safeUserInfo,
  });

  // ۱. ذخیره توکن احراز هویت منحصراً در کوکی امن HttpOnly
  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ۷ روز
  });

  // ۲. ذخیره موقت اطلاعات عمومی و غیرحساس کاربر در کوکی غیر-HttpOnly (جهت سشن کلاینت)
  response.cookies.set("user_info", JSON.stringify(safeUserInfo), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // پاک کردن کوکی‌های قدیمی
  response.cookies.delete("token");
  response.cookies.delete("user");

  return response;
}
