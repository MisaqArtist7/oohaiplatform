import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    documentId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  segmentData: RouteParams
) {
  try {
    const params = await segmentData.params;
    const documentId = params.documentId;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const token = `sec_tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // ۱۵ دقیقه اعتبار

    if (format === "file") {
      // شبیه‌سازی محتوای متنی پیش‌فاکتور رسمی به صورت دانلود فایل
      const proformaText = `
=====================================================
         پلتفرم هوشمند رزرواسیون تبلیغات محیطی OOHAI
                 پیش‌فاکتور رسمی الکترونیک
=====================================================
شناسه سند: ${documentId}
توکن امنیتی اعتبارسنجی: ${token}
مهلت اعتبار لینک: ۱۵ دقیقه (انقضا در: ${expiresAt})
وضعیت: معتبر و دارای تاییدیه مالیاتی

مشخصات خریدار / برند: حقوقی معتبر
سامانه رزرواسیون آنلاین: https://oohaiplatform.ir
پشتیبانی فروش و صدور قرارداد: ۰۲۱-۸۸۰۰۰۰۰۰
=====================================================
      `.trim();

      return new NextResponse(proformaText, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream; charset=utf-8",
          "Content-Disposition": `attachment; filename="${documentId}-proforma.txt"`,
          "X-Secure-Token": token,
          "X-Token-Expires": expiresAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      documentId,
      fileName: `${documentId}-official-proforma.pdf`,
      downloadUrl: `/api/v1/client/bookings/documents/${documentId}/download?format=file&token=${token}`,
      secureToken: token,
      expiresAt,
      expiresInSeconds: 900, // ۱۵ دقیقه
      message: "لینک دانلود امن ۱۵ دقیقه‌ای با موفقیت تولید شد.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در تولید لینک دانلود امن سند" },
      { status: 500 }
    );
  }
}
