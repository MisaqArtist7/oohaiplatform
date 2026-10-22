import { NextRequest, NextResponse } from "next/server";
import { structuresStore, updateExistingStructure } from "@/lib/mock-data";
import { StructureStatus } from "@/types/structure";

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

    // جستجو بر اساس ID، کد، یا اسلاگ در استور پویا
    const structure = structuresStore.find(
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
    const similarStructures = structuresStore
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

export async function PUT(
  request: NextRequest,
  segmentData: RouteParams
) {
  try {
    const params = await segmentData.params;
    const structureId = params.structureId;

    if (!structureId) {
      return NextResponse.json(
        { success: false, message: "شناسه سازه جهت ویرایش الزامی است." },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let title: string | undefined;
    let code: string | undefined;
    let typeId: string | undefined;
    let categoryId: string | undefined;
    let basePrice: number | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let lat: number | undefined;
    let lng: number | undefined;
    let address: string | undefined;
    let district: string | undefined;
    let description: string | undefined;
    let targetAudience: string[] | undefined;
    let galleryImages: string[] | undefined;
    let status: StructureStatus | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (formData.has("title")) title = String(formData.get("title") || "").trim();
      if (formData.has("code")) code = String(formData.get("code") || "").trim();
      if (formData.has("typeId")) typeId = String(formData.get("typeId") || "");
      if (formData.has("categoryId")) categoryId = String(formData.get("categoryId") || "");
      if (formData.has("basePrice")) basePrice = Number(formData.get("basePrice"));
      if (formData.has("width")) width = Number(formData.get("width"));
      if (formData.has("height")) height = Number(formData.get("height"));
      if (formData.has("lat")) lat = Number(formData.get("lat"));
      if (formData.has("lng")) lng = Number(formData.get("lng"));
      if (formData.has("address")) address = String(formData.get("address") || "").trim();
      if (formData.has("district")) district = String(formData.get("district") || "").trim();
      if (formData.has("description")) description = String(formData.get("description") || "").trim();
      if (formData.has("status")) status = String(formData.get("status") || "") as StructureStatus;

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
          galleryImages = undefined;
        }
      }
    } else {
      const json = await request.json().catch(() => ({}));
      if (json.title !== undefined) title = String(json.title).trim();
      if (json.code !== undefined) code = String(json.code).trim();
      if (json.typeId !== undefined) typeId = String(json.typeId);
      if (json.categoryId !== undefined) categoryId = String(json.categoryId);
      if (json.basePrice !== undefined) basePrice = Number(json.basePrice);
      if (json.width !== undefined) width = Number(json.width);
      if (json.height !== undefined) height = Number(json.height);
      if (json.lat !== undefined) lat = Number(json.lat);
      if (json.lng !== undefined) lng = Number(json.lng);
      if (json.address !== undefined) address = String(json.address).trim();
      if (json.district !== undefined) district = String(json.district).trim();
      if (json.description !== undefined) description = String(json.description).trim();
      if (Array.isArray(json.targetAudience)) targetAudience = json.targetAudience;
      if (Array.isArray(json.galleryImages)) galleryImages = json.galleryImages;
      if (json.status !== undefined) status = json.status;
    }

    const updated = updateExistingStructure(structureId, {
      title,
      code,
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

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "سازه تبلیغاتی جهت ویرایش یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "مشخصات سازه تبلیغاتی با موفقیت ویرایش و بروزرسانی گردید.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating structure:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی اطلاعات سازه." },
      { status: 500 }
    );
  }
}
