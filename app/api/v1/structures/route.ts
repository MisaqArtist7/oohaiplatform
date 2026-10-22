import { NextRequest, NextResponse } from "next/server";
import { structuresStore, addNewStructure } from "@/lib/mock-data";
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

    let results: Structure[] = [...structuresStore];

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

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let code = "";
    let typeId = "billboard";
    let categoryId = "highway";
    let basePrice = 150000000;
    let width = 12;
    let height = 4;
    let lat = 35.7385;
    let lng = 51.4112;
    let address = "";
    let district = "";
    let description = "";
    let targetAudience: string[] | undefined = undefined;
    let galleryImages: string[] | undefined = undefined;
    let status: Structure["status"] = "available";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = String(formData.get("title") || "").trim();
      code = String(formData.get("code") || "").trim();
      typeId = String(formData.get("typeId") || formData.get("type") || "billboard");
      categoryId = String(formData.get("categoryId") || formData.get("category") || "highway");
      basePrice = Number(formData.get("basePrice") || formData.get("basePriceMonthly") || 150000000);
      width = Number(formData.get("width") || 12);
      height = Number(formData.get("height") || 4);
      lat = Number(formData.get("lat") || 35.7385);
      lng = Number(formData.get("lng") || 51.4112);
      address = String(formData.get("address") || "").trim();
      district = String(formData.get("district") || "").trim();
      description = String(formData.get("description") || "").trim();
      
      const audienceRaw = formData.get("targetAudience");
      if (audienceRaw) {
        try {
          targetAudience = JSON.parse(String(audienceRaw));
        } catch {
          targetAudience = String(audienceRaw).split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      const imagesRaw = formData.get("galleryImages");
      if (imagesRaw) {
        try {
          galleryImages = JSON.parse(String(imagesRaw));
        } catch {
          galleryImages = [];
        }
      }
    } else {
      const json = await request.json().catch(() => ({}));
      title = String(json.title || "").trim();
      code = String(json.code || "").trim();
      typeId = String(json.typeId || json.type || "billboard");
      categoryId = String(json.categoryId || json.category || "highway");
      basePrice = Number(json.basePrice || json.pricing?.basePriceMonthly || 150000000);
      width = Number(json.width || json.dimensions?.width || 12);
      height = Number(json.height || json.dimensions?.height || 4);
      lat = Number(json.lat || json.location?.lat || 35.7385);
      lng = Number(json.lng || json.location?.lng || 51.4112);
      address = String(json.address || json.location?.address || "").trim();
      district = String(json.district || json.location?.district || "").trim();
      description = String(json.description || "").trim();
      if (Array.isArray(json.targetAudience)) targetAudience = json.targetAudience;
      if (Array.isArray(json.galleryImages)) galleryImages = json.galleryImages;
      if (json.status) status = json.status;
    }

    if (!title) {
      return NextResponse.json(
        { success: false, message: "عنوان یا نام سازه تبلیغاتی الزامی است." },
        { status: 422 }
      );
    }

    const created = addNewStructure({
      title,
      code: code || undefined,
      typeId,
      categoryId,
      basePrice,
      width,
      height,
      lat,
      lng,
      address,
      district,
      description,
      targetAudience,
      galleryImages,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: "سازه تبلیغاتی با موفقیت در سامانه ثبت گردید.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating structure:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت سازه تبلیغاتی جدید." },
      { status: 500 }
    );
  }
}

