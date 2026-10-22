import { NextResponse } from "next/server";
import { mockStructureTypes } from "@/lib/mock-data";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockStructureTypes,
      total: mockStructureTypes.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لیست انواع سازه‌ها" },
      { status: 500 }
    );
  }
}
