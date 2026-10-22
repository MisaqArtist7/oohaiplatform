"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheck,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ArrowLeft,
  Copy,
  Check,
  Download,
  MapPin,
  Maximize2,
  Sparkles,
  Inbox,
  Loader2,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { ClientBooking } from "@/types/client-dashboard";
import { fetchProformaDownloadToken } from "@/lib/client-api";
import { formatToman, toPersianDigits } from "@/lib/mock-data";
import { useClientBookingsQuery } from "@/features/bookings/hooks/useBookings";

export default function BookingsListView() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // وضعیت دانلود امن پیش‌فاکتور
  const [downloadModal, setDownloadModal] = useState<{
    open: boolean;
    booking: ClientBooking | null;
    loading: boolean;
    tokenInfo?: {
      downloadUrl: string;
      expiresAt: string;
      expiresInSeconds: number;
    };
  }>({
    open: false,
    booking: null,
    loading: false,
  });

  // دریافت اطلاعات رزروها از TanStack Query همراه با کش و تازه‌سازی هوشمند
  const { data, isLoading: loading } = useClientBookingsQuery(statusFilter, searchQuery);
  const bookings = data?.bookings || [];
  const counts = data?.counts || {};

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadClick = async (booking: ClientBooking) => {
    if (!booking.proforma) return;
    setDownloadModal({
      open: true,
      booking,
      loading: true,
    });

    try {
      const tokenRes = await fetchProformaDownloadToken(booking.proforma.id);
      setDownloadModal((prev) => ({
        ...prev,
        loading: false,
        tokenInfo: {
          downloadUrl: tokenRes.downloadUrl,
          expiresAt: tokenRes.expiresAt,
          expiresInSeconds: tokenRes.expiresInSeconds,
        },
      }));
    } catch {
      setDownloadModal((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // شاخص‌های آماری بالای صفحه
  const totalAmount = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const awaitingCount = counts.awaiting_payment || bookings.filter((b) => b.status.value === "awaiting_payment").length;
  const activeCount = counts.active || bookings.filter((b) => b.status.value === "active").length;

  return (
    <div className="space-y-6">
      {/* سربرگ عنوان و دکمه اقدام */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <span>مدیریت رزروها و قراردادهای اکران</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            پیگیری وضعیت تایید، صدور پیش‌فاکتور رسمی الکترونیک و بارگذاری فیش‌های واریزی
          </p>
        </div>

        <Link
          href="/structures"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span>کاوش و اجاره بیلبورد جدید</span>
        </Link>
      </div>

      {/* کارت‌های آماری KPI خلاصه وضعیت */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-2">
            <span>تعداد کل رزروها</span>
            <CalendarCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground font-sans">
            {toPersianDigits(counts.all || bookings.length)} سازه
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            سوابق ثبت‌شده در پنل
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold mb-2">
            <span>نیازمند اقدام و پرداخت</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-sans">
            {toPersianDigits(awaitingCount)} مورد
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            قفل موقت ۴۸ ساعته اختصاصی فعال است
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-2">
            <span>کمپین‌های فعال در حال اکران</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 font-sans">
            {toPersianDigits(activeCount)} بیلبورد
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            در حال نمایش در سطح شهر تهران
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-2">
            <span>ارزش کل قراردادها</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg sm:text-xl font-black text-foreground font-sans truncate">
            {formatToman(totalAmount)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            مجموع ناخالص سفارش‌های اکران
          </div>
        </div>
      </div>

      {/* نوار جستجو و تب‌های فیلتر وضعیت */}
      <div className="rounded-2xl border border-border bg-white p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* نوار فیلتر تب‌ها بر اساس وضعیت */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`shrink-0 rounded-xl px-3 py-2 font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              همه رزروها ({toPersianDigits(counts.all || bookings.length)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("awaiting_payment")}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-all ${
                statusFilter === "awaiting_payment"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
              }`}
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>در انتظار پرداخت ({toPersianDigits(counts.awaiting_payment || 0)})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending_review")}
              className={`shrink-0 rounded-xl px-3 py-2 font-bold transition-all ${
                statusFilter === "pending_review"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              در انتظار تایید ({toPersianDigits(counts.pending_review || 0)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`shrink-0 rounded-xl px-3 py-2 font-bold transition-all ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              فعال و در حال اکران ({toPersianDigits(counts.active || 0)})
            </button>
          </div>

          {/* جستجوی متنی کد رهگیری یا نام سازه */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو با کد سازه یا رهگیری..."
              className="w-full rounded-xl border border-border bg-slate-50 pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* لیست رزروها */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-border bg-white p-5 animate-pulse flex gap-4"
            >
              <div className="h-32 w-48 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-8 w-1/3 bg-slate-200 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-muted-foreground">
            <Inbox className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              هیچ درخواستی با این وضعیت یافت نشد
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              شما می‌توانید از طریق کاوشگر نقشه، بیلبورد مورد نظر خود را انتخاب و ثبت اولیه نمایید.
            </p>
          </div>
          <Link
            href="/structures"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>مشاهده کاتالوگ سازه‌ها</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isAwaiting = booking.status.value === "awaiting_payment";
            const isActive = booking.status.value === "active";
            const isPending = booking.status.value === "pending_review";

            return (
              <div
                key={booking.id}
                className="group relative rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all hover:border-primary/40 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
              >
                {/* ستون راست: عکس و مشخصات سازه */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0">
                  {/* عکس سازه */}
                  <div className="relative h-28 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={booking.structure.image}
                      alt={booking.structure.title}
                      fill
                      sizes="160px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      {booking.structure.type}
                    </div>
                  </div>

                  {/* توضیحات متنی */}
                  <div className="space-y-1.5 min-w-0">
                    {/* ردیف تگ‌ها و وضعیت */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* کد رهگیری رزرو */}
                      <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        <span>{booking.trackingCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(booking.trackingCode)}
                          title="کپی کد رهگیری"
                          className="hover:text-primary transition-colors"
                        >
                          {copiedCode === booking.trackingCode ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </span>

                      {/* نشان وضعیت */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isAwaiting
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isPending
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isAwaiting && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />}
                        {isActive && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                        {isPending && <Clock className="h-3 w-3 text-amber-600" />}
                        <span>{booking.status.label}</span>
                      </span>

                      {/* نام برند */}
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        برند: {booking.brandName}
                      </span>
                    </div>

                    {/* عنوان سازه */}
                    <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                      <Link href={`/client/bookings/${booking.id}`}>
                        {booking.structure.title}
                      </Link>
                    </h3>

                    {/* آدرس و ابعاد */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-xs">{booking.structure.district}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{booking.structure.dimensions}</span>
                      </span>
                      <span>•</span>
                      <span>دوره: {booking.startDate} الی {booking.endDate} ({toPersianDigits(booking.durationDays)} روز)</span>
                    </div>

                    {/* هشدار قفل ۴۸ ساعته در وضعیت در انتظار پرداخت */}
                    {isAwaiting && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>{booking.lockedUntil || "مهلت تسویه حساب جهت عدم واگذاری به مشتری دیگر"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ستون چپ: قیمت و دکمه‌های اقدام سریع */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                  <div className="text-right">
                    <span className="block text-[11px] text-muted-foreground">
                      مبلغ کل قرارداد
                    </span>
                    <span className="text-base sm:text-lg font-black text-foreground font-sans">
                      {formatToman(booking.totalPrice)}
                    </span>
                  </div>

                  {/* دکمه‌های عملیاتی */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* اگر در انتظار پرداخت است دکمه پرداخت و آپلود فیش */}
                    {isAwaiting && (
                      <Link
                        href={`/client/bookings/${booking.id}#payment`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>ثبت پرداخت و فیش</span>
                      </Link>
                    )}

                    {/* دکمه دانلود پیش‌فاکتور در صورت وجود */}
                    {booking.proforma && (
                      <button
                        type="button"
                        onClick={() => handleDownloadClick(booking)}
                        title="دانلود پیش‌فاکتور رسمی با توکن امن ۱۵ دقیقه‌ای"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 text-primary" />
                        <span>پیش‌فاکتور</span>
                      </button>
                    )}

                    {/* دکمه مشاهده جزئیات */}
                    <Link
                      href={`/client/bookings/${booking.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <span>جزئیات و گردش کار</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* مودال دانلود امن پیش‌فاکتور (۱۵ دقیقه اعتبار) */}
      {downloadModal.open && downloadModal.booking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setDownloadModal({ open: false, booking: null, loading: false })}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border space-y-4 animate-in zoom-in-95 duration-200 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>دانلود پیش‌فاکتور رسمی الکترونیک</span>
              </h3>
              <button
                type="button"
                onClick={() => setDownloadModal({ open: false, booking: null, loading: false })}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 space-y-1 text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                <span>لینک دانلود امن موقت (۱۵ دقیقه اعتبار)</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                این سند حاوی مهر دیجیتال سازمان زیباسازی و استعلام مالیاتی بوده و به مدت ۱۵ دقیقه برای کاربر شما معتبر است.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-muted-foreground">شماره پیش‌فاکتور:</span>
                <span className="font-mono font-bold">{downloadModal.booking.proforma?.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">کد سازه:</span>
                <span className="font-mono">{downloadModal.booking.structure.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">مبلغ قابل پرداخت:</span>
                <span className="font-bold text-foreground">{formatToman(downloadModal.booking.totalPrice)}</span>
              </div>
            </div>

            {downloadModal.loading ? (
              <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>در حال ایجاد توکن امن رمزنگاری‌شده...</span>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <a
                  href={downloadModal.tokenInfo?.downloadUrl || "#"}
                  download
                  onClick={() => {
                    setTimeout(() => {
                      setDownloadModal({ open: false, booking: null, loading: false });
                    }, 500);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>دانلود فایل رسمی سند (PDF)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setDownloadModal({ open: false, booking: null, loading: false })}
                  className="w-full text-center text-xs text-muted-foreground hover:underline"
                >
                  انصراف و بستن
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
