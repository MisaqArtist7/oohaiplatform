import { NextResponse } from "next/server";
import { getBackendUrl } from "@/shared/lib/env";
import type { User, AuthRole, AuthPermission } from "@/features/auth/types";

function resolveBackendVerifyUrl(): string {
  try {
    const rawBackend = getBackendUrl();
    const clean = rawBackend.replace(/\/+$/, "").replace(/\/api(\/v1)?\/?$/, "");
    return `${clean}/api/v1/otp/verify`;
  } catch {
    const fallback = (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://oohaiplatform.ir/api/v1"
    )
      .replace(/\/+$/, "")
      .replace(/\/api(\/v1)?\/?$/, "");
    return `${fallback}/api/v1/otp/verify`;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.phone || !body?.otp) {
    return NextResponse.json(
      { success: false, message: "شماره موبایل و کد تأیید الزامی است." },
      { status: 400 }
    );
  }

  const backendUrl = resolveBackendVerifyUrl();

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
  } catch (err) {
    console.error("Connection error in POST /api/auth/verify:", err);
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
  const rawUser = data?.data?.user || data?.user;

  if (!token || !rawUser) {
    return NextResponse.json(
      { success: false, message: "پاسخ سرور فاقد توکن یا اطلاعات کاربر است." },
      { status: 500 }
    );
  }

  const rawRole = rawUser.role || (Array.isArray(rawUser.roles) ? rawUser.roles[0] : "client");
  const roleSlug = (typeof rawRole === "string" ? rawRole : rawRole?.slug || rawRole?.name || "client") as AuthRole;

  // نوع User دقیقاً مطابق سند: id, uuid, name, phone, is_active, role, permissions[].
  const safeUserInfo: User = {
    id: rawUser.id,
    uuid: rawUser.uuid,
    name: rawUser.name,
    phone: rawUser.phone || body.phone,
    is_active: rawUser.is_active ?? true,
    role: ["client", "media_owner", "super_admin"].includes(roleSlug) ? roleSlug : "client",
    permissions: Array.isArray(rawUser.permissions) ? (rawUser.permissions as AuthPermission[]) : [],
  };

  // پاسخ موفق فقط user دارد
  const response = NextResponse.json({
    success: true,
    message: data.message || "ورود با موفقیت انجام شد.",
    user: safeUserInfo,
  });

  // ۱. ذخیره توکن احراز هویت در کوکی امن HttpOnly
  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ۷ روز
  });

  // ۲. ذخیره توکن در کوکی token جهت سازگاری با کدهای موجود
  response.cookies.set("token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // ۳. ذخیره اطلاعات سشن عمومی کاربر در کوکی غیر-HttpOnly
  response.cookies.set("user_info", JSON.stringify(safeUserInfo), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.delete("user");

  return response;
}
