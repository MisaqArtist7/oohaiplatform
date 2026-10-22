import { NextRequest, NextResponse } from "next/server";
import { mockStructures } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{
    structureId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  segmentData: RouteParams
) {
  try {
    const params = await segmentData.params;
    const structureId = params.structureId;

    if (!structureId) {
      return NextResponse.json(
        { success: false, message: "شناسه سازه الزامی است" },
        { status: 400 }
      );
    }

    // جستجو بر اساس ID، کد، یا اسلاگ
    const structure = mockStructures.find(
      (item) =>
        item.id.toLowerCase() === structureId.toLowerCase() ||
        item.code.toLowerCase() === structureId.toLowerCase() ||
        item.slug.toLowerCase() === structureId.toLowerCase()
    );

    if (!structure) {
      return NextResponse.json(
        { success: false, message: "سازه تبلیغاتی مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // پیشنهاد سازه‌های مشابه در همان دسته‌بندی یا منطقه
    const similarStructures = mockStructures
      .filter(
        (item) =>
          item.id !== structure.id &&
          (item.category.id === structure.category.id || item.type.id === structure.type.id)
      )
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: structure,
      similar: similarStructures,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت جزئیات سازه" },
      { status: 500 }
    );
  }
}
