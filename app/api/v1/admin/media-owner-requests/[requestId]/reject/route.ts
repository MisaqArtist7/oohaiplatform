import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { rejectMediaOwnerApplication } from "@/lib/admin-dashboard-data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const store = await cookies();
    const token = store.get("token")?.value;

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string"
      ? body.reason.trim()
      : (typeof body.rejection_reason === "string" ? body.rejection_reason.trim() : "");

    if (reason.length > 500) {
      return NextResponse.json(
        { success: false, message: "دلیل رد درخواست نمی‌تواند بیش از ۵۰۰ کاراکتر باشد." },
        { status: 422 }
      );
    }

    if (token) {
      const endpoints = [
        process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/admin/media-owner-requests/${requestId}/reject`
          : null,
        `http://localhost/api/v1/admin/media-owner-requests/${requestId}/reject`,
        `https://oohaiplatform.ir/api/v1/admin/media-owner-requests/${requestId}/reject`,
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
            body: JSON.stringify({ reason, rejection_reason: reason }),
          });

          if (res.ok) {
            const data = await res.json().catch(() => null);
            return NextResponse.json(
              data || { success: true, message: "درخواست همکاری مالک با موفقیت رد شد." }
            );
          }
        } catch {
          // try next
        }
      }
    }

    // fallback
    const updated = rejectMediaOwnerApplication(requestId, reason || "عدم تطابق مدارک ثبتی با مستندات قانونی");
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "درخواست مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "درخواست همکاری با موفقیت رد شد و دلیل آن ثبت گردید.",
    });
  } catch (err) {
    console.error("Error in reject media owner request:", err);
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ارتباط با سرور." },
      { status: 500 }
    );
  }
}
