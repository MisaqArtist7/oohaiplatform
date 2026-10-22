import { NextRequest, NextResponse } from "next/server";
import { lockAdminBooking } from "@/lib/admin-dashboard-data";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const updated = lockAdminBooking(bookingId);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "رزرو مورد نظر یافت نشد یا قابل قفل کردن نیست" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "تایید اولیه صادر شد و سازه به مدت ۴۸ ساعت برای مشتری قفل گردید.",
    });
  } catch (err) {
    console.error("Error in lock route:", err);
    return NextResponse.json(
      { success: false, message: "خطا در قفل کردن سازه" },
      { status: 500 }
    );
  }
}
