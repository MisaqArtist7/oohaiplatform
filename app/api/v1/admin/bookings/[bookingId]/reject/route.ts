import { NextRequest, NextResponse } from "next/server";
import { rejectAdminBooking } from "@/lib/admin-dashboard-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "ذکر علت رد درخواست الزامی می‌باشد." },
        { status: 400 }
      );
    }

    const updated = rejectAdminBooking(bookingId, reason.trim());

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "رزرو مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "درخواست رزرو رد شد و علت رد در کارتابل و تاریخچه رزرو ثبت گردید.",
    });
  } catch (err) {
    console.error("Error in reject booking route:", err);
    return NextResponse.json(
      { success: false, message: "خطا در رد درخواست رزرو" },
      { status: 500 }
    );
  }
}
