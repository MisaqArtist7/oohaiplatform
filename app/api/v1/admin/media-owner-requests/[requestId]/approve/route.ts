import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { approveMediaOwnerApplication } from "@/lib/admin-dashboard-data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const store = await cookies();
    const token = store.get("token")?.value;

    const body = await req.json().catch(() => ({}));

    if (token) {
      const endpoints = [
        process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/admin/media-owner-requests/${requestId}/approve`
          : null,
        `https://oohaiplatform.ir/api/v1/admin/media-owner-requests/${requestId}/approve`,
      ].filter(Boolean) as string[];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            const data = await res.json().catch(() => null);
            return NextResponse.json(
              data || { success: true, message: "درخواست همکاری مالک با موفقیت تایید شد." }
            );
          }
        } catch {
          // try next
        }
      }
    }

    // fallback
    const updated = approveMediaOwnerApplication(requestId);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "درخواست مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: updated,
      message: "درخواست احراز هویت شرکت با موفقیت تایید شد و دسترسی ثبت سازه فعال گردید.",
    });

    const userCookie = store.get("user")?.value;
    if (userCookie) {
      try {
        const currentUser = JSON.parse(userCookie);
        if (
          (updated.phone && currentUser.phone === updated.phone) ||
          (updated.contactPerson && currentUser.name === updated.contactPerson) ||
          (updated.nationalId && currentUser.nationalCode === updated.nationalId)
        ) {
          const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [];
          const roleStrings = roles.map((r: unknown) =>
            typeof r === "string"
              ? r
              : (r as { name?: string; slug?: string })?.name || (r as { name?: string; slug?: string })?.slug
          );
          if (!roleStrings.includes("media-owner")) {
            currentUser.roles = [...roles, "media-owner"];
            response.cookies.set("user", JSON.stringify(currentUser), {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            });
          }
        }
      } catch {}
    }

    return response;
  } catch (err) {
    console.error("Error in approve media owner request:", err);
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در تایید درخواست." },
      { status: 500 }
    );
  }
}
