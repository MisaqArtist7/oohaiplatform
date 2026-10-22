"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  History,
  TrendingUp,
  Eye,
  CheckCircle2,
  ExternalLink,
  Loader2,
  HelpCircle,
  PieChart,
  Target,
  ChevronLeft,
} from "lucide-react";
import { ProposalItem } from "@/types/client-dashboard";
import { fetchProposals, fetchProposalById, submitNewProposal } from "@/lib/client-api";
import { formatToman, toPersianDigits } from "@/lib/mock-data";
import { initialProposals } from "@/lib/client-dashboard-data";

export default function ProposalsView() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [proposals, setProposals] = useState<ProposalItem[]>(initialProposals);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // فیلدهای فرم پیشنهاد جدید
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState<number>(350000000);
  const [cityId, setCityId] = useState<number>(1);
  const [cityName, setCityName] = useState<string>("تهران");
  const [scenario, setScenario] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // مودال نمایش جزئیات پیشنهاد
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const cities = [
    { id: 1, name: "تهران" },
    { id: 2, name: "مشهد" },
    { id: 3, name: "اصفهان" },
    { id: 4, name: "شیراز" },
    { id: 5, name: "تبریز" },
  ];

  const budgetPresets = [
    { label: "۱۵۰ میلیون", value: 150000000 },
    { label: "۳۰۰ میلیون", value: 300000000 },
    { label: "۵۰۰ میلیون", value: 500000000 },
    { label: "۱ میلیارد", value: 1000000000 },
  ];

  const loadProposals = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchProposals();
      setProposals(data);
    } catch (err) {
      console.error("Error loading proposals:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await fetchProposals();
        if (!ignore && data.length > 0) {
          setProposals(data);
        }
      } catch (err) {
        console.error("Failed to load proposals:", err);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCityChange = (cId: number) => {
    setCityId(cId);
    const found = cities.find((c) => c.id === cId);
    if (found) setCityName(found.name);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!budget || budget <= 0) {
      errs.budget = "بودجه مدنظر را به درستی وارد کنید.";
    }
    if (!scenario.trim() || scenario.trim().length < 15) {
      errs.scenario = "توضیحات و سناریوی کمپین باید حداقل ۱۵ کاراکتر باشد.";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const newProp = await submitNewProposal({
        title: title.trim() || `کمپین تبلیغاتی در ${cityName}`,
        budget,
        city_id: cityId,
        cityName,
        scenario: scenario.trim(),
      });

      // افزودن به لیست و باز کردن خودکار جزئیات پیشنهاد
      setProposals((prev) => [newProp, ...prev]);
      setSelectedProposal(newProp);
      setActiveTab("history");

      // ریست فرم
      setTitle("");
      setScenario("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در پردازش هوش مصنوعی.";
      setFormErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const prop = await fetchProposalById(id);
      if (prop) setSelectedProposal(prop);
    } catch (err) {
      console.error("Error loading detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه و تب‌ها */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>مشاور و پیشنهاد هوشمند کمپین (AI Planner)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            طراحی داده‌محور سبد رسانه بر اساس بودجه، جامعه هدف و معابر پربازده به کمک الگوریتم‌های هوش مصنوعی
          </p>
        </div>

        {/* دکمه‌های سوئیچ تب‌ها */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "new"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-slate-600 hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>ثبت پیشنهاد جدید</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              loadProposals();
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-slate-600 hover:text-foreground"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>تاریخچه درخواست‌ها ({toPersianDigits(proposals.length)})</span>
          </button>
        </div>
      </div>

      {/* تب ۱: فرم ثبت پیشنهاد جدید */}
      {activeTab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ستون فرم */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>مشخصات بودجه و اهداف کمپین تبلیغاتی</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                سیستم بر اساس نرخ جریان ترافیک و مدل‌های یادگیری ماشین، بهینه‌ترین ترکیب بیلبورد و استرابورد را برای شما می‌چیند.
              </p>
            </div>

            {formErrors.form && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {formErrors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* عنوان دلخواه کمپین */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  عنوان یا نام کمپین (اختیاری):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: کمپین فروش تابستانه محصولات در غرب و مرکز تهران"
                  className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* انتخاب بودجه */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-foreground">
                    بودجه کل مدنظر برای دوره اکران: <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-black text-primary font-sans">
                    {formatToman(budget)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {budgetPresets.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setBudget(p.value)}
                      className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                        budget === p.value
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  step="10000000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none"
                />
                {formErrors.budget && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.budget}</p>
                )}
              </div>

              {/* انتخاب شهر هدف */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  شهر یا حوزه جغرافیایی اکران: <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCityChange(c.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all ${
                        cityId === c.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* شرح سناریوی کمپین و مخاطبان */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  سناریو، مخاطب هدف و هدف کمپین: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="مثال: معرفی اپلیکیشن خدمات مالی جدید با تمرکز بر کارکنان شرکت‌ها و اصناف در بزرگراه‌های شلوغ مدرس و همت. مدت زمان مدنظر ۴۵ روز است..."
                  className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>حداقل ۱۵ کاراکتر شامل جزئیات محصول، مخاطب هدف و ترجیحات شما</span>
                  <span>{toPersianDigits(scenario.length)} کاراکتر</span>
                </div>
                {formErrors.scenario && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.scenario}</p>
                )}
              </div>

              {/* دکمه سابمیت */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-xs font-black text-white shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>هوش مصنوعی در حال تحلیل ترافیک و چیدمان سبد رسانه...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>تولید پیشنهاد هوشمند و استراتژی سبد رسانه</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ستون چپ: توضیحات مزایای هوش مصنوعی */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-primary text-xs">
                <Sparkles className="h-4 w-4" />
                <span>مزایای طراحی کمپین با الگوریتم‌های OOHAI:</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>پوشش حداکثری بر اساس داده‌های ترافیک ساعتی و نقشه حرارتی (Heatmap)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>کاهش هزینه‌های هدررفت رسانه‌ای تا ۳۵٪ نسبت به رزرو سنتی</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>تنوع‌بخشی به فرمت‌ها (عرشه پل، بیلبورد و تلویزیون‌های شهری)</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 space-y-2 text-xs text-slate-600 shadow-2xs">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>نیاز به مشاوره اختصاصی دارید؟</span>
              </div>
              <p className="leading-relaxed text-[11px] text-muted-foreground">
                تیم تحلیل داده و کارشناسان تبلیغات محیطی ما آماده پاسخگویی و بازبینی اختصاصی طرح‌های شما هستند.
              </p>
              <div className="pt-2">
                <a
                  href="tel:02188000000"
                  className="font-bold text-primary hover:underline text-xs"
                >
                  تماس مستقیم با واحد برنامه‌ریزی رسانه: ۰۲۱-۸۸۰۰۰۰۰۰
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تب ۲: تاریخچه درخواست‌های ثبت‌شده */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>در حال بارگذاری سوابق کمپین‌ها...</span>
            </div>
          ) : proposals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-3">
              <History className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-bold text-foreground">هنوز پیشنهادی ثبت نشده است</h4>
              <p className="text-xs text-muted-foreground">برای شروع به تب ثبت پیشنهاد جدید بروید.</p>
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white"
              >
                ثبت اولین پیشنهاد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-2xl border border-border bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {prop.trackingNumber}
                      </span>
                      <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-bold">
                        {prop.statusLabel}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {prop.scenario}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span>شهر: <strong>{prop.city}</strong></span>
                      <span>•</span>
                      <span>بودجه: <strong>{formatToman(prop.budget)}</strong></span>
                      <span>•</span>
                      <span>تاریخ: {prop.createdAt}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      تحلیل هوشمند سبد رسانه آماده است
                    </span>

                    <button
                      type="button"
                      disabled={loadingDetail}
                      onClick={() => handleOpenDetail(prop.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {loadingDetail ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      <span>مشاهده استراتژی و سبد سازه‌ها</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* مودال مشاهده جزئیات استراتژی پیشنهاد هوش مصنوعی (Proposal Detail Modal) */}
      {selectedProposal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-border space-y-5 animate-in zoom-in-95 duration-200 text-right scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر مودال */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedProposal.trackingNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>تحلیل داده‌محور هوش مصنوعی</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {selectedProposal.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* خلاصه استراتژی و ایمپرشن */}
            {selectedProposal.strategy && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    <span>خلاصه برنامه استراتژیک رسانه:</span>
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {selectedProposal.strategy.summary}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-primary/10 text-xs">
                    <div>
                      <span className="text-muted-foreground">مخاطبان هدف: </span>
                      <strong className="text-slate-800">{selectedProposal.strategy.targetAudience}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">نرخ رویت تخمینی: </span>
                      <strong className="text-primary">{selectedProposal.strategy.estimatedReach}</strong>
                    </div>
                  </div>
                </div>

                {/* سبد سازه‌های پیشنهادی هوش مصنوعی */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>سازه‌های منتخب در سبد رسانه‌ای این کمپین:</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedProposal.strategy.recommendedStructures.map((s, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{s.title}</span>
                            <span className="rounded bg-white border border-slate-200 px-1.5 py-0.2 text-[10px] text-slate-600">
                              {s.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            موقعیت: {s.location} • دلیل انتخاب: <span className="text-slate-700">{s.reason}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="font-bold text-slate-900 font-sans">
                            {formatToman(s.monthlyPrice)}
                          </span>
                          <Link
                            href={`/structures/${s.structureId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                          >
                            <span>مشاهده سازه</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* توزیع بودجه */}
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <PieChart className="h-4 w-4 text-primary" />
                    <span>نحوه تخصیص بهینه بودجه ({formatToman(selectedProposal.budget)}):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedProposal.strategy.budgetDistribution.map((b, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-white p-3 text-xs space-y-1"
                      >
                        <div className="text-muted-foreground">{b.category}</div>
                        <div className="text-sm font-bold text-foreground font-sans">
                          {formatToman(b.amount)} ({toPersianDigits(b.percentage)}٪)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* فوتر مودال */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/structures"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
              >
                <span>مشاهده این سازه‌ها روی نقشه</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-xs text-muted-foreground hover:underline"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
