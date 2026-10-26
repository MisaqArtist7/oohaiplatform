"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  User,
  Info,
} from "lucide-react";
import { useBookingDetailQuery } from "../hooks/useBookings";
import { BOOKING_STEPPER_STEPS } from "../constants";
import BookingStatusBadge from "./BookingStatusBadge";
import LockCountdown from "./LockCountdown";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/dates";
import { Button } from "@/shared/components/ui/button";

interface BookingDetailViewProps {
  bookingUuid: string;
  backUrl?: string;
}

const roleTranslations: Record<string, string> = {
  super_admin: "مدیر ارشد سامانه",
  admin: "کارشناس بررسی",
  media_owner: "مالک رسانه",
  client: "مشتری / متقاضی",
};

export default function BookingDetailView({
  bookingUuid,
  backUrl = "/client/bookings",
}: BookingDetailViewProps) {
  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookingDetailQuery(bookingUuid);

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>در حال بارگذاری اطلاعات رزرو...</span>
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
        <h3 className="text-base font-bold text-foreground">
          خطا در دریافت پرونده رزرو
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error instanceof Error
            ? error.message
            : "پرونده رزرو مورد نظر یافت نشد یا دسترسی به آن امکان‌پذیر نیست."}
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 ml-1" />
            <span>تلاش مجدد</span>
          </Button>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            <span>بازگشت به لیست</span>
          </Link>
        </div>
      </div>
    );
  }

  const statusVal = booking.status.value;
  const isTerminalStatus = statusVal === "rejected" || statusVal === "expired";

  // شاخص گام جاری در استپر ۶ مرحله‌ای اصلی
  const currentStepIndex = BOOKING_STEPPER_STEPS.findIndex(
    (s) => s.value === statusVal
  );

  // مرتب‌سازی زمانی لاگ‌ها
  const sortedLogs = [...(booking.logs || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      {/* دکمه بازگشت و شناسه پرونده */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="بازگشت"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-foreground">
                پرونده رزرو {booking.structure?.title || `سازه #${booking.structure_id}`}
              </h1>
              <BookingStatusBadge status={booking.status} size="sm" />
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5" dir="ltr">
              UUID: {booking.uuid}
            </p>
          </div>
        </div>

        {/* شمارش معکوس قفل در صورت فعال بودن */}
        <LockCountdown
          lockedUntil={booking.locked_until}
          isLockExpired={booking.is_lock_expired}
          statusValue={booking.status.value}
          onExpired={() => refetch()}
        />
      </div>

      {/* هشدار اختصاصی در صورت رد شدن رزرو */}
      {statusVal === "rejected" && (
        <div className="rounded-2xl border border-red-300 bg-red-50/80 dark:bg-red-950/40 dark:border-red-900 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>درخواست رزرو توسط مدیریت رد شده است</span>
          </div>
          {booking.rejection_reason && (
            <p className="text-xs text-red-700 dark:text-red-300/90 leading-relaxed pr-7">
              <strong>علت رد درخواست:</strong> {booking.rejection_reason}
            </p>
          )}
        </div>
      )}

      {/* اعلان اختصاصی در صورت انقضای مهلت قفل */}
      {statusVal === "expired" && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/80 dark:bg-rose-950/40 dark:border-rose-900 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <Clock className="h-5 w-5 shrink-0" />
            <span>مهلت قفل و اقدام برای این رزرو به پایان رسیده و منقضی شده است.</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed pr-7">
            در صورت تمایل به رزرو مجدد، لطفاً از بخش کاتالوگ سازه‌ها، درخواست جدید ثبت فرمایید.
          </p>
        </div>
      )}

      {/* استپر مراحل (فقط در صورتی که رزرو رد شده یا منقضی نباشد) */}
      {!isTerminalStatus && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground">
            گردش کار و مراحل رزرو
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BOOKING_STEPPER_STEPS.map((step, idx) => {
              const isPassed = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.value}
                  className={`relative rounded-xl border p-3 text-center transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-xs"
                      : isPassed
                      ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                      : "border-border bg-muted/30 text-muted-foreground opacity-60"
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {isPassed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {toPersianDigits(idx + 1)}
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-border text-muted-foreground text-xs font-medium flex items-center justify-center">
                        {toPersianDigits(idx + 1)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`block text-xs ${
                      isCurrent
                        ? "font-black text-primary"
                        : isPassed
                        ? "font-bold text-emerald-900 dark:text-emerald-200"
                        : "font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون راست (۲ ستونه در دسکتاپ): اطلاعات کامل سازه و رزرو */}
        <div className="lg:col-span-2 space-y-6">
          {/* کارت مشخصات سازه و قرارداد */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Building2 className="h-4 w-4 text-primary" />
              <span>مشخصات سازه و بازه اکران</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">عنوان سازه:</span>
                <Link
                  href={`/structures/${booking.structure?.uuid || booking.structure?.id}`}
                  className="font-bold text-primary hover:underline text-sm inline-block"
                >
                  {booking.structure?.title || `سازه #${booking.structure_id}`}
                </Link>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">مبلغ کل قرارداد:</span>
                <span className="font-black text-foreground text-sm font-sans">
                  {formatToman(booking.total_amount)}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">بازه اکران:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>
                    از {toPersianDigits(formatJalali(booking.start_date))} تا{" "}
                    {toPersianDigits(formatJalali(booking.end_date))}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">آدرس سازه:</span>
                <span className="font-medium text-foreground">
                  {booking.structure?.address || "ثبت نشده"}
                </span>
              </div>

              {booking.payment_reference && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground block mb-0.5">
                    شناسه یا شماره پیگیری پرداخت:
                  </span>
                  <span className="font-mono font-bold text-foreground" dir="ltr">
                    {booking.payment_reference}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* تاریخچه و لاگ‌های گردش کار */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <span>تاریخچه و لاگ‌های تغییر وضعیت</span>
            </h2>

            {sortedLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                هنوز تغییری در وضعیت این رزرو ثبت نگردیده است.
              </p>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:right-3.5 before:w-0.5 before:bg-border">
                {sortedLogs.map((log) => (
                  <div key={log.id} className="relative flex items-start gap-4 pr-1">
                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0 z-10">
                      <Clock className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 rounded-xl border border-border bg-muted/20 p-3 space-y-1 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-foreground">
                          {log.from_status
                            ? `تغییر از «${log.from_status.label}» به «${log.to_status.label}»`
                            : `وضعیت اولیه: «${log.to_status.label}»`}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {toPersianDigits(formatJalali(log.created_at, true))}
                        </span>
                      </div>

                      {log.note && (
                        <p className="text-muted-foreground leading-relaxed pt-0.5">
                          {log.note}
                        </p>
                      )}

                      <div className="text-[11px] text-muted-foreground/80 pt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>توسط: {roleTranslations[log.user_role] || log.user_role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ستون چپ: مدارک و عملیات مجاز (قانون ۱۰) */}
        <div className="space-y-6">
          {/* بخش عملیات: فقط بر اساس allowed_actions */}
          {booking.allowed_actions?.includes("submit_payment") ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <CreditCard className="h-5 w-5" />
                <span>اقدام لازم: ثبت سند پرداخت</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                پیش‌فاکتور برای این رزرو صادر شده و سازه قفل گردیده است. جهت تثبیت قرارداد، فیش واریزی یا چک خود را ثبت فرمایید.
              </p>

              {/* TASK-7: payment form */}
              <div className="pt-2">
                <div className="rounded-xl border border-dashed border-primary/40 bg-background p-4 text-center space-y-2">
                  <CreditCard className="h-6 w-6 text-primary mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    فرم پرداخت آنلاین و آپلود فیش در تسک ۷ متصل می‌شود.
                  </p>
                  <span className="text-[11px] text-muted-foreground block">
                    {/* TASK-7: PaymentSubmissionForm will be mounted here */}
                    امکان بارگذاری فیش / چک به زودی فعال می‌گردد.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>در حال حاضر اقدام فعال جدیدی برای شما وجود ندارد.</span>
            </div>
          )}

          {/* لیست مدارک (بدون دکمه دانلود - تسک ۷) */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FileText className="h-4 w-4 text-primary" />
              <span>اسناد و پیش‌فاکتورها</span>
            </h2>

            {!booking.documents || booking.documents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                سندی برای این رزرو بارگذاری نشده است.
              </p>
            ) : (
              <div className="space-y-2.5">
                {booking.documents.map((doc) => (
                  <div
                    key={doc.uuid}
                    className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-foreground truncate" dir="ltr">
                        {doc.original_filename}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2 pt-1 border-t border-border/50">
                      <span>نوع: {doc.document_type}</span>
                      <span>
                        حجم: {toPersianDigits(Math.round(doc.file_size / 1024))} کیلوبایت
                      </span>
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      تاریخ: {toPersianDigits(formatJalali(doc.created_at, true))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
