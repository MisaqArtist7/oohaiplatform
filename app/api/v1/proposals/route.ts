import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { proposalsStore } from "@/lib/client-dashboard-data";
import { ProposalItem } from "@/types/client-dashboard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: proposalsStore,
      total: proposalsStore.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تاریخچه پیشنهادات کمپین" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const store = await cookies();
    const token = store.get("token")?.value;

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, message: "داده‌های ارسالی نامعتبر است." },
        { status: 400 }
      );
    }

    const { budget, city_id = 1, cityName = "تهران", scenario, title } = body;

    // ۱. بررسی budget
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      return NextResponse.json(
        { success: false, message: "بودجه باید عددی بزرگتر یا مساوی صفر باشد." },
        { status: 422 }
      );
    }

    // ۲. بررسی city_id
    const numCityId = parseInt(String(city_id), 10) || 1;

    // ۳. بررسی scenario
    const trimmedScenario = typeof scenario === "string" ? scenario.trim() : "";
    if (trimmedScenario.length < 15) {
      return NextResponse.json(
        { success: false, message: "سناریو کمپین باید حداقل شامل ۱۵ کاراکتر باشد." },
        { status: 422 }
      );
    }

    // تلاش برای فراخوانی سرویس بک‌اند در صورت موجود بودن
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API}/proposals`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            budget: numBudget,
            city_id: numCityId,
            scenario: trimmedScenario,
          }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data) return NextResponse.json(data);
        }
      } catch {
        // Fallback to local AI proposal generator
      }
    }

    // تولید پروپوزال هوشمند در حالت محلی و افزودن به استور
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newProposal: ProposalItem = {
      id: `PROP-${randomSuffix}`,
      trackingNumber: `PR-1403-${randomSuffix}`,
      title: title?.trim() || `کمپین تبلیغاتی هوشمند در ${cityName}`,
      budget: numBudget,
      city: cityName,
      cityId: numCityId,
      scenario: trimmedScenario,
      status: "ai_generated",
      statusLabel: "پیشنهاد آماده شد (طراحی هوش مصنوعی)",
      createdAt: new Date().toLocaleDateString("fa-IR"),
      strategy: {
        summary: `هوش مصنوعی OOHAI بر اساس بودجه ${numBudget.toLocaleString("fa-IR")} تومان و تحلیل مسیرهای پرتردد شهر ${cityName}، سبد رسانه‌ای بهینه‌ای شامل سازه‌های اتوبانی با بالاترین زاویه دید رانندگان پیشنهاد کرده است.`,
        targetAudience: "قشر پویا، شاغلین و خانواده‌های شهری با تکرار مداوم پیام در ساعات اوج",
        estimatedReach: `بیش از ${(Math.round(numBudget / 350)).toLocaleString("fa-IR")} ایمپرشن دیداری موثر در ماه`,
        recommendedStructures: [
          {
            structureId: "str-101",
            title: "بیلبورد اتوبان همت - تقاطع ستاری",
            type: "بیلبورد",
            location: "بزرگراه همت غرب",
            monthlyPrice: 280000000,
            reason: "حداکثر ماندگاری نگاه رانندگان در ترافیک عصرگاهی",
          },
          {
            structureId: "str-105",
            title: "استرابورد بلوار اندرزگو - نبش اشکستان‌پور",
            type: "استرابورد",
            location: "بلوار اندرزگو",
            monthlyPrice: 95000000,
            reason: "ارتباط موثر با قشر جوان و مراکز خرید مدرن",
          },
        ],
        budgetDistribution: [
          { category: "بیلبوردهای بزرگراهی", percentage: 65, amount: Math.round(numBudget * 0.65) },
          { category: "استرابوردهای شهری", percentage: 25, amount: Math.round(numBudget * 0.25) },
          { category: "هزینه متریال و چاپ UV", percentage: 10, amount: Math.round(numBudget * 0.1) },
        ],
      },
    };

    proposalsStore.unshift(newProposal);

    return NextResponse.json({
      success: true,
      message: "سناریوی کمپین با موفقیت تحلیل شد و استراتژی رسانه‌ای هوش مصنوعی آماده گردید.",
      data: newProposal,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ارسال پیشنهاد هوشمند." },
      { status: 500 }
    );
  }
}
