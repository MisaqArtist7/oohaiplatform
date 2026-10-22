import { NextRequest, NextResponse } from "next/server";
import { clientBookingsStore } from "@/lib/client-dashboard-data";

interface RouteParams {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  segmentData: RouteParams
) {
  try {
    const params = await segmentData.params;
    const bookingId = params.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "شناسه رزرو الزامی است" },
        { status: 400 }
      );
    }

    const booking = clientBookingsStore.find(
      (b) =>
        b.id.toLowerCase() === bookingId.toLowerCase() ||
        b.trackingCode.toLowerCase() === bookingId.toLowerCase()
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
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت جزئیات رزرو" },
      { status: 500 }
    );
  }
}
