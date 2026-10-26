import { NextRequest, NextResponse } from "next/server";
import { addPaymentToBooking } from "@/lib/client-dashboard-data";
import { PaymentSubmissionInput } from "@/features/bookings";

interface RouteParams {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  segmentData: RouteParams
) {
  try {
    const params = await segmentData.params;
    const bookingId = params.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "شناسه رزرو الزامی است" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let paymentInput: PaymentSubmissionInput;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const method = (formData.get("method") as "satna" | "sayad_check") || "satna";
      const amount = Number(formData.get("amount") || 0);
      const trackingCode = String(formData.get("trackingCode") || formData.get("tracking_code") || "").trim();
      const bankName = String(formData.get("bankName") || formData.get("bank_name") || "").trim();
      const checkSerial = String(formData.get("checkSerial") || formData.get("check_serial") || "").trim();
      const checkSayadId = String(formData.get("checkSayadId") || formData.get("check_sayad_id") || "").trim();
      const dueDate = String(formData.get("dueDate") || formData.get("due_date") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      const receiptFile = formData.get("receipt") || formData.get("file");
      const receiptFileName = receiptFile instanceof File ? receiptFile.name : undefined;

      paymentInput = {
        bookingId,
        method,
        amount,
        trackingCode,
        bankName,
        checkSerial,
        checkSayadId,
        dueDate,
        notes,
        receiptFileName,
      };
    } else {
      const json = await request.json();
      paymentInput = {
        bookingId,
        ...json,
      };
    }

    // اعتبارسنجی
    if (!paymentInput.amount || paymentInput.amount <= 0) {
      return NextResponse.json(
        { success: false, message: "مبلغ پرداختی نامعتبر است" },
        { status: 400 }
      );
    }

    if (paymentInput.method === "satna") {
      if (!paymentInput.trackingCode) {
        return NextResponse.json(
          { success: false, message: "کد پیگیری یا شماره ارجاع فیش بانکی الزامی است" },
          { status: 400 }
        );
      }
      if (!paymentInput.bankName) {
        return NextResponse.json(
          { success: false, message: "نام بانک مبدا الزامی است" },
          { status: 400 }
        );
      }
    } else if (paymentInput.method === "sayad_check") {
      if (!paymentInput.checkSayadId || paymentInput.checkSayadId.length < 12) {
        return NextResponse.json(
          { success: false, message: "شناسه ۱۶ رقمی صیادی الزامی است" },
          { status: 400 }
        );
      }
      if (!paymentInput.dueDate) {
        return NextResponse.json(
          { success: false, message: "تاریخ سررسید چک صیادی الزامی است" },
          { status: 400 }
        );
      }
    }

    const updatedBooking = addPaymentToBooking(bookingId, paymentInput);

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, message: "رزرو مورد نظر جهت ثبت پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "سند و اطلاعات پرداخت با موفقیت ثبت شد و به امور مالی ارجاع گردید.",
      data: updatedBooking,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطای سیستمی در پردازش سند پرداخت" },
      { status: 500 }
    );
  }
}
