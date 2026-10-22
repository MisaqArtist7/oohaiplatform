import { NextResponse } from "next/server";
import { getMyStructuresList } from "@/lib/mock-data";

export async function GET() {
  try {
    const list = getMyStructuresList();

    return NextResponse.json({
      success: true,
      data: list,
      total: list.length,
      message: "لیست سازه‌های تبلیغاتی تحت مالکیت با موفقیت دریافت گردید.",
    });
  } catch (error) {
    console.error("Error in /api/v1/my-structures:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "خطا در دریافت لیست سازه‌های مالک رسانه." },
      { status: 500 }
    );
  }
}
