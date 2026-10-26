"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building2,
  Sparkles,
  AlertTriangle,
  FolderOpen,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { useBookingsListQuery } from "../hooks/useBookings";
import { BOOKING_STATUS_FILTERS } from "../constants";
import BookingStatusBadge from "./BookingStatusBadge";
import LockCountdown from "./LockCountdown";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/dates";
import { Button } from "@/shared/components/ui/button";

export default function BookingsListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentStatus = searchParams.get("status") || "all";

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookingsListQuery({
    page: currentPage,
    per_page: 15,
    status: currentStatus,
  });

  const bookings = data?.items || [];
  const lastPage = data?.lastPage || 1;

  const updateQueryParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(newParams)) {
      if (value === null || value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleStatusChange = (status: string) => {
    updateQueryParams({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > lastPage) return;
    updateQueryParams({ page });
  };

  return (
    <div className="space-y-6">
      {/* سربرگ عنوان و اقدام جدید */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <span>رزروهای من</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            پیگیری وضعیت قراردادها، قفل سازه‌ها و فاکتورهای اکران تبلیغات محیطی
          </p>
        </div>

        <Link
          href="/structures"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>کاوش و رزرو سازه جدید</span>
        </Link>
      </div>

      {/* فیلتر وضعیت با Tabs افقی بر اساس BOOKING_STATUS_FILTERS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {BOOKING_STATUS_FILTERS.map((opt) => {
          const isActive = currentStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* حالت Loading (Skeleton) */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-card p-5 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <div className="h-5 w-48 bg-muted rounded-md" />
                <div className="h-4 w-72 bg-muted rounded-md" />
                <div className="h-3 w-32 bg-muted rounded-md" />
              </div>
              <div className="h-9 w-32 bg-muted rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* حالت Error با پیام و دکمه تلاش مجدد */}
      {!isLoading && isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive mb-1">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            خطا در دریافت لیست رزروها
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : "برقراری ارتباط با سرور با خطا مواجه شد. لطفاً اتصال اینترنت خود را بررسی و دوباره امتحان کنید."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>تلاش مجدد</span>
          </Button>
        </div>
      )}

      {/* حالت Empty (رزروی ثبت نشده) */}
      {!isLoading && !isError && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground mb-1">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            رزروی ثبت نشده است
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {currentStatus !== "all"
              ? "رزروی با این وضعیت یافت نشد. می‌توانید فیلتر را به حالت «همه» بازگردانید."
              : "شما هنوز هیچ درخواست رزروی ثبت نکرده‌اید. با مراجعه به بخش کاوش سازه‌ها می‌توانید بیلبورد مورد نظر خود را انتخاب نمایید."}
          </p>
          {currentStatus !== "all" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("all")}
            >
              نمایش همه رزروها
            </Button>
          ) : (
            <Link
              href="/structures"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <span>مشاهده و انتخاب سازه‌ها</span>
            </Link>
          )}
        </div>
      )}

      {/* لیست کارت‌های رزرو */}
      {!isLoading && !isError && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.uuid}
              className="group rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* مشخصات سازه و بازه */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
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

                {booking.structure?.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{booking.structure.address}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      از {toPersianDigits(formatJalali(booking.start_date))} تا{" "}
                      {toPersianDigits(formatJalali(booking.end_date))}
                    </span>
                  </span>

                  <span className="font-bold text-foreground">
                    مبلغ: {formatToman(booking.total_amount)}
                  </span>
                </div>
              </div>

              {/* دکمه مشاهده جزئیات */}
              <div className="flex items-center md:self-center shrink-0">
                <Link
                  href={`/client/bookings/${booking.uuid}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:border-primary transition-all shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <span>مشاهده پرونده و جزئیات</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* صفحه‌بندی (Pagination) */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
              <span className="text-muted-foreground">
                صفحه {toPersianDigits(currentPage)} از {toPersianDigits(lastPage)}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="gap-1 h-8 px-2.5 text-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>قبلی</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="gap-1 h-8 px-2.5 text-xs"
                >
                  <span>بعدی</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
