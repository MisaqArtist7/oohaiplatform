"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  ArrowLeft,
  Sparkles,
  Clock,
  FolderOpen,
} from "lucide-react";
import { useBookingsListQuery } from "@/features/bookings/hooks/useBookings";
import BookingStatusBadge from "@/features/bookings/components/BookingStatusBadge";
import LockCountdown from "@/features/bookings/components/LockCountdown";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/dates";
import { Button } from "@/shared/components/ui/button";

export default function ClientDashboardPage() {
  const { data, isLoading, isError, refetch } = useBookingsListQuery({
    page: 1,
    per_page: 5,
  });

  const latestBookings = data?.items || [];

  // بررسی وجود رزروی با قابلیت ثبت پرداخت (بدون ادعای تعداد کل)
  const actionRequiredBooking = latestBookings.find((b) =>
    b.allowed_actions?.includes("submit_payment")
  );

  return (
    <div className="space-y-6">
      {/* سربرگ خوش‌آمدگویی داشبورد مشتری */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>داشبورد مشتریان</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            مرور آخرین وضعیت رزروهای سازه و اقدامات ضروری
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/client/proposals"
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>پیشنهاد هوشمند</span>
          </Link>
          <Link
            href="/client/bookings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>مشاهده همه رزروها</span>
          </Link>
          <Link
            href="/structures"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
          >
            <span>کاوش سازه‌ها</span>
          </Link>
        </div>
      </div>

      {/* بنر نیاز به اقدام (فقط در صورت وجود رزرو با allowed_actions شامل submit_payment) */}
      {actionRequiredBooking && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 dark:bg-purple-950/30 dark:border-purple-900/60 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shrink-0 mt-0.5">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <span>نیازمند اقدام: ثبت پرداخت</span>
                  <LockCountdown
                    lockedUntil={actionRequiredBooking.locked_until}
                    isLockExpired={actionRequiredBooking.is_lock_expired}
                    statusValue={actionRequiredBooking.status.value}
                    onExpired={() => refetch()}
                  />
                </h3>
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  برای سازه «{actionRequiredBooking.structure?.title}» پیش‌فاکتور صادر گردیده و آماده ثبت فیش واریزی یا چک است.
                </p>
              </div>
            </div>

            <Link
              href={`/client/bookings/${actionRequiredBooking.uuid}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all shrink-0"
            >
              <span>مشاهده و اقدام</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* بخش آخرین رزروها */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>آخرین رزروها</span>
          </h2>
          <Link
            href="/client/bookings"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>مشاهده فهرست کامل</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* حالت بارگذاری */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-border bg-card p-5 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-muted rounded-md" />
                  <div className="h-3 w-64 bg-muted rounded-md" />
                </div>
                <div className="h-8 w-24 bg-muted rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* حالت خطا */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-center space-y-2">
            <p className="text-xs text-destructive font-medium">
              دریافت آخرین رزروها با خطا مواجه شد.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8 text-xs"
            >
              تلاش مجدد
            </Button>
          </div>
        )}

        {/* حالت خالی */}
        {!isLoading && !isError && latestBookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-2">
            <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              هنوز هیچ رزروی ثبت نکرده‌اید.
            </p>
            <Link
              href="/structures"
              className="inline-flex text-xs font-bold text-primary hover:underline"
            >
              کاوش و انتخاب اولین سازه
            </Link>
          </div>
        )}

        {/* لیست ۵ رزرو آخر */}
        {!isLoading && !isError && latestBookings.length > 0 && (
          <div className="space-y-3">
            {latestBookings.map((booking) => (
              <div
                key={booking.uuid}
                className="rounded-2xl border border-border bg-card p-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-foreground">
                      {booking.structure?.title || `سازه شماره ${booking.structure_id}`}
                    </h3>
                    <BookingStatusBadge status={booking.status} size="sm" />
                    <LockCountdown
                      lockedUntil={booking.locked_until}
                      isLockExpired={booking.is_lock_expired}
                      statusValue={booking.status.value}
                      onExpired={() => refetch()}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      از {toPersianDigits(formatJalali(booking.start_date))} تا{" "}
                      {toPersianDigits(formatJalali(booking.end_date))}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-foreground">
                      {formatToman(booking.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/client/bookings/${booking.uuid}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
                  >
                    <span>جزئیات پرونده</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
