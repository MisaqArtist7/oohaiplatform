import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const store = await cookies();
    const token = store.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "احراز هویت انجام نشده است." },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body = await req.json().catch(() => ({}));

    const endpoints = [
      process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/media-owner-requests/${requestId}/approve`
        : null,
      `http://localhost/api/v1/admin/media-owner-requests/${requestId}/approve`,
      `https://oohaiplatform.ir/api/v1/admin/media-owner-requests/${requestId}/approve`,
    ].filter(Boolean) as string[];

    let lastErrorData = null;
    let lastStatus = 500;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          return NextResponse.json(
            data || { success: true, message: "درخواست همکاری مالک با موفقیت تایید شد." }
          );
        }

        lastStatus = res.status;
        lastErrorData = await res.json().catch(() => null);
      } catch {
        // try next endpoint
      }
    }

    return NextResponse.json(
      lastErrorData || { success: false, message: "خطا در تایید درخواست همکاری." },
      { status: lastStatus }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ارتباط با سرور." },
      { status: 500 }
    );
  }
}
