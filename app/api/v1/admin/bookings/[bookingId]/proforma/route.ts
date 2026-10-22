import { NextRequest, NextResponse } from "next/server";
import { issueAdminProforma } from "@/lib/admin-dashboard-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const { invoiceNumber, amount, fileUrl } = body;

    if (!invoiceNumber || typeof invoiceNumber !== "string") {
      return NextResponse.json(
        { success: false, message: "شماره پیش‌فاکتور الزامی است" },
        { status: 400 }
      );
    }

    const updated = issueAdminProforma(
      bookingId,
      invoiceNumber,
      Number(amount) || 0,
      fileUrl
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
      message: "پیش‌فاکتور رسمی سامانه صادر و به کارتابل مشتری ارسال شد.",
    });
  } catch (err) {
    console.error("Error in proforma route:", err);
    return NextResponse.json(
      { success: false, message: "خطا در صدور پیش‌فاکتور" },
      { status: 500 }
    );
  }
}
