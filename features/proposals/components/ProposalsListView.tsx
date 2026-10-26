"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Coins,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useProposals } from "../hooks/useProposals";
import { useCities } from "@/features/locations";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/dates";
import { Button } from "@/shared/components/ui/button";

export default function ProposalsListView() {
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const { data, isLoading, isError, error, refetch } = useProposals(currentPage);
  const { allLeafCities, provinces } = useCities();

  const proposals = data?.items || [];
  const totalPages = data?.lastPage || 1;

  // تابع کمکی نگاشت نام شهر از روی شناسه
  const getCityName = useMemo(() => {
    const cityMap = new Map<number, string>();
    allLeafCities.forEach((c) => cityMap.set(c.id, c.name));
    provinces.forEach((p) => {
      if (!cityMap.has(p.id)) cityMap.set(p.id, p.name);
    });

    return (cityId?: number) => {
      if (!cityId) return "—";
      return cityMap.get(cityId) || "—";
    };
  }, [allLeafCities, provinces]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* سربرگ تاریخچه و دکمه پیشنهاد جدید */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>تاریخچه پیشنهادات و کمپین‌های هوشمند (AI)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            فهرست سناریوهای بازاریابی ثبت‌شده و نتایج تحلیل هوش مصنوعی برای سبد رسانه
          </p>
        </div>

        <Link
          href="/client/proposals/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>پیشنهاد جدید</span>
        </Link>
      </div>

      {/* ۱. وضعیت بارگذاری */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-card p-5 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-muted rounded-md" />
                <div className="h-3 w-72 bg-muted rounded-md" />
              </div>
              <div className="h-8 w-24 bg-muted rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* ۲. وضعیت خطای ارتباط */}
      {!isLoading && isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            خطا در دریافت تاریخچه پیشنهادات
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error instanceof Error ? error.message : "ارتباط با سرور برقرار نشد."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            <RotateCcw className="h-3.5 w-3.5 ml-1" />
            <span>تلاش مجدد</span>
          </Button>
        </div>
      )}

      {/* ۳. وضعیت خالی بودن لیست */}
      {!isLoading && !isError && proposals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            هنوز پیشنهادی ثبت نکرده‌اید
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            با وارد کردن بودجه و سناریوی بازاریابی خود، اولین پیشنهاد هوشمند خود را در کمترین زمان دریافت کنید.
          </p>
          <div className="pt-2">
            <Link
              href="/client/proposals/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
              <span>ثبت اولین پیشنهاد هوشمند</span>
            </Link>
          </div>
        </div>
      )}

      {/* ۴. نمایش لیست کارت‌ها/ردیف‌ها */}
      {!isLoading && !isError && proposals.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {proposals.map((proposal) => {
              const isPending = proposal.status === "pending";
              const isCompleted = proposal.status === "completed";
              const resultUrl = `/client/proposals/${proposal.uuid || proposal.id}`;

              return (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-muted-foreground" dir="ltr">
                        #{proposal.id}
                      </span>

                      {/* نشان وضعیت */}
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>تکمیل‌شده</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          <span>در حال پردازش</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">
                          <span>{proposal.status}</span>
                        </span>
                      )}

                      <span className="text-muted-foreground">•</span>

                      {/* تاریخ شمسی */}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{toPersianDigits(formatJalali(proposal.created_at, true))}</span>
                      </span>
                    </div>

                    {/* اطلاعات بودجه و شهر */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                      <span className="text-foreground flex items-center gap-1 font-bold">
                        <Coins className="h-3.5 w-3.5 text-primary" />
                        <span>بودجه: {formatToman(proposal.budget)}</span>
                      </span>

                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>شهر: {getCityName(proposal.city_id)}</span>
                      </span>
                    </div>

                    {/* پیش‌نمایش سناریو (کوتاه‌سازی صرفاً با کلاس‌های CSS بدون بریدن متن داده) */}
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {proposal.scenario}
                    </p>
                  </div>

                  {/* دکمه انتقال به صفحه نتیجه با شناسه یا uuid */}
                  <div className="shrink-0 pt-2 md:pt-0">
                    <Link
                      href={resultUrl}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/50 text-foreground px-4 py-2 text-xs font-bold transition-all w-full md:w-auto shadow-2xs"
                    >
                      <span>مشاهده نتیجه و سازه‌ها</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* صفحه‌بندی مبتنی بر query string */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Link
                href={`/client/proposals?page=${currentPage - 1}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-bold transition-all ${
                  currentPage <= 1
                    ? "opacity-40 pointer-events-none bg-muted/20"
                    : "hover:bg-muted bg-card text-foreground"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
                <span>صفحه قبل</span>
              </Link>

              <span className="text-xs text-muted-foreground px-2 font-medium">
                صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
              </span>

              <Link
                href={`/client/proposals?page=${currentPage + 1}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-bold transition-all ${
                  currentPage >= totalPages
                    ? "opacity-40 pointer-events-none bg-muted/20"
                    : "hover:bg-muted bg-card text-foreground"
                }`}
              >
                <span>صفحه بعد</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
