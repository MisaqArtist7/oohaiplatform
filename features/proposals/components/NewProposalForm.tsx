"use client";

import React, { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  Coins,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  History,
} from "lucide-react";
import { useCreateProposal } from "../hooks/useProposals";
import {
  createProposalSchema,
  CreateProposalFormValues,
} from "../schemas/proposal.schema";
import { CityCascader } from "@/features/locations";
import { formatTomanDirect } from "@/shared/lib/money";
import { toPersianDigits, toEnglishDigits } from "@/shared/lib/digits";
import { ApiError } from "@/shared/lib/errors";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

// ثابت‌های دکمه‌های میانبر برای راحتی کاربر در پر کردن فیلد بودجه
const BUDGET_PRESETS = [
  { label: "۵۰ میلیون", value: 50_000_000 },
  { label: "۱۰۰ میلیون", value: 100_000_000 },
  { label: "۲۰۰ میلیون", value: 200_000_000 },
  { label: "۵۰۰ میلیون", value: 500_000_000 },
] as const;

export default function NewProposalForm() {
  const budgetInputId = useId();
  const scenarioInputId = useId();

  const createProposalMutation = useCreateProposal();

  // وضعیت ثانیه‌شمار خطای محدودیت فراخوانی (Rate Limit - 429)
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProposalFormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      budgetToman: "",
      city_id: 1, // تهران به عنوان پیش‌فرض اولیه
      scenario: "",
    },
  });

  const watchBudget = watch("budgetToman");
  const watchCityId = watch("city_id");
  const watchScenario = watch("scenario") || "";

  // مدیریت شمارش معکوس در صورت دریافت خطای ۴۲۹ با مقدار retryAfter
  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;

    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryCountdown]);

  // محاسبه مبلغ تمیزشده جهت نمایش زنده فارسی
  const rawBudgetClean = toEnglishDigits(String(watchBudget || "")).replace(/,/g, "").trim();
  const numericBudget = Number(rawBudgetClean);
  const isValidNumericBudget = !isNaN(numericBudget) && numericBudget > 0;

  // کاراکترهای سناریو پس از trim برای شمارنده زنده
  const scenarioLength = watchScenario.trim().length;

  const onSubmit = async (values: CreateProposalFormValues) => {
    if (isSubmitting || createProposalMutation.isPending || (retryCountdown !== null && retryCountdown > 0)) {
      return;
    }

    const cleanBudgetString = toEnglishDigits(values.budgetToman).replace(/,/g, "").trim();
    const finalBudgetToman = Number(cleanBudgetString);

    try {
      await createProposalMutation.mutateAsync({
        budgetToman: finalBudgetToman,
        cityId: values.city_id,
        scenario: values.scenario, // ارسال متن اصلی بدون تغییر
      });

      toast.success("سناریوی کمپین با موفقیت ثبت شد و در حال پردازش است.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // مدیریت خطای ۴۲۲ اعتبارسنجی سرور و نگاشت کلید budget به budgetToman
        if (err.isValidation && err.fieldErrors) {
          if (err.fieldErrors.budget) {
            const msg = Array.isArray(err.fieldErrors.budget)
              ? err.fieldErrors.budget.join("، ")
              : String(err.fieldErrors.budget);
            setError("budgetToman", { type: "server", message: msg });
          }
          if (err.fieldErrors.city_id) {
            const msg = Array.isArray(err.fieldErrors.city_id)
              ? err.fieldErrors.city_id.join("، ")
              : String(err.fieldErrors.city_id);
            setError("city_id", { type: "server", message: msg });
          }
          if (err.fieldErrors.scenario) {
            const msg = Array.isArray(err.fieldErrors.scenario)
              ? err.fieldErrors.scenario.join("، ")
              : String(err.fieldErrors.scenario);
            setError("scenario", { type: "server", message: msg });
          }
          toast.error("لطفاً خطاهای مشخص‌شده در فرم سناریو را بررسی فرمایید.");
          return;
        }

        // مدیریت خطای ۴۲۹ با خواندن retryAfter پویا از پاسخ سرور
        if (err.isRateLimited) {
          toast.error("تعداد درخواست‌های شما از حد مجاز گذشته است.");
          if (typeof err.retryAfter === "number" && err.retryAfter > 0) {
            setRetryCountdown(err.retryAfter);
          }
          return;
        }

        toast.error(err.message || "خطا در ثبت سناریوی کمپین");
        return;
      }

      const msg = err instanceof Error ? err.message : "خطایی در برقراری ارتباط رخ داد.";
      toast.error(msg);
    }
  };

  const isPending = isSubmitting || createProposalMutation.isPending;
  const isButtonDisabled = isPending || (retryCountdown !== null && retryCountdown > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* سربرگ ناوبری و عنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/client/proposals"
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="بازگشت به تاریخچه پیشنهادات"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>ثبت سناریوی هوشمند کمپین تبلیغاتی</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              سناریو و اهداف تبلیغاتی خود را شرح دهید تا هوش مصنوعی بهینه‌ترین سازه‌ها را پیشنهاد دهد.
            </p>
          </div>
        </div>

        <Link
          href="/client/proposals"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all self-start sm:self-auto"
        >
          <History className="h-4 w-4 text-muted-foreground" />
          <span>تاریخچه استعلام‌ها</span>
        </Link>
      </div>

      {/* اعلان خطای ۴۲۹ در صورت فعال بودن شمارش معکوس */}
      {retryCountdown !== null && retryCountdown > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-4 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 animate-pulse" />
          <div>
            <p className="font-bold">تعداد درخواست‌های شما از حد مجاز گذشته است.</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              امکان ارسال مجدد تا {toPersianDigits(retryCountdown)} ثانیه دیگر فعال خواهد شد.
            </p>
          </div>
        </div>
      )}

      {/* بدنه فرم */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6 text-right"
      >
        {/* ۱. فیلد بودجه و میانبرهای سریع */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={budgetInputId}
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <Coins className="h-4 w-4 text-primary" />
              <span>بودجه کمپین (تومان) *</span>
            </label>
            {isValidNumericBudget && (
              <span className="text-xs font-black text-primary">
                {formatTomanDirect(numericBudget)}
              </span>
            )}
          </div>

          <Input
            id={budgetInputId}
            type="text"
            dir="ltr"
            placeholder="مثال: 200000000"
            {...register("budgetToman")}
            className="font-mono text-left text-sm h-11"
          />

          {/* دکمه‌های میانبر انتخاب سریع بودجه */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-muted-foreground font-medium">
              مبالغ پرکاربرد:
            </span>
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setValue("budgetToman", String(preset.value), {
                    shouldValidate: true,
                  });
                }}
                className="rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/50 hover:text-primary px-2.5 py-1 text-[11px] font-bold text-foreground transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {errors.budgetToman && (
            <p className="mt-1 text-[11px] text-destructive font-bold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.budgetToman.message}</span>
            </p>
          )}
        </div>

        {/* ۲. انتخاب استان و شهر با استفاده از کامپوننت آبشاری */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>موقعیت هدف (استان و شهر) *</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              شناسه انتخابی: {toPersianDigits(watchCityId)}
            </span>
          </div>

          <CityCascader
            selectedCityId={watchCityId}
            onCitySelect={(city, province) => {
              // اگر شهر انتخاب شده همان، وگرنه اگر استان فرزند ندارد یا کاربر فقط استان انتخاب کرده شناسه استان
              const targetId = city?.id || province?.id || 0;
              setValue("city_id", targetId, { shouldValidate: true });
            }}
          />

          {errors.city_id && (
            <p className="mt-1 text-[11px] text-destructive font-bold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.city_id.message}</span>
            </p>
          )}
        </div>

        {/* ۳. شرح سناریو و اهداف کمپین */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <label
              htmlFor={scenarioInputId}
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>سناریو و اهداف بازاریابی کمپین *</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                scenarioLength < 20 || scenarioLength > 5000
                  ? "text-destructive font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {toPersianDigits(scenarioLength)} / ۵۰۰۰
            </span>
          </div>

          <Textarea
            id={scenarioInputId}
            rows={5}
            placeholder="نوع محصول یا خدمت، گروه مخاطبان، معابر مورد نظر یا مسیرهای تردد و نوع تاثیرگذاری مد نظر را به طور دقیق شرح دهید (حداقل ۲۰ کاراکتر)..."
            {...register("scenario")}
            className="text-xs leading-relaxed"
          />

          <p className="text-[11px] text-muted-foreground">
            حداقل ۲۰ کاراکتر و حداکثر ۵۰۰۰ کاراکتر. هر چه سناریوی واردشده دقیق‌تر باشد، سازه‌های پیشنهادی تطابق بهتری خواهند داشت.
          </p>

          {errors.scenario && (
            <p className="mt-1 text-[11px] text-destructive font-bold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.scenario.message}</span>
            </p>
          )}
        </div>

        {/* ۴. دکمه ارسال و راهنما */}
        <div className="pt-4 border-t border-border space-y-2">
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full h-12 text-sm font-bold shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                <span>در حال تحلیل و ارسال سناریو...</span>
              </>
            ) : retryCountdown !== null && retryCountdown > 0 ? (
              <span>امکان ارسال تا {toPersianDigits(retryCountdown)} ثانیه دیگر</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>شروع تحلیل و پیشنهاد سازه‌ها</span>
              </span>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            پردازش ممکن است چند دقیقه طول بکشد.
          </p>
        </div>
      </form>
    </div>
  );
}
