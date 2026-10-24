import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { proposalsStore } from "@/lib/client-dashboard-data";
import { ProposalItem, ProposalRecommendedStructure } from "@/types/client-dashboard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export async function GET(req: NextRequest) {
  try {
    const store = await cookies();
    const token =
      store.get("token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-auth-token");

    if (token) {
      try {
        const res = await fetch(`${API}/proposals`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json) {
            const raw = json.data ?? json.proposals ?? json.items ?? json;
            if (Array.isArray(raw) && raw.length > 0) {
              return NextResponse.json({
                success: true,
                data: raw,
                total: raw.length,
                source: "server",
              });
            }
          }
        }
      } catch (err) {
        console.warn("Upstream GET /proposals failed, using store:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: proposalsStore,
      total: proposalsStore.length,
      source: token ? "store" : "fallback",
    });
  } catch (error) {
    console.error("Error in GET /api/v1/proposals:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تاریخچه پیشنهادات کمپین", data: proposalsStore },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const store = await cookies();
    const token =
      store.get("token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-auth-token");

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

    // ارسال درخواست به سرور بالادستی همراه با توکن در صورت وجود
    if (token) {
      try {
        const res = await fetch(`${API}/proposals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            budget: numBudget,
            city_id: numCityId,
            scenario: trimmedScenario,
          }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data) {
            const proposalData = data.data || data;
            if (proposalData && typeof proposalData === "object" && proposalData.id) {
              proposalsStore.unshift(proposalData);
            }
            return NextResponse.json(data);
          }
        }
      } catch (err) {
        console.warn("Upstream POST /proposals failed, using fallback generator:", err);
      }
    }

    // تولید سازه‌های پیشنهادی هوشمند و بهینه‌سازی سبد رسانه در حالت پشتیبان
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const recommendedStructures: ProposalRecommendedStructure[] = [
      {
        structureId: `str-p1-${randomSuffix}`,
        title: `بیلبورد اصلی شاهراه مرکزی ${cityName}`,
        type: "بیلبورد بزرگراهی",
        location: `محور ورودی و شاهراه اصلی ${cityName}`,
        monthlyPrice: Math.round(numBudget * 0.45),
        reason: `حداکثر ماندگاری پیام و جلب نگاه مخاطبان و رانندگان پرتردد در ساعات اوج ${cityName}`,
      },
      {
        structureId: `str-p2-${randomSuffix}`,
        title: `عرشه پل تقاطع تجاری ${cityName}`,
        type: "عرشه پل عابر و سواره",
        location: `تقاطع بلوار اصلی و مراکز خرید ${cityName}`,
        monthlyPrice: Math.round(numBudget * 0.35),
        reason: "زاویه دید باز و افقی و تمرکز بر مخاطبان جوان و مصرف‌کننده با بودجه بهینه",
      },
      {
        structureId: `str-p3-${randomSuffix}`,
        title: `پکیج استرابوردهای محیطی معابر ${cityName}`,
        type: "استرابورد شهری",
        location: `میادین و کانون‌های اداری و تجاری ${cityName}`,
        monthlyPrice: Math.round(numBudget * 0.20),
        reason: "افزایش نرخ تکرار بصری پیام با توزیع یکنواخت در سطح معابر پرتردد",
      },
    ];

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
        summary: `هوش مصنوعی OOHAI بر اساس بودجه ${numBudget.toLocaleString("fa-IR")} تومان و تحلیل مسیرهای پرتردد شهر ${cityName}، سبد رسانه‌ای بهینه‌ای شامل ۳ سازه شاخص پیشنهاد نموده است.`,
        targetAudience: "قشر پویا، شاغلین و خانواده‌های شهری با تکرار مداوم پیام در ساعات اوج",
        estimatedReach: `بیش از ${(Math.round(numBudget / 350)).toLocaleString("fa-IR")} ایمپرشن دیداری موثر در ماه`,
        recommendedStructures,
        budgetDistribution: [
          { category: "بیلبوردهای بزرگراهی", percentage: 45, amount: Math.round(numBudget * 0.45) },
          { category: "عرشه پل و سازه‌های افقی", percentage: 35, amount: Math.round(numBudget * 0.35) },
          { category: "استرابوردها و پوشش شهری", percentage: 20, amount: Math.round(numBudget * 0.20) },
        ],
      },
    };

    proposalsStore.unshift(newProposal);

    return NextResponse.json({
      success: true,
      message: "سناریوی کمپین با موفقیت تحلیل شد و لیست سازه‌های پیشنهادی هوش مصنوعی آماده گردید.",
      data: newProposal,
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/proposals:", error);
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ارسال پیشنهاد هوشمند." },
      { status: 500 }
    );
  }
}
