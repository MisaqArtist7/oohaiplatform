"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  LayoutDashboard,
  CalendarCheck,
  Handshake,
  Coins,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Building2,
  Eye,
  Layers,
  TrendingUp,
  Target,
  Users,
  PieChart,
  Plus,
} from "lucide-react";
import LogoutButton from "@/shared/components/LogoutButton";
import { fetchLocations, LocationCity, fetchProposals, ProposalItem } from "@/features/proposals";
import { formatToman, toPersianDigits } from "@/lib/mock-data";

export default function SmartProposalsPage() {
  const router = useRouter();

  // فیلدهای فرم
  const [budget, setBudget] = useState<string>("");
  const [cityId, setCityId] = useState<number | string>(1);
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [scenario, setScenario] = useState<string>("");

  // دریافت لیست شهرها از API /api/v1/locations با توکن احراز هویت
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(true);

  // تب فعال: فرم ایجاد پیشنهاد جدید یا لیست سازه‌های پیشنهادی
  const [activeTab, setActiveTab] = useState<"form" | "structures">("form");

  // لیست پیشنهادات و سازه‌های دریافتی از GET /api/v1/proposals
  const [proposalsList, setProposalsList] = useState<ProposalItem[]>([]);
  const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  // وضعیت ارسال فرم
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successData, setSuccessData] = useState<Record<string, unknown> | null>(null);

  // ۱. بررسی دسترسی نقش مالک رسانه
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

  // ۲. بارگذاری لیست شهرها از /api/v1/locations
  useEffect(() => {
    let isMounted = true;
    async function loadCities() {
      setLoadingCities(true);
      try {
        const list = await fetchLocations();
        if (isMounted && list && list.length > 0) {
          setCities(list);
          setCityId((prev) => {
            const exists = list.some((c) => String(c.id) === String(prev));
            return exists ? prev : list[0].id;
          });
        }
      } catch (err) {
        console.warn("Error loading cities from API:", err);
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    }
    loadCities();
    return () => {
      isMounted = false;
    };
  }, []);

  // ۳. بارگذاری لیست پروپوزال‌ها و سازه‌های پیشنهادی از طریق GET /api/v1/proposals
  const loadProposals = async () => {
    setLoadingProposals(true);
    try {
      const items = await fetchProposals();
      if (items && Array.isArray(items)) {
        setProposalsList(items);
        if (items.length > 0 && !selectedProposalId) {
          setSelectedProposalId(items[0].id);
        }
      }
    } catch (err) {
      console.warn("Error fetching proposals:", err);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchProposals()
      .then((items) => {
        if (isMounted && items && Array.isArray(items)) {
          setProposalsList(items);
          setSelectedProposalId((prev) => prev || (items.length > 0 ? items[0].id : null));
        }
      })
      .catch((err) => {
        console.warn("Error fetching proposals:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingProposals(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scenarioLength = scenario.trim().length;
  const isScenarioValid = scenarioLength >= 20 && scenarioLength <= 5000;

  const formatAmount = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num)) return "";
    return num.toLocaleString("fa-IR") + " تومان";
  };

  // ارسال فرم با متد POST به /api/v1/proposals و سپس فراخوانی مجدد GET /api/v1/proposals
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessData(null);

    // بررسی بودجه
    const numBudget = Number(budget);
    if (budget === "" || isNaN(numBudget) || numBudget < 0) {
      setErrorMessage("لطفاً بودجه را به صورت عددی معتبر و بزرگتر یا مساوی صفر وارد کنید.");
      return;
    }

    // بررسی city_id
    const numCityId = parseInt(String(cityId), 10);
    if (isNaN(numCityId) || numCityId <= 0) {
      setErrorMessage("لطفاً شهر مورد نظر را انتخاب یا شناسه معتبر آن را وارد کنید.");
      return;
    }

    // بررسی سناریو
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
      const selectedCity = cities.find((c) => String(c.id) === String(numCityId));
      const cityName = selectedCity?.name || (isCustomCity ? `شهر ${numCityId}` : "تهران");

      // ۱. ارسال با متد POST به /api/v1/proposals با توکن احراز هویت
      const res = await fetch("/api/v1/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          budget: numBudget,
          city_id: numCityId,
          cityName,
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
      toast.success("پیشنهاد کمپین ثبت شد و سازه‌های هوشمند استخراج گردیدند.");

      // ۲. فراخوانی بلافاصله GET /api/v1/proposals جهت دریافت تازه‌ترین لیست سازه‌های پیشنهادی
      const updatedList = await fetchProposals();
      if (updatedList && updatedList.length > 0) {
        setProposalsList(updatedList);
        // انتخاب جدیدترین پروپوزال ایجاد شده
        const createdItem = data?.data;
        if (createdItem?.id) {
          setSelectedProposalId(createdItem.id);
        } else {
          setSelectedProposalId(updatedList[0].id);
        }
      }

      // تغییر تب به نمایش سازه‌های پیشنهادی
      setActiveTab("structures");
    } catch {
      setErrorMessage("برقراری ارتباط با سرور با خطا مواجه شد. لطفاً اینترنت خود را بررسی کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setBudget("");
    setCityId(cities.length > 0 ? cities[0].id : 1);
    setIsCustomCity(false);
    setScenario("");
    setErrorMessage("");
    setSuccessData(null);
    setActiveTab("form");
  };

  // پروپوزال انتخاب‌شده برای مشاهده سازه‌ها
  const currentProposal =
    proposalsList.find((p) => p.id === selectedProposalId) || proposalsList[0] || null;

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
            href="/mediaOwnerRequest"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Handshake className="h-4 w-4 text-primary" />
            <span>همکاری مالکان</span>
          </Link>

          <Link
            href="/dashboard/proposals"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>پیشنهادهای هوشمند</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span>رزروهای من</span>
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به داشبورد</span>
          </Link>

          <div className="pt-2 border-t border-border/60">
            <LogoutButton className="w-full justify-center" />
          </div>
        </div>
      </aside>

      {/* ── بخش محتوا ── */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* بردکرامب و کنترل‌های هدر */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  داشبورد
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">مشاور هوشمند کمپین (AI Proposals)</span>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span>طراحی سبد رسانه هوشمند و سازه‌های پیشنهادی</span>
              </h1>
            </div>

            {/* سوییچ تب‌ها: فرم ثبت vs سازه‌های پیشنهادی */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "form"
                    ? "bg-white text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ایجاد پیشنهاد جدید</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("structures");
                  loadProposals();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "structures"
                    ? "bg-white text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>سازه‌های پیشنهادی</span>
                {proposalsList.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] text-primary">
                    {toPersianDigits(proposalsList.length)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* تب ۱: فرم ایجاد پیشنهاد هوشمند */}
          {activeTab === "form" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              {/* هدر فرم */}
              <div className="border-b border-border bg-slate-50/50 p-6 sm:p-8">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
                      ارسال سناریو و استعلام سبد رسانه با هوش مصنوعی
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      بودجه، کد شهر و سناریوی کمپین خود را وارد نمایید تا هوش مصنوعی بر اساس ترافیک و بازدهی، بهینه‌ترین سازه‌ها را پیشنهاد دهد.
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

                {/* فیلد ۱: بودجه */}
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
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="مثال: ۵۰۰۰۰۰۰۰ (مبلغ به تومان)"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-muted-foreground text-[11px]">انتخاب سریع:</span>
                    {[50000000, 100000000, 250000000, 500000000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setBudget(String(quick))}
                        className="rounded-lg border border-border bg-slate-50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        {(quick / 1000000).toLocaleString("fa-IR")} م تومان
                      </button>
                    ))}
                  </div>
                </div>

                {/* فیلد ۲: کد شهر (city_id) بارگذاری شده از /api/v1/locations */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="city_id" className="block text-sm font-semibold text-foreground">
                      کد و نام شهر هدف (city_id) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCity(!isCustomCity)}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      {isCustomCity ? "انتخاب از لیست شهرها (/api/v1/locations)" : "ورود شناسه دستی"}
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
                        disabled={loadingCities}
                        onChange={(e) => setCityId(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 cursor-pointer"
                        required
                      >
                        {loadingCities ? (
                          <option value="">در حال دریافت لیست شهرها از سرور...</option>
                        ) : cities.length === 0 ? (
                          <option value="">هیچ شهری یافت نشد</option>
                        ) : (
                          cities.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.province ? `(استان ${c.province})` : ""} - کد: {c.id}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      شناسه شهر به صورت عدد صحیح ارسال می‌شود. (کد جاری: {cityId})
                    </span>
                    {loadingCities && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>در حال دریافت شهرها...</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* فیلد ۳: سناریوی کمپین (scenario) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="scenario" className="block text-sm font-semibold text-foreground">
                      شرح و سناریوی کمپین (scenario) <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs ${
                        scenarioLength > 0 && !isScenarioValid
                          ? "text-red-500 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {toPersianDigits(scenarioLength)} / ۵۰۰۰ کاراکتر (حداقل ۲۰)
                    </span>
                  </div>

                  <textarea
                    id="scenario"
                    rows={4}
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="مخاطبان هدف، اهداف بازاریابی، مناطق مد نظر و هویت برند خود را شرح دهید..."
                    className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
                    required
                  />
                </div>

                {/* دکمه ارسال به /api/v1/proposals */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isScenarioValid || !budget}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>در حال پردازش هوش مصنوعی و واکشی سازه‌ها...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>تحلیل کمپین و استخراج سازه‌های پیشنهادی</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* تب ۲: نمایش سازه‌های پیشنهادی استخراج‌شده از GET /api/v1/proposals */}
          {activeTab === "structures" && (
            <div className="space-y-6">
              {/* سربرگ انتخاب پروپوزال و تازه‌سازی */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    انتخاب طرح و پروپوزال هوشمند:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedProposalId || ""}
                    onChange={(e) => setSelectedProposalId(e.target.value)}
                    disabled={loadingProposals || proposalsList.length === 0}
                    className="rounded-xl border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    {loadingProposals ? (
                      <option value="">در حال دریافت از سرور...</option>
                    ) : proposalsList.length === 0 ? (
                      <option value="">هیچ پیشنهادی ثبت نشده است</option>
                    ) : (
                      proposalsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.city}) - {p.trackingNumber}
                        </option>
                      ))
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={loadProposals}
                    disabled={loadingProposals}
                    title="تازه‌سازی لیست پیشنهادات از سرور"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className={`h-4 w-4 ${loadingProposals ? "animate-spin text-primary" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("form")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>پیشنهاد جدید</span>
                  </button>
                </div>
              </div>

              {/* وضعیت بارگذاری یا خالی بودن */}
              {loadingProposals && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground">
                    در حال فراخوانی لیست سازه‌های پیشنهادی از سرور...
                  </p>
                </div>
              )}

              {!loadingProposals && proposalsList.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4">
                  <Sparkles className="h-10 w-10 text-primary mx-auto" />
                  <h3 className="text-base font-bold text-foreground">
                    هنوز هیچ پروپوزال و سازه پیشنهادی ثبت نشده است
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    می‌توانید با ورود بودجه، شهر و سناریوی کمپین خود در تب «ایجاد پیشنهاد جدید»، سازه‌های پیشنهادی هوش مصنوعی را دریافت نمایید.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("form")}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>تولید اولین پیشنهاد هوشمند</span>
                  </button>
                </div>
              )}

              {/* نمایش مشخصات و سازه‌های پروپوزال جاری */}
              {!loadingProposals && currentProposal && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* کارت خلاصه تحلیل هوش مصنوعی */}
                  <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-white to-indigo-50/40 p-6 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-1">
                          <Sparkles className="h-3 w-3" />
                          <span>تحلیل هوشمند سبد رسانه OOHAI</span>
                        </span>
                        <h2 className="text-lg font-black text-foreground">
                          {currentProposal.title}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                          شهر: {currentProposal.city} (کد: {currentProposal.cityId})
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                          بودجه: {formatToman(currentProposal.budget)}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold">
                          رهگیری: {currentProposal.trackingNumber}
                        </span>
                      </div>
                    </div>

                    {/* تحلیل مخاطب و نرخ دیداری */}
                    {currentProposal.strategy && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="rounded-xl bg-white p-3.5 border border-border/80 space-y-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <Target className="h-3.5 w-3.5 text-primary" />
                            <span>مخاطبان هدف:</span>
                          </span>
                          <p className="text-xs font-semibold text-foreground">
                            {currentProposal.strategy.targetAudience}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3.5 border border-border/80 space-y-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                            <span>ایمپرشن و نرخ بازدید تخمینی:</span>
                          </span>
                          <p className="text-xs font-semibold text-foreground">
                            {currentProposal.strategy.estimatedReach}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3.5 border border-border/80 space-y-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                            <span>خلاصه استراتژی رسانه‌ای:</span>
                          </span>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {currentProposal.strategy.summary}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* بخش لیست سازه‌های پیشنهادی هوش مصنوعی */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span>سازه‌های پیشنهادی منتخب هوش مصنوعی</span>
                        {currentProposal.strategy?.recommendedStructures && (
                          <span className="text-xs font-bold text-muted-foreground">
                            ({toPersianDigits(currentProposal.strategy.recommendedStructures.length)} سازه)
                          </span>
                        )}
                      </h3>
                      <Link
                        href="/structures"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>مشاهده تمام سازه‌های موجود روی نقشه</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* گرید سازه‌ها */}
                    {(!currentProposal.strategy?.recommendedStructures ||
                      currentProposal.strategy.recommendedStructures.length === 0) ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                        هیچ سازه خاصی برای این پیشنهاد ثبت نشده است.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentProposal.strategy.recommendedStructures.map((structure, idx) => (
                          <div
                            key={structure.structureId || idx}
                            className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all space-y-4"
                          >
                            <div className="space-y-2.5">
                              {/* نوع و عنوان سازه */}
                              <div className="flex items-start justify-between gap-2">
                                <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                                  {structure.type}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  #{structure.structureId}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {structure.title}
                              </h4>

                              {/* موقعیت */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="truncate">{structure.location}</span>
                              </div>

                              {/* تحلیل علت انتخاب */}
                              <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 text-right">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-900 mb-1">
                                  <Sparkles className="h-3 w-3 text-amber-600" />
                                  <span>دلیل انتخاب هوش مصنوعی:</span>
                                </span>
                                <p className="text-[11px] text-amber-950/90 leading-relaxed">
                                  {structure.reason}
                                </p>
                              </div>
                            </div>

                            {/* قیمت و دکمه رزرو سازه */}
                            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                              <div>
                                <span className="block text-[10px] text-muted-foreground">
                                  تعرفه ماهانه:
                                </span>
                                <span className="text-xs sm:text-sm font-black text-foreground">
                                  {formatToman(structure.monthlyPrice)}
                                </span>
                              </div>

                              <Link
                                href="/structures"
                                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
                              >
                                <span>رزرو سازه</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* توزیع بودجه رسانه‌ای در صورت وجود */}
                    {currentProposal.strategy?.budgetDistribution && (
                      <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <PieChart className="h-4 w-4 text-primary" />
                          <span>توزیع بهینه بودجه کمپین بر اساس دسته‌بندی رسانه:</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {currentProposal.strategy.budgetDistribution.map((item, i) => (
                            <div
                              key={i}
                              className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800">
                                <span>{item.category}</span>
                                <span className="text-primary font-mono">{toPersianDigits(item.percentage)}%</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                مبلغ: {formatToman(item.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
