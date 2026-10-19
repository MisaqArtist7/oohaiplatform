import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

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

    const { budget, city_id, scenario } = body;

    // ۱. بررسی budget
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      return NextResponse.json(
        { success: false, message: "بودجه باید عددی بزرگتر یا مساوی صفر باشد." },
        { status: 422 }
      );
    }

    // ۲. بررسی city_id
    const numCityId = parseInt(String(city_id), 10);
    if (isNaN(numCityId) || numCityId <= 0) {
      return NextResponse.json(
        { success: false, message: "شناسه شهر نامعتبر است." },
        { status: 422 }
      );
    }

    // ۳. بررسی scenario
    const trimmedScenario = typeof scenario === "string" ? scenario.trim() : "";
    if (trimmedScenario.length < 20) {
      return NextResponse.json(
        { success: false, message: "سناریو کمپین باید حداقل شامل ۲۰ کاراکتر باشد." },
        { status: 422 }
      );
    }

    if (trimmedScenario.length > 5000) {
      return NextResponse.json(
        { success: false, message: "سناریو کمپین نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد." },
        { status: 422 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API}/proposals`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        budget: numBudget,
        city_id: numCityId,
        scenario: trimmedScenario,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { success: false, message: "خطا در برقراری ارتباط با سرویس پیشنهاد هوشمند." },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ارسال پیشنهاد هوشمند." },
      { status: 500 }
    );
  }
}
