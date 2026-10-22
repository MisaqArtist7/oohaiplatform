import { NextRequest, NextResponse } from "next/server";
import { mockStructures } from "@/lib/mock-data";
import { Structure } from "@/types/structure";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const type = searchParams.get("type") || searchParams.get("typeId") || "";
    const category = searchParams.get("category") || searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const sortBy = searchParams.get("sortBy") || "recommended";

    let results: Structure[] = [...mockStructures];

    // ۱. فیلتر جستجوی متنی
    if (search) {
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.code.toLowerCase().includes(search) ||
          item.location.address.toLowerCase().includes(search) ||
          item.location.district.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      );
    }

    // ۲. فیلتر نوع سازه
    if (type && type !== "all") {
      results = results.filter(
        (item) => item.type.id === type || item.type.slug === type
      );
    }

    // ۳. فیلتر دسته‌بندی
    if (category && category !== "all") {
      results = results.filter(
        (item) => item.category.id === category || item.category.slug === category
      );
    }

    // ۴. فیلتر وضعیت
    if (status && status !== "all") {
      results = results.filter((item) => item.status === status);
    }

    // ۵. فیلتر محدوده قیمت
    if (minPrice !== null && !isNaN(minPrice)) {
      results = results.filter((item) => item.pricing.basePriceMonthly >= minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      results = results.filter((item) => item.pricing.basePriceMonthly <= maxPrice);
    }

    // ۶. مرتب‌سازی
    switch (sortBy) {
      case "price_asc":
        results.sort((a, b) => a.pricing.basePriceMonthly - b.pricing.basePriceMonthly);
        break;
      case "price_desc":
        results.sort((a, b) => b.pricing.basePriceMonthly - a.pricing.basePriceMonthly);
        break;
      case "visibility":
        results.sort((a, b) => b.specs.visibilityScore - a.specs.visibilityScore);
        break;
      case "newest":
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "recommended":
      default:
        // اولویت بر اساس امتیاز دید و سپس در دسترس بودن
        results.sort((a, b) => {
          if (a.status === "available" && b.status !== "available") return -1;
          if (a.status !== "available" && b.status === "available") return 1;
          return b.specs.visibilityScore - a.specs.visibilityScore;
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      filtersApplied: {
        search,
        type,
        category,
        status,
        minPrice,
        maxPrice,
        sortBy,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در پردازش لیست سازه‌ها" },
      { status: 500 }
    );
  }
}
