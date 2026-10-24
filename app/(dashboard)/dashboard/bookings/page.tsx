"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  LayoutDashboard,
  Handshake,
  ArrowRight,
  RotateCcw,
  Plus,
  X,
  Building2,
} from "lucide-react";
import { ClientBooking } from "@/types/client-dashboard";
import { fetchProformaDownloadToken } from "@/lib/client-api";
import { formatToman, toPersianDigits } from "@/lib/mock-data";
import { useClientBookingsQuery } from "@/features/bookings/hooks/useBookings";
import LogoutButton from "@/components/common/LogoutButton";

export default function ClientDashboardBookingsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // در صورتی که کاربر مالک رسانه باشد، به پنل اختصاصی سازه‌ها هدایت می‌شود
  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const sessionData = await res.json();
          const user = sessionData?.user;
          if (user) {
            const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
            const userRoles = Array.isArray(user.roles) ? user.roles : [];
            const roleNames = userRoles
              .map((r: unknown) =>
                typeof r === "string"
                  ? r
                  : (r as { name?: string; slug?: string })?.name || (r as { name?: string; slug?: string })?.slug
              )
              .filter(Boolean);

            const isMediaOwner =
              userPermissions.some((p: string) =>
                ["media-owner", "media_owner", "mediaowner", "dashboard.media-owner", "dashboard.media_owner", "structures.manage"].includes(p.toLowerCase())
              ) ||
              roleNames.some((r: string) =>
                ["media-owner", "media_owner", "mediaowner"].includes(r.toLowerCase())
              );

            if (isMediaOwner) {
              router.replace("/media-owner/structures");
            }
          }
        }
      } catch {}
    }
    checkRole();
  }, [router]);

  // مودال دانلود امن پیش‌فاکتور
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

  // فراخوانی لیست رزروهای کاربر از طریق GET /api/v1/client/bookings همراه با کش هوشمند
  const {
    data,
    isLoading: loading,
    isRefetching,
    refetch,
    isError,
  } = useClientBookingsQuery(statusFilter, searchQuery);

  const bookings: ClientBooking[] = data?.bookings || [];
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

  // شاخص‌های آماری
  const totalAmount = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const awaitingCount = counts.awaiting_payment ?? bookings.filter((b) => b.status.value === "awaiting_payment").length;
  const activeCount = counts.active ?? bookings.filter((b) => b.status.value === "active").length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 lg:flex">
      {/* ── سایدبار ناوبری داشبورد ── */}
      <aside className="flex flex-col border-b border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between p-4 lg:p-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-foreground">
              بیلبورد<span className="text-primary">مارکت</span>
            </span>
          </Link>
          <div className="lg:hidden">
            <LogoutButton variant="icon" />
          </div>
        </div>

        <nav aria-label="منوی داشبورد" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>نمای کلی</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary"
          >
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span>رزروهای من</span>
          </Link>

          <Link
            href="/dashboard/proposals"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>پیشنهادهای هوشمند</span>
          </Link>

          <Link
            href="/mediaOwnerRequest"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Handshake className="h-4 w-4 text-primary" />
            <span>همکاری مالکان</span>
          </Link>
        </nav>

        <div className="border-t border-border p-4 space-y-2">
          <Link
            href="/structures"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
          >
            <Building2 className="h-4 w-4" />
            <span>کاوشگر سازه‌ها روی نقشه</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به داشبورد</span>
          </Link>

          <div className="pt-2 border-t border-border/60">
            <LogoutButton className="w-full justify-center" />
          </div>
        </div>
      </aside>

      {/* ── بخش محتوای اصلی ── */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* بردکرامب مسیر */}
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                داشبورد
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">رزروهای من</span>
            </nav>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={loading || isRefetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="تازه‌سازی فهرست رزروها"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-muted-foreground ${isRefetching ? "animate-spin text-primary" : ""}`} />
              <span>{isRefetching ? "در حال به‌روزرسانی..." : "تازه‌سازی"}</span>
            </button>
          </div>

          {/* سربرگ عنوان و دکمه رزرو جدید */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <span>رزروهای من</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                مدیریت قراردادها، استعلام وضعیت تاییدیه اکران، پرداخت پیش‌فاکتورها و مشاهده سازه‌های رزرو شده
              </p>
            </div>

            <Link
              href="/structures"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>رزرو سازه جدید</span>
            </Link>
          </div>

          {/* کارت‌های آماری شاخص کلیدی (KPI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-2">
                <span>تعداد کل رزروها</span>
                <CalendarCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-black text-foreground font-sans">
                {toPersianDigits(counts.all ?? bookings.length)} سازه
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                سوابق ثبت‌شده در حساب شما
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 text-xs font-bold mb-2">
                <span>نیازمند اقدام و پرداخت</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 font-sans">
                {toPersianDigits(awaitingCount)} مورد
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                قفل موقت ۴۸ ساعته جهت تسویه
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-2">
                <span>کمپین‌های فعال در حال اکران</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 font-sans">
                {toPersianDigits(activeCount)} بیلبورد
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                در حال نمایش محیطی در شهر
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
                مجموع بهای سازه‌های رزرو شده
              </div>
            </div>
          </div>

          {/* نوار جستجو و فیلتر وضعیت */}
          <div className="rounded-2xl border border-border bg-white p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* تب‌های وضعیت */}
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
                  همه رزروها ({toPersianDigits(counts.all ?? bookings.length)})
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
                  <span>در انتظار پرداخت ({toPersianDigits(counts.awaiting_payment ?? 0)})</span>
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
                  در انتظار تایید ({toPersianDigits(counts.pending_review ?? 0)})
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
                  فعال و در حال اکران ({toPersianDigits(counts.active ?? 0)})
                </button>
              </div>

              {/* ورودی جستجو */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو با کد سازه، عنوان یا کد رهگیری..."
                  className="w-full rounded-xl border border-border bg-slate-50 pr-9 pl-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* خطای دریافت اطلاعات */}
          {isError && (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
              <AlertCircle className="mx-auto h-7 w-7 text-rose-600" />
              <h2 className="text-base font-bold text-rose-950">خطا در برقراری ارتباط با سامانه رزرو</h2>
              <p className="text-xs text-rose-800 max-w-md mx-auto">
                امکان دریافت اطلاعات رزروهای شما از سرور وجود ندارد. لطفا اتصال اینترنت را بررسی و مجدداً تلاش نمایید.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>تلاش دوباره</span>
              </button>
            </div>
          )}

          {/* وضعیت بارگذاری (Skeleton Loading) */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl border border-border bg-white p-5 animate-pulse flex flex-col sm:flex-row gap-4"
                >
                  <div className="h-32 w-full sm:w-44 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-slate-200 rounded" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    <div className="h-8 w-1/3 bg-slate-200 rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* حالت لیست خالی */}
          {!loading && !isError && bookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-muted-foreground">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "هیچ رزروی با این مشخصات یافت نشد"
                    : "شما تاکنون هیچ سازه‌ای را رزرو نکرده‌اید"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "می‌توانید فیلتر وضعیت یا عبارت جستجو را پاک کنید تا همه نتایج نمایش داده شوند."
                    : "می‌توانید از طریق کاوشگر نقشه بیلبوردها، سازه مورد نظر خود را در تهران و سایر شهرها انتخاب و ثبت اولیه نمایید."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span>پاک‌کردن فیلترها</span>
                  </button>
                )}
                <Link
                  href="/structures"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>مشاهده و انتخاب سازه‌ها</span>
                </Link>
              </div>
            </div>
          )}

          {/* لیست سازه‌های رزرو شده */}
          {!loading && !isError && bookings.length > 0 && (
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
                    {/* ستون راست: عکس و مشخصات کامل سازه */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0 flex-1">
                      {/* تصویر سازه */}
                      <div className="relative h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={booking.structure.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"}
                          alt={booking.structure.title}
                          fill
                          sizes="180px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                          {booking.structure.type}
                        </div>
                      </div>

                      {/* اطلاعات متنی و نشان‌ها */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        {/* ردیف کد رهگیری، وضعیت و برند */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* کد رهگیری رزرو با دکمه کپی */}
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
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {isAwaiting && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />}
                            {isActive && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                            {isPending && <Clock className="h-3 w-3 text-amber-600" />}
                            <span>{booking.status.label}</span>
                          </span>

                          {/* نام برند سفارش‌دهنده */}
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            برند: {booking.brandName}
                          </span>
                        </div>

                        {/* عنوان سازه */}
                        <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                          <Link href={`/dashboard/bookings/${booking.id}`}>
                            {booking.structure.title}
                          </Link>
                        </h3>

                        {/* موقعیت، ابعاد و دوره اکران */}
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
                          <span>
                            دوره اکران: {booking.startDate} الی {booking.endDate} ({toPersianDigits(booking.durationDays)} روز)
                          </span>
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

                    {/* ستون چپ: بهای قرارداد و دکمه‌های اقدام سریع */}
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
                        {/* دکمه ثبت پرداخت در صورت نیاز به تسویه */}
                        {isAwaiting && (
                          <Link
                            href={`/dashboard/bookings/${booking.id}#payment`}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-95"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>ثبت پرداخت و فیش</span>
                          </Link>
                        )}

                        {/* دکمه دانلود پیش‌فاکتور با توکن امن */}
                        {booking.proforma && (
                          <button
                            type="button"
                            onClick={() => handleDownloadClick(booking)}
                            title="دریافت پیش‌فاکتور رسمی الکترونیک"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5 text-primary" />
                            <span>پیش‌فاکتور</span>
                          </button>
                        )}

                        {/* دکمه مشاهده جزئیات پرونده */}
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
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
        </div>
      </main>

      {/* ── مودال دانلود امن پیش‌فاکتور (۱۵ دقیقه اعتبار) ── */}
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
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
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
                این سند الکترونیک ممهور به شناسه رهگیری مالیاتی بوده و به مدت ۱۵ دقیقه برای شما معتبر می‌باشد.
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
                <span>در حال تولید توکن امن رمزنگاری‌شده...</span>
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
