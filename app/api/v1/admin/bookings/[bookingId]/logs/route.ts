import { NextRequest, NextResponse } from "next/server";
import { adminAuditLogsStore, adminBookingsStore } from "@/lib/admin-dashboard-data";

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

    const logs = adminAuditLogsStore.filter(
      (l) => l.bookingId === booking.id
    );

    return NextResponse.json({
      success: true,
      data: logs,
      timeline: booking.timeline,
      total: logs.length,
    });
  } catch (err) {
    console.error("Error in GET logs route:", err);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لاگ‌های بازرسی رزرو" },
      { status: 500 }
    );
  }
}
