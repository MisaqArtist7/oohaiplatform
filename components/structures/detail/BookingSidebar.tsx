"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Building2,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { Structure, BookingResponse } from "@/types/structure";
import { formatToman, toPersianDigits } from "@/lib/mock-data";
import { submitBookingRequest } from "@/lib/api-client";

interface BookingSidebarProps {
  structure: Structure;
}

export default function BookingSidebar({ structure }: BookingSidebarProps) {
  const [selectedDurationPreset, setSelectedDurationPreset] = useState<number>(30);
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-05-01");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [brandName, setBrandName] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<BookingResponse | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // محاسبه روزها بین دو تاریخ
  const calculateDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(diffDays, structure.specs.minDurationDays || 15);
    } catch {
      return 30;
    }
  };

  const currentDurationDays = calculateDays(startDate, endDate);

  // محاسبه تخفیف و قیمت نهایی
  const baseMonthly = structure.pricing.basePriceMonthly;
  const dailyRate = structure.pricing.dailyRate;
  const rawTotal = currentDurationDays * dailyRate;

  // تخفیف ماهانه در صورتی که مدت بیش از ۳۰ روز باشد
  const discountPercent = currentDurationDays >= 30
    ? structure.pricing.discountMonthlyPercent || 5
    : 0;
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const estimatedTotal = rawTotal - discountAmount;

  // تغییر پریست مدت زمان
  const handleDurationPreset = (days: number) => {
    setSelectedDurationPreset(days);
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = "نام و نام خانوادگی را به طور کامل وارد نمایید.";
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanPhone || !/^09[0-9]{9}$/.test(cleanPhone)) {
      errs.phone = "شماره موبایل معتبر ایران (مثال: ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.";
    }

    if (!brandName.trim() || brandName.trim().length < 2) {
      errs.brandName = "نام برند یا شرکت تبلیغ‌دهنده الزامی است.";
    }

    if (!startDate || !endDate) {
      errs.dates = "انتخاب تاریخ شروع و پایان الزامی است.";
    } else if (new Date(endDate) <= new Date(startDate)) {
      errs.dates = "تاریخ پایان باید بعد از تاریخ شروع باشد.";
    } else if (currentDurationDays < (structure.specs.minDurationDays || 15)) {
      errs.dates = `حداقل دوره اکران برای این سازه ${toPersianDigits(
        structure.specs.minDurationDays || 15
      )} روز می‌باشد.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ثبت فرم در API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await submitBookingRequest({
        structureId: structure.id,
        startDate,
        endDate,
        durationDays: currentDurationDays,
        fullName: fullName.trim(),
        phone: phone.trim(),
        brandName: brandName.trim(),
        notes: notes.trim(),
        estimatedPrice: estimatedTotal,
      });

      setSuccessResponse(response);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "خطایی در ثبت درخواست رخ داد.";
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingCode = () => {
    if (successResponse?.trackingCode) {
      navigator.clipboard.writeText(successResponse.trackingCode);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <>
      <div className="sticky top-20 rounded-2xl border border-border bg-white shadow-lg overflow-hidden transition-all">
        {/* هدر تعرفه و وضعیت */}
        <div className="bg-slate-900 p-5 text-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{structure.statusLabel}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {structure.code}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              {formatToman(baseMonthly)}
            </div>
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            تعرفه پایه اکران ماهانه رسمی • روزانه حدود {formatToman(dailyRate)}
          </div>
        </div>

        {/* فرم ثبت رزرو اولیه */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="border-b border-border/80 pb-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>فرم ثبت درخواست رزرو اولیه و قفل سازه</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              پس از ثبت، سازه به مدت ۴۸ ساعت برای برند شما در حالت رزرو موقت قرار می‌گیرد.
            </p>
          </div>

          {/* خطای کلی فرم در صورت وجود */}
          {errors.form && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* انتخاب پریست‌های سریع مدت زمان */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-foreground mb-1.5">
              <span>مدت زمان دوره اکران:</span>
              <span className="text-[11px] text-primary font-bold">
                {toPersianDigits(currentDurationDays)} روز کاری
              </span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleDurationPreset(days)}
                  className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                    selectedDurationPreset === days
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-50 text-slate-700 border-border hover:bg-slate-100"
                  }`}
                >
                  {toPersianDigits(days)} روز
                </button>
              ))}
            </div>
          </div>

          {/* انتخابگر تاریخ شروع و پایان */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تاریخ شروع اکران
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedDurationPreset(0);
                  }}
                  className="w-full rounded-xl border border-border bg-slate-50 px-2.5 py-2 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تاریخ پایان اکران
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedDurationPreset(0);
                  }}
                  className="w-full rounded-xl border border-border bg-slate-50 px-2.5 py-2 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
          {errors.dates && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.dates}</p>
          )}

          {/* نام و نام خانوادگی */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              نام و نام خانوادگی متقاضی <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثلاً: علی رضایی"
                className={`w-full rounded-xl border bg-slate-50 pr-9 pl-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* شماره تلفن همراه */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              شماره تلفن همراه (جهت پیامک رهگیری) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className={`w-full rounded-xl border bg-slate-50 pr-3 pl-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground text-left focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* نام برند / شرکت */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              نام برند یا شرکت تبلیغ‌دهنده <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="مثلاً: اسنپ، کاله، دیجی‌کالا یا شرکت ..."
                className={`w-full rounded-xl border bg-slate-50 pr-9 pl-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.brandName
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.brandName && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.brandName}
              </p>
            )}
          </div>

          {/* توضیحات و نیازمندی‌ها */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              توضیحات و نیازمندی‌های کمپین (اختیاری)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="نیاز به چاپ بنر، طراحی گرافیکی، نورپردازی ویژه یا توضیحات دیگر..."
              className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* فاکتور و برآورد زنده هزینه */}
          <div className="rounded-xl border border-border bg-slate-50/70 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>مدت اکران:</span>
              <span className="font-semibold text-foreground">
                {toPersianDigits(currentDurationDays)} روز
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>تعرفه ناخالص:</span>
              <span>{formatToman(rawTotal)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>تخفیف دوره اکران ({toPersianDigits(discountPercent)}٪):</span>
                <span>- {formatToman(discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between font-bold text-foreground">
              <span>مبلغ برآوردی کل:</span>
              <span className="text-primary font-black text-sm">
                {formatToman(estimatedTotal)}
              </span>
            </div>
          </div>

          {/* دکمه ارسال نهایی CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-black text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ارسال و ثبت در سامانه...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>ثبت درخواست رزرو اولیه</span>
              </>
            )}
          </button>

          {/* اطلاعات امنیتی و ضمانت */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>بدون کسر وجه در این مرحله • قفل رزرو ۴۸ ساعته اختصاصی</span>
          </div>
        </form>
      </div>

      {/* مودال فیدبک موفقیت رزرو (Success Feedback Modal) */}
      {successResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* دکمه بستن */}
            <button
              type="button"
              onClick={() => setSuccessResponse(null)}
              className="absolute top-4 left-4 rounded-lg p-1 text-muted-foreground hover:bg-slate-100 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {/* آیکون و تیتر موفقیت */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-black text-foreground">
                درخواست رزرو اولیه با موفقیت ثبت شد!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                سازه <strong className="text-foreground">{structure.title}</strong> به مدت ۴۸ ساعت برای برند شما در اولویت قرار گرفت.
              </p>
            </div>

            {/* باکس کد رهگیری */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-bold text-emerald-800">
                  کد رهگیری اختصاصی رزرو:
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-900 tracking-wider">
                  {successResponse.trackingCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyTrackingCode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs border border-emerald-300 hover:bg-emerald-100/50"
              >
                {copiedTracking ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>کپی کد</span>
                  </>
                )}
              </button>
            </div>

            {/* جزئیات درخواست رزرو شده */}
            <div className="rounded-xl border border-border bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">کد سازه:</span>
                <span className="font-mono font-bold text-slate-800">{structure.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">متقاضی و برند:</span>
                <span className="font-bold text-slate-800">
                  {successResponse.bookingDetails.fullName} ({successResponse.bookingDetails.brandName})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">دوره اکران انتخابی:</span>
                <span className="font-semibold text-slate-800">
                  {toPersianDigits(successResponse.bookingDetails.durationDays)} روز
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">شماره تماس هماهنگی:</span>
                <span dir="ltr" className="font-mono font-semibold text-slate-800">
                  {successResponse.bookingDetails.phone}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between font-bold text-foreground">
                <span>مبلغ کل برآورد شده:</span>
                <span className="text-primary font-black">
                  {formatToman(successResponse.bookingDetails.totalPrice)}
                </span>
              </div>
            </div>

            {/* مراحل بعدی */}
            <div className="space-y-1.5 text-[11px] text-muted-foreground bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <div className="font-bold text-blue-900 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>مراحل بعدی چیست؟</span>
              </div>
              <p className="leading-relaxed text-blue-800">
                ۱. پیامک تایید با کد رهگیری به شماره شما ارسال گردید.
                <br />
                ۲. کارشناس امور اکران جهت تایید نهایی طرح و ارسال پیش‌فاکتور رسمی با شما تماس خواهد گرفت.
              </p>
            </div>

            {/* دکمه‌های اقدام مودال */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`پیش‌فاکتور رسمی رزرو ${successResponse.trackingCode} در سامانه آماده شد.`);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>دانلود پیش‌فاکتور (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessResponse(null)}
                className="flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
