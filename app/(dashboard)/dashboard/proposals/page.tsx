"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  LayoutDashboard,
  CalendarCheck,
  Handshake,
  Coins,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const CITIES = [
  { id: 1, name: "تهران" },
  { id: 2, name: "مشهد" },
  { id: 3, name: "اصفهان" },
  { id: 4, name: "شیراز" },
  { id: 5, name: "کرج" },
  { id: 6, name: "تبریز" },
  { id: 7, name: "اهواز" },
  { id: 8, name: "قم" },
  { id: 9, name: "رشت" },
  { id: 10, name: "کرمانشاه" },
];

export default function SmartProposalsPage() {
  const [budget, setBudget] = useState<string>("");
  const [cityId, setCityId] = useState<number | string>(1);
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [scenario, setScenario] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successData, setSuccessData] = useState<Record<string, unknown> | null>(null);

  const scenarioLength = scenario.trim().length;
  const isScenarioValid = scenarioLength >= 20 && scenarioLength <= 5000;

  const formatAmount = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num)) return "";
    return num.toLocaleString("fa-IR") + " تومان";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessData(null);

    // ۱. بررسی budget
    const numBudget = Number(budget);
    if (budget === "" || isNaN(numBudget) || numBudget < 0) {
      setErrorMessage("لطفاً بودجه را به صورت عددی معتبر و بزرگتر یا مساوی صفر وارد کنید.");
      return;
    }

    // ۲. بررسی city_id
    const numCityId = parseInt(String(cityId), 10);
    if (isNaN(numCityId) || numCityId <= 0) {
      setErrorMessage("لطفاً شهر مورد نظر را انتخاب یا شناسه معتبر آن را وارد کنید.");
      return;
    }

    // ۳. بررسی scenario
    const trimmedScenario = scenario.trim();
    if (trimmedScenario.length < 20) {
      setErrorMessage("سناریوی کمپین باید حداقل شامل ۲۰ کاراکتر باشد.");
      return;
    }
    if (trimmedScenario.length > 5000) {
      setErrorMessage("طول سناریو نمی‌تواند بیش از ۵۰۰۰ کاراکتر باشد.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          budget: numBudget,
          city_id: numCityId,
          scenario: trimmedScenario,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(
          data?.message || data?.error || "خطایی در ثبت پیشنهاد هوشمند رخ داد."
        );
        return;
      }

      setSuccessData(data || { success: true });
    } catch {
      setErrorMessage("برقراری ارتباط با سرور با خطا مواجه شد. لطفاً اینترنت خود را بررسی کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setBudget("");
    setCityId(1);
    setIsCustomCity(false);
    setScenario("");
    setErrorMessage("");
    setSuccessData(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 lg:flex">
      {/* ── سایدبار ── */}
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
            href="/dashboard/proposals"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
          >
            <Sparkles className="h-4 w-4" />
            <span>پیشنهادهای هوشمند</span>
          </Link>

          <Link
            href="/mediaOwnerRequest"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Handshake className="h-4 w-4" />
            <span>همکاری مالکان</span>
          </Link>

          <span
            aria-disabled="true"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>رزروهای من</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">به‌زودی</span>
          </span>
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به داشبورد</span>
          </Link>
        </div>
      </aside>

      {/* ── بخش محتوا ── */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* بردکرامب */}
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                داشبورد
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">پیشنهادهای هوشمند (AI Proposals)</span>
            </nav>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>بازگشت به داشبورد</span>
            </Link>
          </div>

          {/* کارت وضعیت ثبت موفق */}
          {successData ? (
            <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">
                  پیشنهاد هوشمند کمپین با موفقیت ایجاد شد
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                  سناریو و بودجه کمپین شما توسط هوش مصنوعی پردازش شد و پیشنهادات مناسب استخراج گردید.
                </p>

                {/* نمایش داده‌های برگشتی در صورت وجود */}
                <div className="mt-6 w-full rounded-xl border border-border bg-slate-50 p-4 text-right text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">بودجه درخواستی:</span>
                    <span className="font-semibold text-foreground">
                      {Number(budget).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">شناسه شهر (city_id):</span>
                    <span className="font-semibold text-foreground">{cityId}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground mb-1">سناریوی کمپین:</span>
                    <p className="rounded-lg bg-white p-2.5 text-foreground leading-relaxed border border-border/80">
                      {scenario}
                    </p>
                  </div>
                  {Boolean(successData?.data) && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <span className="block font-semibold text-primary mb-1">نتیجه تحلیل هوشمند:</span>
                      <pre className="overflow-x-auto rounded-lg bg-slate-100 p-2 text-[11px] text-slate-800">
                        {JSON.stringify(successData.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span>بازگشت به داشبورد</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>تولید پیشنهاد جدید</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* کارت فرم پیشنهاد هوشمند */
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              {/* هدر فرم */}
              <div className="border-b border-border bg-slate-50/50 p-6 sm:p-8">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
                      ایجاد پیشنهاد هوشمند تبلیغات محیطی
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      با وارد کردن بودجه، شهر و شرح سناریوی کمپین، بهترین ترکیب سازه‌های تبلیغاتی توسط هوش مصنوعی پیشنهاد می‌شود.
                    </p>
                  </div>
                </div>
              </div>

              {/* بدنه فرم */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* فیلد ۱: budget */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="budget" className="block text-sm font-semibold text-foreground">
                      بودجه کمپین (budget) <span className="text-red-500">*</span>
                    </label>
                    {budget && !isNaN(Number(budget)) && (
                      <span className="text-xs font-medium text-primary">
                        {formatAmount(budget)}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                    </div>
                    <input
                      id="budget"
                      type="number"
                      min="0"
                      step="any"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="مثال: ۵۰۰۰۰۰۰۰ (حداقل ۰)"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-muted-foreground text-[11px]">انتخاب سریع:</span>
                    {[20000000, 50000000, 100000000, 300000000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setBudget(String(quick))}
                        className="rounded-lg border border-border bg-slate-50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {(quick / 1000000).toLocaleString("fa-IR")} م
                      </button>
                    ))}
                  </div>
                </div>

                {/* فیلد ۲: city_id */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="city_id" className="block text-sm font-semibold text-foreground">
                      شهر هدف (city_id) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCity(!isCustomCity)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {isCustomCity ? "انتخاب از لیست شهرها" : "ورود شناسه دستی (کد عدد)"}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>

                    {isCustomCity ? (
                      <input
                        id="city_id"
                        type="number"
                        min="1"
                        step="1"
                        value={cityId}
                        onChange={(e) => setCityId(e.target.value)}
                        placeholder="شناسه عددی شهر (مثال: 1)"
                        className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    ) : (
                      <select
                        id="city_id"
                        value={cityId}
                        onChange={(e) => setCityId(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        {CITIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (کد: {c.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    شناسه شهر به صورت عدد صحیح ارسال می‌شود. (کد جاری: {cityId})
                  </p>
                </div>

                {/* فیلد ۳: scenario */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="scenario" className="block text-sm font-semibold text-foreground">
                      شرح و سناریوی کمپین (scenario) <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-semibold ${
                        isScenarioValid
                          ? "text-emerald-600"
                          : scenarioLength > 0
                          ? "text-amber-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {scenarioLength.toLocaleString("fa-IR")} / ۵,۰۰۰ کاراکتر
                      {scenarioLength > 0 && scenarioLength < 20 && (
                        <span className="mr-1 text-[11px] text-amber-600">
                          (حداقل ۲۰ کاراکتر)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute top-3 right-0 flex items-center pr-3.5 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <textarea
                      id="scenario"
                      rows={5}
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      placeholder="اهداف کمپین، جامعه هدف، نوع کسب‌وکار، اولویت‌های مکانی و ویژگی‌های سازه مورد نظر خود را بنویسید (حداقل ۲۰ و حداکثر ۵۰۰۰ کاراکتر)..."
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                      minLength={20}
                      maxLength={5000}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    هرچه سناریوی ارائه‌شده دقیق‌تر باشد، خروجی الگوریتم‌های هوش مصنوعی سازگارتر و بهینه‌تر خواهد بود.
                  </p>
                </div>

                {/* دکمه‌های اقدام */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    انصراف
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isScenarioValid || budget === ""}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>در حال تحلیل و ارسال به AI...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>دریافت پیشنهاد هوشمند</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
