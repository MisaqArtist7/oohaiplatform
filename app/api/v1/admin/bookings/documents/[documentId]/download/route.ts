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

    const token = `admin_sec_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    if (format === "file") {
      const documentContent = `
=====================================================
         سامانه مدیریت و مالی پلتفرم OOHAI
             سند مالی / پیش‌فاکتور / فیش واریزی
=====================================================
شناسه سند بازرسی: ${documentId}
توکن امنیتی دانلود مدیریت: ${token}
مهلت اعتبار دانلود: ۳۰ دقیقه (انقضا در: ${expiresAt})
دسترسی: تایید شده توسط مدیر ارشد مالی و سیستم
پلتفرم هوشمند رزرواسیون: https://oohaiplatform.ir
=====================================================
      `.trim();

      return new NextResponse(documentContent, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream; charset=utf-8",
          "Content-Disposition": `attachment; filename="${documentId}-admin-document.txt"`,
          "X-Secure-Token": token,
          "X-Token-Expires": expiresAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      documentId,
      fileName: `${documentId}-document.pdf`,
      downloadUrl: `/api/v1/admin/bookings/documents/${documentId}/download?format=file&token=${token}`,
      secureToken: token,
      expiresAt,
      expiresInSeconds: 1800,
      message: "لینک دانلود امن مدیریت با موفقیت تولید شد.",
    });
  } catch (err) {
    console.error("Error in admin document download:", err);
    return NextResponse.json(
      { success: false, message: "خطا در تولید لینک دانلود سند مالی" },
      { status: 500 }
    );
  }
}
