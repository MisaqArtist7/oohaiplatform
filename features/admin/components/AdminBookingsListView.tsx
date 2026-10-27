"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Filter,
  Eye,
  Calendar,
  Building,
  User,
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  BookingStatusBadge,
  LockCountdown,
  BOOKING_STATUS_FILTERS,
  type Booking,
} from "@/features/bookings";
import { useAdminBookingsQuery } from "../hooks/useAdmin";
import type { AdminBookingFilters } from "../types";
import { formatToman } from "@/shared/lib/money";
import { formatJalali } from "@/shared/lib/dates";
import { toPersianDigits } from "@/shared/lib/digits";

export default function AdminBookingsListView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // خواندن فیلترها از query string
  const statusParam = searchParams.get("status") || "all";
  const structureIdParam = searchParams.get("structure_id") || "";
  const clientIdParam = searchParams.get("client_id") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  // استیت‌های محلی فرم فیلتر جهت ویرایش پیش از اعمال
  const [selectedStatus, setSelectedStatus] = useState<string>(statusParam);
  const [structureIdInput, setStructureIdInput] = useState<string>(structureIdParam);
  const [clientIdInput, setClientIdInput] = useState<string>(clientIdParam);

  const queryFilters: AdminBookingFilters = useMemo(
    () => ({
      status: statusParam !== "all" ? statusParam : undefined,
      structure_id: structureIdParam ? structureIdParam : undefined,
      client_id: clientIdParam ? clientIdParam : undefined,
      page: pageParam > 1 ? pageParam : undefined,
    }),
    [statusParam, structureIdParam, clientIdParam, pageParam]
  );

  const { data: pageData, isLoading, isError, error, refetch } = useAdminBookingsQuery(queryFilters);

  const bookings: Booking[] = pageData?.data || [];
  const meta = pageData?.meta;

  const updateFilters = (updates: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined || val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    }
    // تغییر فیلتر صفحه را به ۱ برمی‌گرداند مگر این‌که تغییر خود page باشد
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      status: selectedStatus,
      structure_id: structureIdInput.trim() || undefined,
      client_id: clientIdInput.trim() || undefined,
    });
  };

  const handleResetFilters = () => {
    setSelectedStatus("all");
    setStructureIdInput("");
    setClientIdInput("");
    router.push(pathname);
  };

  const hasActiveFilters = statusParam !== "all" || Boolean(structureIdParam) || Boolean(clientIdParam);

  return (
    <div className="space-y-6">
      {/* هدر بخش مدیریت رزروها */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            مدیریت و گردش‌کار رزروها
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            پایش کلیه رزروهای سازه‌های سراسر کشور، قفل قرارداد و صدور پیش‌فاکتور
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
            title="تازه‌سازی لیست"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* فرم فیلترهای استاندارد مطابق سند API */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>فیلترهای استاندارد جستجو</span>
            {hasActiveFilters && (
              <span className="mr-auto inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                فیلتر فعال است
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ۱. وضعیت رزرو */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                وضعیت رزرو
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              >
                {BOOKING_STATUS_FILTERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ۲. شناسه سازه (structure_id عددی) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شناسه سازه (Structure ID)
              </label>
              <input
                type="number"
                min="1"
                placeholder="مثال: 12"
                value={structureIdInput}
                onChange={(e) => setStructureIdInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* ۳. شناسه مشتری (client_id عددی) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شناسه مشتری (Client ID)
              </label>
              <input
                type="number"
                min="1"
                placeholder="مثال: 45"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>حذف فیلترها</span>
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>اعمال فیلتر</span>
            </button>
          </div>
        </form>
      </div>

      {/* بخش اصلی جدول رزروها */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold text-slate-500">
              در حال واکشی اطلاعات پرونده‌های رزرو از سرور...
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              خطا در دریافت لیست رزروها
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              {error instanceof Error ? error.message : "امکان برقراری ارتباط با سرویس رزرو ادمین وجود ندارد."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>تلاش مجدد</span>
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-3">
              <FileQuestion className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              هیچ پرونده رزروی یافت نشد
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? "با فیلترهای انتخابی فعلی موردی پیدا نشد. فیلترها را تغییر داده یا بازنشانی کنید."
                : "در حال حاضر هیچ پرونده رزروی در سیستم ثبت نشده است."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                بازنشانی فیلترها
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">شناسه پرونده</th>
                    <th className="py-3.5 px-4">خریدار (مشتری)</th>
                    <th className="py-3.5 px-4">سازه تبلیغاتی</th>
                    <th className="py-3.5 px-4">بازه اکران</th>
                    <th className="py-3.5 px-4">وضعیت</th>
                    <th className="py-3.5 px-4">مبلغ کل</th>
                    <th className="py-3.5 px-4">مهلت قفل</th>
                    <th className="py-3.5 px-4">تاریخ ثبت</th>
                    <th className="py-3.5 px-4 text-center">اقدام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => {
                    const buyerName = booking.user?.name || "—";
                    const buyerPhone = booking.user?.phone ? toPersianDigits(booking.user.phone) : "";

                    return (
                      <tr
                        key={booking.id}
                        onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* ۱. شناسه رزرو */}
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                          #{toPersianDigits(booking.id)}
                        </td>

                        {/* ۲. خریدار */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {buyerName}
                              </p>
                              {buyerPhone && (
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {buyerPhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ۳. سازه */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 max-w-xs">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <Building className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-semibold text-slate-800 truncate" title={booking.structure?.title}>
                              {booking.structure?.title || `سازه شماره ${booking.structure_id}`}
                            </span>
                          </div>
                        </td>

                        {/* ۴. بازه اکران */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{formatJalali(booking.start_date)}</span>
                            <span className="text-slate-300">←</span>
                            <span>{formatJalali(booking.end_date)}</span>
                          </div>
                        </td>

                        {/* ۵. وضعیت */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <BookingStatusBadge status={booking.status} />
                        </td>

                        {/* ۶. مبلغ کل */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                            <span>{formatToman(booking.total_amount)}</span>
                          </div>
                        </td>

                        {/* ۷. شمارش معکوس قفل */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {booking.status?.value === "locked_for_contract" && booking.locked_until ? (
                            <LockCountdown
                              lockedUntil={booking.locked_until}
                              isLockExpired={booking.is_lock_expired || false}
                              statusValue={booking.status?.value}
                              onExpired={() => refetch()}
                            />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* ۸. تاریخ ثبت */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                          {formatJalali(booking.created_at)}
                        </td>

                        {/* ۹. دکمه مشاهده و اقدام */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            <span>اقدام</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* کنترل‌های صفحه‌بندی (Pagination) بر اساس meta سرور */}
            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  نمایش ردیف‌های{" "}
                  <span className="font-bold text-slate-900">
                    {meta.from ? toPersianDigits(meta.from) : "۱"}
                  </span>{" "}
                  تا{" "}
                  <span className="font-bold text-slate-900">
                    {meta.to ? toPersianDigits(meta.to) : toPersianDigits(bookings.length)}
                  </span>{" "}
                  از مجموع{" "}
                  <span className="font-bold text-slate-900">
                    {toPersianDigits(meta.total)}
                  </span>{" "}
                  رزرو
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateFilters({ page: meta.current_page - 1 })}
                    disabled={meta.current_page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>قبلی</span>
                  </button>

                  <span className="px-3 py-1.5 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
                    صفحه {toPersianDigits(meta.current_page)} از {toPersianDigits(meta.last_page)}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateFilters({ page: meta.current_page + 1 })}
                    disabled={meta.current_page >= meta.last_page}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>بعدی</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
