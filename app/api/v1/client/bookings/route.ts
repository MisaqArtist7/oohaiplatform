import { NextRequest, NextResponse } from "next/server";
import { mockStructures, mockBookingsStore } from "@/lib/mock-data";
import { BookingRequestInput, BookingResponse } from "@/types/structure";
import { clientBookingsStore } from "@/lib/client-dashboard-data";
import { ClientBooking } from "@/types/client-dashboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    let items = [...clientBookingsStore];

    if (status && status !== "all") {
      items = items.filter((b) => b.status.value === status);
    }

    if (search) {
      items = items.filter(
        (b) =>
          b.trackingCode.toLowerCase().includes(search) ||
          b.structure.title.toLowerCase().includes(search) ||
          b.structure.code.toLowerCase().includes(search) ||
          b.brandName.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
      counts: {
        all: clientBookingsStore.length,
        pending_review: clientBookingsStore.filter((b) => b.status.value === "pending_review").length,
        awaiting_payment: clientBookingsStore.filter((b) => b.status.value === "awaiting_payment").length,
        active: clientBookingsStore.filter((b) => b.status.value === "active").length,
        cancelled: clientBookingsStore.filter((b) => b.status.value === "cancelled").length,
        completed: clientBookingsStore.filter((b) => b.status.value === "completed").length,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لیست رزروهای مشتری" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestInput = await request.json();

    const {
      structureId,
      startDate,
      endDate,
      durationDays = 30,
      fullName,
      phone,
      brandName,
      notes,
    } = body;

    // اعتبارسنجی فیلدهای اجباری
    if (!structureId) {
      return NextResponse.json(
        { success: false, message: "شناسه سازه الزامی است" },
        { status: 400 }
      );
    }

    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "لطفاً نام و نام خانوادگی معتبر وارد نمایید" },
        { status: 400 }
      );
    }

    if (!phone || !/^09[0-9]{9}$/.test(phone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        {
          success: false,
          message: "شماره موبایل وارد شده معتبر نمی‌باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹)",
        },
        { status: 400 }
      );
    }

    if (!brandName || brandName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "لطفاً نام برند یا شرکت را وارد نمایید" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "تاریخ شروع و پایان اکران الزامی است" },
        { status: 400 }
      );
    }

    // بررسی وجود سازه
    const structure = mockStructures.find(
      (item) => item.id === structureId || item.code === structureId
    );

    if (!structure) {
      return NextResponse.json(
        { success: false, message: "سازه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // محاسبه قیمت بر اساس روزها
    const effectiveDays = Math.max(durationDays || 30, structure.specs.minDurationDays || 15);
    const totalPrice = body.estimatedPrice || (effectiveDays * structure.pricing.dailyRate);

    // تولید کد رهگیری منحصر‌به‌فرد
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `BM-${structure.code.split("-")[1] || "STR"}-${randomSuffix}`;
    const bookingId = `BK-${randomSuffix}`;

    const newBooking = {
      id: bookingId,
      trackingCode,
      structureId: structure.id,
      startDate,
      endDate,
      durationDays: effectiveDays,
      fullName: fullName.trim(),
      phone: phone.trim(),
      brandName: brandName.trim(),
      notes: notes?.trim() || "",
      totalPrice,
      status: "pending_review" as const,
      createdAt: new Date().toISOString(),
    };

    mockBookingsStore.unshift(newBooking);

    // افزودن به لیست رزروهای کلاینت برای نمایش فوری در پنل
    const newClientBooking: ClientBooking = {
      id: bookingId,
      trackingCode,
      structure: {
        id: structure.id,
        code: structure.code,
        title: structure.title,
        address: structure.location.address,
        district: structure.location.district,
        dimensions: structure.dimensions.label,
        image: structure.images.day,
        type: structure.type.name,
        category: structure.category.name,
      },
      startDate,
      endDate,
      durationDays: effectiveDays,
      totalPrice,
      status: {
        value: "pending_review",
        label: "در انتظار تایید اولیه",
        color: "amber",
      },
      brandName: brandName.trim(),
      contactPerson: fullName.trim(),
      contactPhone: phone.trim(),
      createdAt: "امروز - هم اکنون",
      proforma: {
        id: `DOC-PF-${randomSuffix}`,
        number: `PF-1403-${randomSuffix}`,
        issueDate: "هم اکنون",
        expiresAt: "۴۸ ساعت آینده",
        amount: totalPrice,
        downloadUrl: `/api/v1/client/bookings/documents/DOC-PF-${randomSuffix}/download`,
      },
      timeline: [
        {
          id: `log-${Date.now()}`,
          title: "ثبت اولیه درخواست رزرو در سامانه",
          description: `درخواست اکران برای برند ${brandName.trim()} با موفقیت دریافت شد.`,
          timestamp: "هم اکنون",
          actor: fullName.trim(),
          status: "pending_review",
          isDone: true,
          isCurrent: true,
        },
      ],
      payments: [],
      documents: [
        {
          id: `DOC-PF-${randomSuffix}`,
          title: `پیش‌فاکتور اولیه سازه ${structure.code}`,
          type: "proforma",
          typeLabel: "پیش‌فاکتور",
          date: "هم اکنون",
          fileSize: "۱.۲ مگابایت (PDF)",
          downloadUrl: `/api/v1/client/bookings/documents/DOC-PF-${randomSuffix}/download`,
        },
      ],
    };

    clientBookingsStore.unshift(newClientBooking);

    const responseData: BookingResponse = {
      success: true,
      trackingCode,
      bookingId,
      message: "درخواست رزرو اولیه با موفقیت ثبت شد. کارشناسان ما ظرف ۲ ساعت آینده جهت هماهنگی تماس خواهند گرفت.",
      bookingDetails: {
        structureId: structure.id,
        structureTitle: structure.title,
        structureCode: structure.code,
        startDate,
        endDate,
        durationDays: effectiveDays,
        fullName: fullName.trim(),
        phone: phone.trim(),
        brandName: brandName.trim(),
        notes: notes?.trim() || "",
        totalPrice,
        status: "pending_review",
        createdAt: newBooking.createdAt,
      },
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای سیستمی در ثبت درخواست رزرو" },
      { status: 500 }
    );
  }
}
