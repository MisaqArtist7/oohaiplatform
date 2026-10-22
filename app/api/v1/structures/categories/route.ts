import { NextResponse } from "next/server";
import { mockStructureCategories } from "@/lib/mock-data";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockStructureCategories,
      total: mockStructureCategories.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لیست دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}
