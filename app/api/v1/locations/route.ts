import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export interface LocationCity {
  id: number;
  name: string;
  province?: string;
  slug?: string;
}

// لیست پیش‌فرض شهرهای استان‌های ایران جهت پایداری در صورت قطعی شبکه یا خطای سرور
export const defaultLocations: LocationCity[] = [
  { id: 1, name: "تهران", province: "تهران" },
  { id: 2, name: "مشهد", province: "خراسان رضوی" },
  { id: 3, name: "اصفهان", province: "اصفهان" },
  { id: 4, name: "شیراز", province: "فارس" },
  { id: 5, name: "تبریز", province: "آذربایجان شرقی" },
  { id: 6, name: "کرج", province: "البرز" },
  { id: 7, name: "اهواز", province: "خوزستان" },
  { id: 8, name: "قم", province: "قم" },
  { id: 9, name: "رشت", province: "گیلان" },
  { id: 10, name: "کرمانشاه", province: "کرمانشاه" },
  { id: 11, name: "ارومیه", province: "آذربایجان غربی" },
  { id: 12, name: "زاهدان", province: "سیستان و بلوچستان" },
  { id: 13, name: "کرمان", province: "کرمان" },
  { id: 14, name: "همدان", province: "همدان" },
  { id: 15, name: "یزد", province: "یزد" },
  { id: 16, name: "اردبیل", province: "اردبیل" },
  { id: 17, name: "بندرعباس", province: "هرمزگان" },
  { id: 18, name: "اراک", province: "مرکزی" },
  { id: 19, name: "زنجان", province: "زنجان" },
  { id: 20, name: "سنندج", province: "کردستان" },
  { id: 21, name: "قزوین", province: "قزوین" },
  { id: 22, name: "خرم‌آباد", province: "لرستان" },
  { id: 23, name: "ساری", province: "مازندران" },
  { id: 24, name: "بجنورد", province: "خراسان شمالی" },
  { id: 25, name: "بوشهر", province: "بوشهر" },
  { id: 26, name: "بیرجند", province: "خراسان جنوبی" },
  { id: 27, name: "ایلام", province: "ایلام" },
  { id: 28, name: "شهرکرد", province: "چهارمحال و بختیاری" },
  { id: 29, name: "سمنان", province: "سمنان" },
  { id: 30, name: "یاسوج", province: "کهگیلویه و بویراحمد" },
  { id: 31, name: "کیش", province: "هرمزگان" },
];

export async function GET(req: NextRequest) {
  try {
    const store = await cookies();
    const token =
      store.get("token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-auth-token");

    // اگر توکن موجود باشد، درخواست احراز هویت شده به سرور اصلی ارسال می‌گردد
    if (token) {
      const endpoints = [
        `${API}/locations`,
        `https://oohaiplatform.ir/api/v1/locations`,
        `http://localhost/api/v1/locations`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
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
              const raw = Array.isArray(json)
                ? json
                : Array.isArray(json.data)
                ? json.data
                : Array.isArray(json.locations)
                ? json.locations
                : Array.isArray(json.items)
                ? json.items
                : [];

              if (raw.length > 0) {
                const normalized: LocationCity[] = raw
                  .map((item: unknown) => {
                    const record = item as Record<string, unknown>;
                    const id = Number(
                      record?.id ?? record?.city_id ?? record?.location_id ?? 0
                    );
                    const name = String(
                      record?.name ??
                        record?.title ??
                        record?.city_name ??
                        record?.persian_name ??
                        ""
                    ).trim();
                    const province =
                      typeof record?.province === "string"
                        ? record.province
                        : typeof record?.province_name === "string"
                        ? record.province_name
                        : typeof record?.state === "string"
                        ? record.state
                        : undefined;
                    const slug =
                      typeof record?.slug === "string" ? record.slug : undefined;

                    return {
                      id,
                      name: name || `شهر ${id}`,
                      province,
                      slug,
                    };
                  })
                  .filter((c: LocationCity) => c.id > 0 && Boolean(c.name));

                if (normalized.length > 0) {
                  return NextResponse.json({
                    success: true,
                    data: normalized,
                    count: normalized.length,
                    source: "server",
                  });
                }
              }
            }
          }
        } catch {
          // ادامه به اندپوینت بعدی یا فال‌بک در صورت عدم اتصال
        }
      }
    }

    // در صورتی که توکن ارسال نشده باشد یا سرور در دسترس نباشد
    return NextResponse.json({
      success: true,
      data: defaultLocations,
      count: defaultLocations.length,
      source: "fallback",
      message: token ? "داده‌ها از مخزن پشتیبان بارگذاری شد." : "توکن احراز هویت ارائه نشد؛ داده‌های پیش‌فرض نمایش داده شد.",
    });
  } catch (error) {
    console.error("Error in GET /api/v1/locations:", error);
    return NextResponse.json(
      {
        success: true,
        data: defaultLocations,
        count: defaultLocations.length,
        source: "fallback",
        message: "خطا در دریافت اطلاعات شهرها؛ داده‌های پیش‌فرض اعمال شد.",
      },
      { status: 200 }
    );
  }
}
