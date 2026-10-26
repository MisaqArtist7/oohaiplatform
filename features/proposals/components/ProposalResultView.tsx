"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Coins,
  MapPin,
  Loader2,
  ExternalLink,
  RotateCcw,
  Building2,
  HelpCircle,
} from "lucide-react";
import { useProposal, useProposalStructures } from "../hooks/useProposals";
import { useCities } from "@/features/locations";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/dates";
import { Button } from "@/shared/components/ui/button";
import { Structure } from "@/features/structures";

interface ProposalResultViewProps {
  proposalRef: string | number;
}

const TEN_MINUTES_MS = 10 * 60 * 1000;

function getStructureThumbnail(structure: Structure): string | null {
  if (structure.image) return structure.image;
  if (!structure.images) return null;
  if (Array.isArray(structure.images)) {
    return structure.images[0] || null;
  }
  const imgObj = structure.images;
  if (imgObj.day) return imgObj.day;
  if (imgObj.night) return imgObj.night;
  if (Array.isArray(imgObj.gallery) && imgObj.gallery.length > 0) {
    return imgObj.gallery[0];
  }
  return null;
}

function ProposalStructureCard({ structure }: { structure: Structure }) {
  const thumbUrl = getStructureThumbnail(structure);

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {thumbUrl ? (
          <div className="relative h-16 w-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
            <Image
              src={thumbUrl}
              alt={structure.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-16 w-20 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 space-y-1">
          <Link
            href={`/structures/${structure.uuid || structure.id}`}
            className="text-xs sm:text-sm font-black text-foreground hover:text-primary transition-colors block truncate"
          >
            {structure.title}
          </Link>

          <p className="text-[11px] text-muted-foreground truncate">
            {structure.address || "آدرس ثبت نشده"}
          </p>

          <p className="text-xs font-black text-primary">
            تعرفه ماهانه: {formatToman(structure.price)}
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col gap-2 shrink-0">
        <Link
          href={`/structures/${structure.uuid || structure.id}`}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-2 text-xs font-bold transition-all shadow-xs"
        >
          <span>رزرو این سازه</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function ProposalResultView({ proposalRef }: ProposalResultViewProps) {
  const {
    data: proposal,
    isLoading,
    isError,
    error,
    refetch,
  } = useProposal(proposalRef);

  const { allLeafCities, provinces } = useCities();

  // واکشی موازی سازه‌های پیشنهادی با useProposalStructures
  const structuresMap = useProposalStructures(proposal?.results);

  // نگاشت نام شهر یا استان بر اساس city_id
  let cityName = "—";
  if (proposal?.city_id) {
    const foundCity = allLeafCities.find((c) => c.id === proposal.city_id);
    if (foundCity) {
      cityName = foundCity.name;
    } else {
      const foundProv = provinces.find((p) => p.id === proposal.city_id);
      cityName = foundProv ? foundProv.name : `کد شهر #${toPersianDigits(proposal.city_id)}`;
    }
  }

  // بررسی سقف زمانی ۱۰ دقیقه با تایمر دوره‌ای
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (proposal?.status !== "pending") return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, [proposal?.status]);

  const createdMs = proposal?.created_at ? new Date(proposal.created_at).getTime() : NaN;
  const isTimedOut =
    proposal?.status === "pending" &&
    Number.isFinite(createdMs) &&
    now - createdMs > TEN_MINUTES_MS;

  // مرتب‌سازی نتایج بر اساس rank صعودی
  const sortedResults = proposal?.results
    ? [...proposal.results].sort((a, b) => a.rank - b.rank)
    : [];

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>در حال بازیابی اطلاعات پیشنهاد هوشمند...</span>
        </div>
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3 max-w-2xl mx-auto">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
        <h3 className="text-base font-bold text-foreground">
          خطا در بازیابی پیشنهاد
        </h3>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "پیشنهاد مورد نظر یافت نشد یا دسترسی به آن امکان‌پذیر نیست."}
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 ml-1" />
            <span>تلاش مجدد</span>
          </Button>
          <Link
            href="/client/proposals"
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            <span>بازگشت به تاریخچه</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = proposal.status === "pending";
  const isCompleted = proposal.status === "completed";
  const isUnknownStatus = !isPending && !isCompleted;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* سربرگ ناوبری و شناسه پیشنهاد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/client/proposals"
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="بازگشت به تاریخچه پیشنهادات"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>نتیجه پیشنهاد هوشمند کمپین</span>
              </h1>
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
                  <span>وضعیت: {proposal.status}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5" dir="ltr">
              ID: {proposal.id} {proposal.uuid ? `| UUID: ${proposal.uuid}` : ""}
            </p>
          </div>
        </div>

        <Link
          href="/client/proposals/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>ثبت سناریوی جدید</span>
        </Link>
      </div>

      {/* کارت خلاصه مشخصات ورودی کاربر */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground border-b border-border pb-2.5">
          مشخصات و سناریوی ارسالی کمپین
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block mb-1">بودجه درخواستی:</span>
            <span className="font-black text-foreground text-sm flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-primary" />
              <span>{formatToman(proposal.budget)}</span>
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">موقعیت هدف:</span>
            <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{cityName}</span>
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">تاریخ ثبت:</span>
            <span className="font-medium text-foreground text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{toPersianDigits(formatJalali(proposal.created_at, true))}</span>
            </span>
          </div>

          <div className="sm:col-span-3 pt-2 border-t border-border/60">
            <span className="text-muted-foreground block mb-1 font-bold">شرح سناریو:</span>
            <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/20 p-3.5 rounded-xl border border-border">
              {proposal.scenario}
            </p>
          </div>
        </div>
      </div>

      {/* ۱. حالت در حال پردازش (pending) */}
      {isPending && (
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 p-8 text-center space-y-4 shadow-2xs">
          {isTimedOut ? (
            <div className="space-y-3">
              <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto" />
              <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                پردازش طولانی‌تر از معمول شده است؛ بعداً از تاریخچه ببینید
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                پردازش سناریوی کمپین شما توسط مدل هوش مصنوعی در صف صف‌های سنگین سرور قرار گرفته است. نتیجه به محض تکمیل در تاریخچه استعلام‌های شما ذخیره خواهد شد.
              </p>
              <div className="pt-2">
                <Link
                  href="/client/proposals"
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
                >
                  <span>مشاهده تاریخچه پیشنهادات</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-amber-600 mx-auto" />
              <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                در حال پردازش هوشمند و انتخاب بهترین سازه‌ها...
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                هوش مصنوعی در حال تحلیل کاتالوگ سازه‌ها بر اساس بودجه و سناریوی شماست. این صفحه به صورت خودکار هر چند ثانیه به‌روزرسانی می‌شود؛ می‌توانید صفحه را ببندید و بعداً مراجعه فرمایید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ۲. حالت وضعیت ناشناخته سرور */}
      {isUnknownStatus && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2 shadow-2xs">
          <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            وضعیت پیشنهاد: {proposal.status}
          </h3>
          <p className="text-xs text-muted-foreground">
            در صورت تکرار با پشتیبانی تماس بگیرید.
          </p>
        </div>
      )}

      {/* ۳. حالت تکمیل‌شده (completed) */}
      {isCompleted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>سازه‌های پیشنهادی هوش مصنوعی ({toPersianDigits(sortedResults.length)} مورد)</span>
            </h2>
          </div>

          {sortedResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold text-foreground">سازه‌ای پیشنهاد نشد</p>
              <p className="text-[11px] text-muted-foreground">
                برای بودجه و سناریوی انتخابی، سازه منطبقی در این شهر یافت نگردید. لطفاً با افزایش بودجه یا تغییر شهر سناریوی دیگری ثبت فرمایید.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedResults.map((result) => {
                const structEntry = structuresMap.get(result.structure_id);
                const structure = structEntry?.structure;
                const isLoadingStructure = structEntry?.isLoading ?? false;
                const isStructureUnavailable =
                  structEntry?.isError || (!isLoadingStructure && !structure);

                return (
                  <div
                    key={result.id}
                    className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4 hover:border-primary/40 transition-all"
                  >
                    {/* هدر رتبه و اولویت پیشنهاد */}
                    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black">
                          {toPersianDigits(result.rank)}
                        </span>
                        <span className="text-xs font-black text-foreground">
                          اولویت {toPersianDigits(result.rank)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        شناسه سازه: #{toPersianDigits(result.structure_id)}
                      </span>
                    </div>

                    {/* متن استدلال هوش مصنوعی (Reasoning) */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        استدلال و علت پیشنهاد هوش مصنوعی:
                      </span>
                      <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border">
                        {result.reasoning}
                      </p>
                    </div>

                    {/* کارت مشخصات سازه از ماژول structures */}
                    {isLoadingStructure ? (
                      <div className="h-24 rounded-xl border border-border bg-muted/20 animate-pulse flex items-center justify-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>در حال دریافت جزئیات سازه #{toPersianDigits(result.structure_id)}...</span>
                        </div>
                      </div>
                    ) : isStructureUnavailable ? (
                      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                        اطلاعات این سازه در دسترس نیست
                      </div>
                    ) : structure ? (
                      <ProposalStructureCard structure={structure} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
