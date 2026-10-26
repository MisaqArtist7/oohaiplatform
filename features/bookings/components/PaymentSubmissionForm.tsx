"use client";

import React from "react";
import { CreditCard, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

/**
 * TASK-7: payment form
 * فرم بارگذاری فیش واریز ساتنا یا چک صیادی برای اتصال در تسک ۷
 */
export default function PaymentSubmissionForm({
  bookingUuid,
}: {
  bookingUuid: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">
          ثبت فیش واریز ساتنا یا چک صیادی
        </h3>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        پس از واریز مبلغ پیش‌فاکتور از طریق حواله ساتنا/پایا یا ثبت چک صیادی بنفش،
        تصویر فیش و شماره پیگیری مربوطه در این بخش بارگذاری می‌گردد.
      </p>

      {/* TASK-7: فرم پرداخت آنلاین و آپلود در تسک ۷ پیاده‌سازی و متصل خواهد شد */}
      <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-border text-center space-y-2">
        <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
        <p className="text-xs font-semibold text-muted-foreground">
          فرم اتصال به درگاه و بارگذاری اسناد مالی در تسک ۷ فعال خواهد شد.
        </p>
        <span className="text-[11px] font-mono text-muted-foreground/80 block">
          شناسه پیگیری: {bookingUuid}
        </span>
      </div>

      <Button disabled className="w-full h-10 text-xs font-bold">
        ثبت سند پرداخت (غیرفعال تا تسک ۷)
      </Button>
    </div>
  );
}
