import { NextRequest, NextResponse } from "next/server";
import { approveAdminPayment } from "@/lib/admin-dashboard-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const { approvalNote } = body;

    const updated = approveAdminPayment(bookingId, approvalNote);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "رزرو مورد نظر یافت نشد یا وضعیت مناسب تایید مالی ندارد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "تاییدیه مالی صادر و مجوز نهایی اکران با موفقیت ثبت گردید.",
    });
  } catch (err) {
    console.error("Error in approve payment route:", err);
    return NextResponse.json(
      { success: false, message: "خطا در تایید مالی رزرو" },
      { status: 500 }
    );
  }
}
