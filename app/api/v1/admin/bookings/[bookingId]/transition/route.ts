import { NextRequest, NextResponse } from "next/server";
import { transitionAdminBookingStatus } from "@/lib/admin-dashboard-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, statusLabel, note } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { success: false, message: "وضعیت جدید رزرو الزامی است" },
        { status: 400 }
      );
    }

    const updated = transitionAdminBookingStatus(
      bookingId,
      status,
      statusLabel,
      note
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "رزرو مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `وضعیت رزرو با موفقیت به «${updated.status.label}» تغییر داده شد.`,
    });
  } catch (err) {
    console.error("Error in transition route:", err);
    return NextResponse.json(
      { success: false, message: "خطا در تغییر وضعیت رزرو" },
      { status: 500 }
    );
  }
}
