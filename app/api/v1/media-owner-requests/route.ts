import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

function toEnDigits(input: string): string {
  if (!input) return "";
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const store = await cookies();
    const token = store.get("token")?.value;

    const contentType = req.headers.get("content-type") || "";

    let companyName = "";
    let nationalId = "";
    let documentsCount = 0;
    let forwardBody: BodyInit;
    const forwardHeaders: Record<string, string> = {
      Accept: "application/json",
    };

    if (token) {
      forwardHeaders["Authorization"] = `Bearer ${token}`;
    }

    if (contentType.includes("multipart/form-data")) {
      const incomingFormData = await req.formData();
      companyName = String(
        incomingFormData.get("company_name") ||
        incomingFormData.get("companyName") ||
        ""
      ).trim();

      nationalId = toEnDigits(
        String(
          incomingFormData.get("national_id") ||
          incomingFormData.get("nationalId") ||
          ""
        )
      ).trim();

      const files = incomingFormData
        .getAll("documents[]")
        .concat(incomingFormData.getAll("documents"));

      documentsCount = files.filter((f) => f instanceof File && f.size > 0).length;

      // ۱. اعتبارسنجی نام کمپانی (string، حداکثر ۲۵۵ کاراکتر)
      if (!companyName) {
        return NextResponse.json(
          { success: false, message: "نام کمپانی الزامی است." },
          { status: 422 }
        );
      }
      if (companyName.length > 255) {
        return NextResponse.json(
          { success: false, message: "نام کمپانی نمی‌تواند بیش از ۲۵۵ کاراکتر باشد." },
          { status: 422 }
        );
      }

      // ۲. اعتبارسنجی شماره ملی (حداکثر ۱۰ رقم)
      if (!nationalId) {
        return NextResponse.json(
          { success: false, message: "شماره ملی / شناسه الزامی است." },
          { status: 422 }
        );
      }
      if (nationalId.length > 10 || !/^\d+$/.test(nationalId)) {
        return NextResponse.json(
          { success: false, message: "شماره ملی نمی‌تواند بیشتر از ۱۰ رقم باشد و فقط شامل اعداد است." },
          { status: 422 }
        );
      }

      // ۳. اعتبارسنجی داکیومنت‌ها (حداکثر ۵ مورد)
      if (documentsCount > 5) {
        return NextResponse.json(
          { success: false, message: "تعداد اسناد و داکیومنت‌ها نمی‌تواند بیشتر از ۵ فایل باشد." },
          { status: 422 }
        );
      }

      forwardBody = incomingFormData;
    } else {
      const json = await req.json().catch(() => null);
      if (!json) {
        return NextResponse.json(
          { success: false, message: "داده‌های ارسالی نامعتبر است." },
          { status: 400 }
        );
      }

      companyName = String(json.company_name || json.companyName || "").trim();
      nationalId = toEnDigits(String(json.national_id || json.nationalId || "")).trim();
      const docs = Array.isArray(json.documents) ? json.documents : [];
      documentsCount = docs.length;

      if (!companyName) {
        return NextResponse.json(
          { success: false, message: "نام کمپانی الزامی است." },
          { status: 422 }
        );
      }
      if (companyName.length > 255) {
        return NextResponse.json(
          { success: false, message: "نام کمپانی نمی‌تواند بیش از ۲۵۵ کاراکتر باشد." },
          { status: 422 }
        );
      }

      if (!nationalId || nationalId.length > 10 || !/^\d+$/.test(nationalId)) {
        return NextResponse.json(
          { success: false, message: "شماره ملی نمی‌تواند بیشتر از ۱۰ رقم باشد." },
          { status: 422 }
        );
      }

      if (documentsCount > 5) {
        return NextResponse.json(
          { success: false, message: "تعداد اسناد و مدارک نمی‌تواند بیشتر از ۵ آیتم باشد." },
          { status: 422 }
        );
      }

      forwardHeaders["Content-Type"] = "application/json";
      forwardBody = JSON.stringify({
        company_name: companyName,
        national_id: nationalId,
        documents: docs,
      });
    }

    const res = await fetch(`${API}/media-owner-requests`, {
      method: "POST",
      headers: forwardHeaders,
      body: forwardBody,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { success: false, message: "خطا در برقراری ارتباط با سرور." },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای ناشناخته در ثبت درخواست همکاری مالکان." },
      { status: 500 }
    );
  }
}
