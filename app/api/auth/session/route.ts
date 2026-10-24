import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminMediaOwnerRequestsStore } from "@/lib/admin-dashboard-data";
import { mediaOwnerApplicationsStore } from "@/lib/client-dashboard-data";

export async function GET() {
  const store = await cookies();
  const token = store.get("token")?.value;
  const userCookie = store.get("user")?.value;

  interface SessionUser {
    id?: string | number;
    name?: string;
    phone?: string;
    nationalCode?: string;
    roles?: (string | { name?: string; slug?: string })[];
    permissions?: string[];
  }

  let user: SessionUser | null = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  let cookieUpdated = false;

  // بررسی تاییدیه درخواست مالک رسانه برای کاربر جاری در هر دو مخزن
  if (user) {
    const currentUser = user;
    const hasApprovedMoRequest =
      adminMediaOwnerRequestsStore.some(
        (req) =>
          req.status === "approved" &&
          ((currentUser.phone && req.phone === currentUser.phone) ||
           (currentUser.nationalCode && req.nationalId === currentUser.nationalCode) ||
           (currentUser.name && req.contactPerson === currentUser.name))
      ) ||
      mediaOwnerApplicationsStore.some(
        (req) =>
          req.status === "approved" &&
          ((currentUser.phone && req.phone === currentUser.phone) ||
           (currentUser.nationalCode && req.nationalId === currentUser.nationalCode) ||
           (currentUser.name && req.contactPerson === currentUser.name))
      );

    if (hasApprovedMoRequest) {
      const roles = Array.isArray(user.roles) ? user.roles : [];
      const roleStrings = roles.map((r: unknown) =>
        typeof r === "string"
          ? r
          : (r as { name?: string; slug?: string })?.name || (r as { name?: string; slug?: string })?.slug
      );
      if (!roleStrings.includes("media-owner")) {
        user.roles = [...roles, "media-owner"];
        cookieUpdated = true;
      }
    }
  }

  const response = NextResponse.json({
    authenticated: Boolean(token),
    user,
  });

  if (cookieUpdated && user) {
    response.cookies.set("user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

