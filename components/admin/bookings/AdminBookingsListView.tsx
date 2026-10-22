"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Building,
  User,
  CreditCard,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ChevronLeft,
  X,
} from "lucide-react";
import { AdminBooking } from "@/types/admin-dashboard";
import { useAdminBookingsQuery } from "@/features/admin/hooks/useAdmin";

export default function AdminBookingsListView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [structureFilter, setStructureFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filterParams = useMemo(() => ({
    status: statusFilter !== "all" ? statusFilter : undefined,
    customer: customerFilter || undefined,
    structure: structureFilter || undefined,
    startDate: startDateFilter || undefined,
    endDate: endDateFilter || undefined,
    search: search || undefined,
  }), [statusFilter, customerFilter, structureFilter, startDateFilter, endDateFilter, search]);

  const { data: res, isLoading: loading, refetch: loadData } = useAdminBookingsQuery(filterParams);
  const bookings: AdminBooking[] = useMemo(() => res?.data || [], [res?.data]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCustomerFilter("");
    setStructureFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setTimeout(loadData, 50);
  };

  // کارت‌های آمار و شمارش وضعیت‌ها
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status.value === "pending_review").length;
    const locked = bookings.filter((b) => b.status.value === "locked_for_contract").length;
    const payment = bookings.filter((b) => b.status.value === "payment_submitted").length;
    const approved = bookings.filter((b) => b.status.value === "approved" || b.status.value === "active").length;
    const totalRevenue = bookings
      .filter((b) => b.status.value === "approved" || b.status.value === "active" || b.status.value === "completed")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return { total, pending, locked, payment, approved, totalRevenue };
  }, [bookings]);

  // استایل برچسب وضعیت
  const getStatusBadge = (statusValue: string, label: string) => {
    switch (statusValue) {
      case "pending_review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            {label}
          </span>
        );
      case "locked_for_contract":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Lock className="h-3.5 w-3.5" />
            {label}
          </span>
        );
      case "proforma_issued":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <FileText className="h-3.5 w-3.5" />
            {label}
          </span>
        );
      case "payment_submitted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200 animate-pulse">
            <CreditCard className="h-3.5 w-3.5" />
            {label}
          </span>
        );
      case "approved":
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {label}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <AlertCircle className="h-3.5 w-3.5" />
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {label}
          </span>
        );
    }
  };

  const statusTabs = [
    { value: "all", label: "همه درخواست‌ها" },
    { value: "pending_review", label: "در انتظار بررسی" },
    { value: "locked_for_contract", label: "قفل ۴۸ ساعته" },
    { value: "proforma_issued", label: "پیش‌فاکتور صادرشده" },
    { value: "payment_submitted", label: "فیش واریز شده" },
    { value: "approved", label: "تایید نهایی اکران" },
    { value: "rejected", label: "رد شده" },
  ];

  return (
    <div className="space-y-6">
      {/* تیتر صفحه و اکشن بار */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            میز کار مدیریت کل رزروها
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            بررسی و مدیریت گردش‌کار درخواست‌های تبلیغات محیطی، قفل سازه‌ها و صدور تاییدیه‌های مالی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { loadData(); }}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>بروزرسانی</span>
          </button>
        </div>
      </div>

      {/* کارت‌های آماری سرآمد */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">کل پرونده‌ها</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {stats.total.toLocaleString("fa-IR")}
          </p>
          <span className="text-[11px] font-medium text-slate-400">تمام بازه‌های زمانی</span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">نیازمند بررسی</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">
            {stats.pending.toLocaleString("fa-IR")}
          </p>
          <span className="text-[11px] font-medium text-amber-700/80">تایید اولیه در صف</span>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">قفل موقت ۴۸h</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-900">
            {stats.locked.toLocaleString("fa-IR")}
          </p>
          <span className="text-[11px] font-medium text-blue-700/80">رزرو موقت جهت عقد قرارداد</span>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800">فیش واریزی جدید</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-900">
            {stats.payment.toLocaleString("fa-IR")}
          </p>
          <span className="text-[11px] font-medium text-purple-700/80">تایید مالی مدیر ارشد</span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">تایید شده / اکران</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {stats.approved.toLocaleString("fa-IR")}
          </p>
          <span className="text-[11px] font-medium text-emerald-700/80">مجوز اکران صادر شده</span>
        </div>
      </div>

      {/* تب‌های وضعیت */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-reverse space-x-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl border transition-all ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* نوار جستجو و فیلترهای پیشرفته */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس شناسه رزرو، کد سازه، نام مشتری یا عنوان بیلبورد..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-10 pl-4 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-colors ${
                showFilters || customerFilter || structureFilter || startDateFilter || endDateFilter
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>فیلترهای پیشرفته</span>
              {(customerFilter || structureFilter || startDateFilter || endDateFilter) && (
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </button>

            <button
              type="submit"
              className="flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              اعمال فیلتر
            </button>
          </div>
        </form>

        {/* فیلترهای پیشرفته تکمیلی (کشو) */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                نام مشتری یا شرکت
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  placeholder="مثال: دیجی‌کالا یا اسنپ"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
                <User className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                کد یا نام سازه تبلیغاتی
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={structureFilter}
                  onChange={(e) => setStructureFilter(e.target.value)}
                  placeholder="مثال: TH-MOD-102"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
                <Building className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                از تاریخ اکران
              </label>
              <input
                type="text"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                placeholder="۱۴۰۳/۰۸/۰۱"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                تا تاریخ اکران
              </label>
              <input
                type="text"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                placeholder="۱۴۰۳/۰۹/۰۱"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none text-center"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>حذف فیلترها</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* جدول جامع رزروهای سیستمی */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500">
              در حال فراخوانی پایگاه داده رزرواسیون...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              هیچ رکوردی منطبق با فیلترهای انتخابی یافت نشد
            </h3>
            <p className="text-xs text-slate-500 max-w-sm font-medium">
              لطفاً کلمات کلیدی، نام مشتری یا بازه زمانی را تغییر داده و مجدداً تلاش نمایید.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              نمایش همه رزروها
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">شناسه و کد رهگیری</th>
                  <th className="py-3.5 px-4">مشتری و برند متقاضی</th>
                  <th className="py-3.5 px-4">مشخصات سازه و لوکیشن</th>
                  <th className="py-3.5 px-4">مبلغ کل قرارداد</th>
                  <th className="py-3.5 px-4">وضعیت گردش‌کار</th>
                  <th className="py-3.5 px-4">تاریخ ثبت</th>
                  <th className="py-3.5 px-4 text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bookings.map((booking) => {
                  const customerName = booking.customer?.fullName || booking.contactPerson || "مشتری سازمانی";
                  const brandName = booking.customer?.companyName || booking.brandName;
                  const phone = booking.customer?.phone || booking.contactPhone;

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-indigo-50/40 transition-colors group"
                    >
                      {/* ستون شناسه */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 text-sm font-mono">
                            {booking.id}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {booking.trackingCode}
                          </span>
                        </div>
                      </td>

                      {/* ستون مشتری */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{brandName}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>{customerName}</span>
                            {phone && <span>• {phone}</span>}
                          </span>
                        </div>
                      </td>

                      {/* ستون سازه */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          {booking.structure.image ? (
                            <img
                              src={booking.structure.image}
                              alt={booking.structure.title}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <Building className="h-5 w-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">
                              {booking.structure.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {booking.structure.code} • {booking.durationDays} روز اکران
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ستون مبلغ کل */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm">
                            {booking.totalPrice.toLocaleString("fa-IR")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">تومان</span>
                        </div>
                      </td>

                      {/* ستون وضعیت */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(booking.status.value, booking.status.label)}
                      </td>

                      {/* ستون تاریخ */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {booking.createdAt}
                      </td>

                      {/* ستون عملیات مدیریت */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs group-hover:scale-102"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>مرکز عملیات</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* فوتر جدول */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500 font-medium">
          <span>نمایش {bookings.length.toLocaleString("fa-IR")} ردیف اطلاعاتی</span>
          <span>سامانه اتوماسیون جامع OOHAI</span>
        </div>
      </div>
    </div>
  );
}
