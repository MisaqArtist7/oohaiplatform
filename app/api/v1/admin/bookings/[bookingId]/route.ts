import { NextRequest, NextResponse } from "next/server";
import { adminBookingsStore } from "@/lib/admin-dashboard-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const booking = adminBookingsStore.find(
      (b) => b.id === bookingId || b.trackingCode === bookingId
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "رزرو مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("Error in GET /api/v1/admin/bookings/[bookingId]:", err);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات رزرو" },
      { status: 500 }
    );
  }
}
