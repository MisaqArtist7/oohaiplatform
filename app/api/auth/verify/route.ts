import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.phone || !body?.otp) {
    return NextResponse.json(
      { success: false, message: "شماره موبایل و کد تأیید الزامی است." },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API}/otp/verify`, {
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

  // در صورت بروز خطا از سمت بک‌اند (مثلاً ۴۲۲ برای کد اشتباه)
  if (!res.ok || !data?.success) {
    return NextResponse.json(
      data ?? { success: false, message: "تأیید کد با خطا مواجه شد." },
      { status: res.status }
    );
  }

  const token: string | undefined = data?.data?.token;
  const user = data?.data?.user;

  if (!token || !user) {
    return NextResponse.json(
      { success: false, message: "پاسخ سرور فاقد توکن یا اطلاعات کاربر است." },
      { status: 500 }
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ۷ روز
  };

  const response = NextResponse.json({
    success: true,
    message: data.message || "ورود با موفقیت انجام شد.",
    user: {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      phone: user.phone,
      is_active: user.is_active,
      roles: user.roles,
      permissions: user.permissions || [],
    },
  });

  // ذخیره توکن به صورت امن
  response.cookies.set("token", token, cookieOptions);

  // ذخیره آبجکت کاربر جهت خواندن در سرور کامپوننت‌ها بدون نیاز به کوئری مجدد
  response.cookies.set(
    "user",
    JSON.stringify({
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      phone: user.phone,
      roles: user.roles,
      permissions: user.permissions || [],
    }),
    cookieOptions
  );

  return response;
}
