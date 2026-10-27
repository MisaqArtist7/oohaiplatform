"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  MapPin,
  User as UserIcon,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Edit3,
  type LucideIcon,
} from "lucide-react";
import {
  apiRegister,
  apiRequestOtp,
  apiVerifyOtp,
  maskPhone,
  toFaDigits,
} from "../api/auth.api";
import { toEnglishDigits } from "@/shared/lib/digits";
import { PinInput } from "./PinInput";
import { useToast } from "@/shared/components/Toast";
import { useSession, SESSION_QUERY_KEY } from "../hooks/use-session";
import { getRedirectDestination } from "../lib/get-home-path";
import type { AuthMode } from "../types";

const RESEND_COOLDOWN_SECONDS = 120; // ۲ دقیقه پیش‌فرض شمارش معکوس ارسال مجدد

const phoneValidationSchema = z
  .string()
  .transform((val) => toEnglishDigits(val).trim())
  .pipe(
    z
      .string()
      .min(1, "شماره موبایل الزامی است.")
      .regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم باشد و با 09 شروع شود (مثال: 09123456789).")
  );

const registerValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "نام و نام خانوادگی الزامی است.")
    .min(3, "نام باید حداقل ۳ کاراکتر باشد.")
    .max(50, "نام نباید بیشتر از ۵۰ کاراکتر باشد."),
  phone: phoneValidationSchema,
});

const features: {
  icon: LucideIcon;
  color: string;
  title: string;
  text: string;
}[] = [
  {
    icon: Sparkles,
    color: "bg-indigo-500/20 text-indigo-300",
    title: "مشاوره کمپین با هوش مصنوعی",
    text: "تحلیل هوشمند پرسونای مخاطب، بودجه و پیشنهاد بهترین موقعیت‌های شهری",
  },
  {
    icon: TrendingUp,
    color: "bg-cyan-500/20 text-cyan-300",
    title: "تحلیل داده‌محور ترافیک",
    text: "بررسی زاویه دید، تخمین نرخ تردد روزانه و عکس‌های ۳۶۰ درجه میدانی",
  },
  {
    icon: CheckCircle2,
    color: "bg-emerald-500/20 text-emerald-300",
    title: "رزرو آنی و قفل ۴۸ ساعته",
    text: "قفل آنلاین و بدون تداخل سازه به مدت ۴۸ ساعت بدون نیاز به واسطه",
  },
];

interface AuthCardProps {
  initialMode?: AuthMode;
}

export function AuthCard({ initialMode = "login" }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { user: currentSessionUser, isAuthenticated } = useSession();

  // در صورتی که کاربر قبلاً لاگین کرده باشد، فوراً به مقصد نقشش ریدایرکت شود
  useEffect(() => {
    if (isAuthenticated && currentSessionUser) {
      const nextParam = searchParams.get("next") || searchParams.get("return_to");
      const targetUrl = getRedirectDestination(currentSessionUser.role, nextParam);
      router.replace(targetUrl);
    }
  }, [isAuthenticated, currentSessionUser, router, searchParams]);

  // دریافت شماره از query params (برای صفحه verify-otp) بدون استفاده از sessionStorage
  const queryPhone = searchParams.get("phone") || "";

  // وضعیت تب فعال: 'login' | 'register' | 'verify'
  const [mode, setMode] = useState<AuthMode>(() => {
    if (initialMode === "verify") {
      return "verify";
    }
    return initialMode;
  });

  const [previousMode, setPreviousMode] = useState<"login" | "register">("login");

  // فیلدهای فرم
  const [phone, setPhone] = useState(queryPhone);
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");

  // خطاهای سرور و فیلدها
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // وضعیت لودینگ
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // تایمر معکوس برای ارسال مجدد (۱۲۰ ثانیه پیش‌فرض)
  const [cooldown, setCooldown] = useState(0);

  // شمارنده معکوس ارسال مجدد پیامک
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // ریست کردن خطاها با تغییر فیلدها
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    setGeneralError(null);
  };

  // تغییر مد و به‌روزرسانی تاریخچه مرورگر
  const switchMode = (newMode: AuthMode, targetPhone?: string) => {
    setFieldErrors({});
    setGeneralError(null);
    setOtp("");
    setMode(newMode);

    const nextParam = searchParams.get("next") || searchParams.get("return_to");
    const nextQuery = nextParam ? `&next=${encodeURIComponent(nextParam)}` : "";

    if (newMode === "login") {
      router.push(`/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`);
    } else if (newMode === "register") {
      router.push(`/register${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`);
    } else if (newMode === "verify") {
      const ph = targetPhone || phone;
      router.push(`/verify-otp?phone=${encodeURIComponent(toEnglishDigits(ph))}${nextQuery}`);
    }
  };

  // ۱. هندلر ورود (درخواست کد تایید)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = phoneValidationSchema.safeParse(phone);
    if (!parseResult.success) {
      setFieldErrors({ phone: parseResult.error.issues[0].message });
      return;
    }
    const cleanPhone = parseResult.data;

    setIsLoading(true);
    setFieldErrors({});
    setGeneralError(null);

    const result = await apiRequestOtp({ phone: cleanPhone });

    setIsLoading(false);

    if (!result.ok) {
      if (result.status === 429) {
        const retrySecs = result.retryAfter && result.retryAfter > 0 ? result.retryAfter : RESEND_COOLDOWN_SECONDS;
        setCooldown(retrySecs);
        const msg = result.retryAfter
          ? `تعداد درخواست‌ها زیاد است. لطفاً ${retrySecs} ثانیه دیگر مجدداً تلاش کنید.`
          : "تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید.";
        toast.error(msg);
        setGeneralError(msg);
        return;
      }
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      setGeneralError(result.errorMessage);
      toast.error(result.errorMessage || "ارسال کد با خطا مواجه شد.");
      return;
    }

    setPreviousMode("login");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success(result.data?.message || "کد تأیید برای شما پیامک شد.");
    switchMode("verify", cleanPhone);
  };

  // ۲. هندلر ثبت‌نام (ثبت‌نام + ارسال خودکار OTP)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = registerValidationSchema.safeParse({ name, phone });
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    const cleanPhone = parseResult.data.phone;
    const cleanName = parseResult.data.name;

    setIsLoading(true);
    setFieldErrors({});
    setGeneralError(null);

    // ۱. ارسال درخواست ثبت‌نام
    const regResult = await apiRegister({ name: cleanName, phone: cleanPhone });

    if (!regResult.ok) {
      setIsLoading(false);
      if (regResult.fieldErrors) {
        setFieldErrors(regResult.fieldErrors);
      }
      setGeneralError(regResult.errorMessage);
      toast.error(regResult.errorMessage || "ثبت‌نام با خطا مواجه شد.");
      return;
    }

    // ۲. طبق مشخصات، پاسخ موفق (۲۰۱) شامل next_step: "request_otp" است؛ بلافاصله خودکار کد درخواست می‌شود
    const otpResult = await apiRequestOtp({ phone: cleanPhone });
    setIsLoading(false);

    if (!otpResult.ok) {
      if (otpResult.status === 429) {
        const retrySecs = otpResult.retryAfter && otpResult.retryAfter > 0 ? otpResult.retryAfter : RESEND_COOLDOWN_SECONDS;
        setCooldown(retrySecs);
      }
      setPreviousMode("register");
      switchMode("verify", cleanPhone);
      toast.error(otpResult.errorMessage || "ثبت‌نام انجام شد؛ لطفاً ارسال مجدد کد را بزنید.");
      return;
    }

    setPreviousMode("register");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success("ثبت‌نام موفق! کد تأیید پیامک شد.");
    switchMode("verify", cleanPhone);
  };

  // ۳. هندلر تایید کد یکبار مصرف (PinInput ۵ رقمی)
  const handleVerifySubmit = useCallback(
    async (codeToVerify?: string) => {
      const code = toEnglishDigits(codeToVerify || otp).trim();
      const cleanPhone = toEnglishDigits(phone).trim();

      if (!code || code.length < 5) {
        setFieldErrors({ otp: "لطفاً کد تأیید ۵ رقمی را کامل وارد کنید." });
        return;
      }

      setIsLoading(true);
      setFieldErrors({});
      setGeneralError(null);

      const result = await apiVerifyOtp({ phone: cleanPhone, otp: code });

      setIsLoading(false);

      if (!result.ok) {
        // خطای ۴۲۲ کد نادرست/منقضی: ورودی را خالی و پیام را زیر آن نمایش می‌دهیم
        setOtp("");
        const errorMsg = result.fieldErrors?.otp || result.message || "کد تأیید نادرست یا منقضی شده است.";
        setFieldErrors({ otp: errorMsg });
        setGeneralError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("ورود با موفقیت انجام شد.");

      // رفرش سشن در React Query
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });

      // هدایت به پارامتر next (در صورت معتبر بودن و جلوگیری از open redirect) وگرنه مقصد جدول نقش
      const nextParam = searchParams.get("next") || searchParams.get("return_to");
      const targetUrl = getRedirectDestination(result.user?.role, nextParam);

      startTransition(() => {
        router.replace(targetUrl);
        router.refresh();
      });
    },
    [otp, phone, router, searchParams, toast, queryClient]
  );

  // ۴. ارسال مجدد کد
  const handleResendOtp = async () => {
    const cleanPhone = toEnglishDigits(phone).trim();
    if (!cleanPhone || cooldown > 0 || isResending) return;

    setIsResending(true);
    setGeneralError(null);
    setFieldErrors({});

    const result = await apiRequestOtp({ phone: cleanPhone });

    setIsResending(false);

    if (!result.ok) {
      if (result.status === 429) {
        const retrySecs = result.retryAfter && result.retryAfter > 0 ? result.retryAfter : RESEND_COOLDOWN_SECONDS;
        setCooldown(retrySecs);
        const msg = result.retryAfter
          ? `تعداد درخواست‌ها زیاد است. لطفاً ${retrySecs} ثانیه دیگر تلاش کنید.`
          : "تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید.";
        toast.error(msg);
        setGeneralError(msg);
        return;
      }
      toast.error(result.errorMessage || "ارسال مجدد پیامک ناموفق بود.");
      setGeneralError(result.errorMessage);
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
    setOtp("");
    toast.success(result.data?.message || "کد تأیید جدید با موفقیت ارسال شد.");
  };

  // فرمت دقیقه و ثانیه (مثلاً ۰۱:۴۵)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const str = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return toFaDigits(str);
  };

  // استایل یکپارچه اینپوت‌ها
  const inputClass = (hasError: boolean) =>
    `w-full py-3.5 px-4 rounded-xl border text-sm transition-all text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-4 ${
      hasError
        ? "border-danger bg-danger/5 focus:border-danger focus:ring-danger/20"
        : "border-border bg-muted/40 focus:bg-background focus:border-primary focus:ring-primary/20"
    }`;

  return (
    <div
      dir="rtl"
      className="relative min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-hidden"
    >
      {/* هاله و پس‌زمینه نئونی ملایم */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-140 w-140 rounded-full bg-violet-400/5 blur-[120px]"
      />

      <div className="relative w-full max-w-5xl rounded-3xl bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-indigo-950/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* ستون اصلی فرم (۷ ستون در دسکتاپ) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* نوار بالایی و لینک بازگشت */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <span>بازگشت به صفحه اصلی</span>
              </Link>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  بیلبورد<span className="text-primary">مارکت</span>
                </span>
              </div>
            </div>

            {/* نشانگر بالای فرم */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>اتوماسیون تبلیغات محیطی • احراز هویت سریع و بدون کلمه عبور</span>
              </div>

              {mode === "login" && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
                    ورود به حساب کاربری
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    شماره موبایل خود را وارد کنید تا کد تأیید یکبار مصرف پیامک شود.
                  </p>
                </>
              )}

              {mode === "register" && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
                    ثبت‌نام در بیلبورد مارکت
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    جهت دسترسی به کاتالوگ سازه‌ها، رزرو آنلاین و مشاوره هوش مصنوعی ثبت‌نام کنید.
                  </p>
                </>
              )}

              {mode === "verify" && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
                    تأیید شماره و ورود
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    کد ۵ رقمی ارسال‌شده به شماره همراه زیر را وارد نمایید.
                  </p>
                </>
              )}
            </div>

            {/* سوییچر تب‌ها در حالت لاگین یا ثبت‌نام */}
            {mode !== "verify" && (
              <div className="flex p-1 mb-6 rounded-2xl bg-muted/70 border border-border/80">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === "login"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ورود با کد یکبار مصرف
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === "register"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ثبت‌نام کاربر جدید
                </button>
              </div>
            )}

            {/* خطای کلی سرور در صورت وجود */}
            {generalError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger leading-relaxed animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            {/* ۱. فرم ورود */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="login-phone"
                    className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>شماره موبایل</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      کد تأیید پیامک می‌شود
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="login-phone"
                      type="tel"
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="09123456789"
                      value={phone}
                      onChange={(e) => {
                        clearFieldError("phone");
                        setPhone(e.target.value);
                      }}
                      className={`${inputClass(Boolean(fieldErrors.phone))} pr-10 pl-20 text-left font-medium tracking-wide`}
                    />
                    <span
                      dir="ltr"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
                    >
                      +۹۸ ایران
                    </span>
                  </div>
                  {fieldErrors.phone && (
                    <p
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-danger mt-0.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full mt-2 cursor-pointer bg-linear-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 enabled:active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ارسال کد تأیید...</span>
                    </>
                  ) : (
                    <>
                      <span>دریافت کد تایید یکبار مصرف</span>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    حساب کاربری ندارید؟{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      ثبت‌نام کنید
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ۲. فرم ثبت‌نام */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                {/* فیلد نام */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reg-name"
                    className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>نام و نام خانوادگی</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      (حداقل ۳ کاراکتر)
                    </span>
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      placeholder="مثال: علی رضایی"
                      value={name}
                      onChange={(e) => {
                        clearFieldError("name");
                        setName(e.target.value);
                      }}
                      className={`${inputClass(Boolean(fieldErrors.name))} pr-10 pl-4`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-danger mt-0.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* فیلد شماره موبایل */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reg-phone"
                    className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>شماره موبایل</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      کد تأیید پیامک می‌شود
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="reg-phone"
                      type="tel"
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="09123456789"
                      value={phone}
                      onChange={(e) => {
                        clearFieldError("phone");
                        setPhone(e.target.value);
                      }}
                      className={`${inputClass(Boolean(fieldErrors.phone))} pr-10 pl-20 text-left font-medium tracking-wide`}
                    />
                    <span
                      dir="ltr"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
                    >
                      +۹۸ ایران
                    </span>
                  </div>
                  {fieldErrors.phone && (
                    <p
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-danger mt-0.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full mt-2 cursor-pointer bg-linear-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 enabled:active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ثبت‌نام و ارسال پیامک...</span>
                    </>
                  ) : (
                    <>
                      <span>ثبت‌نام و دریافت کد</span>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-muted-foreground">
                    قبلاً ثبت‌نام کرده‌اید؟{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      وارد شوید
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ۳. مرحله تایید کد یکبار مصرف (Verify OTP) */}
            {mode === "verify" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* باکس شماره موبایل و دکمه ویرایش */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/60 border border-border/80">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-muted-foreground font-medium">
                        کد تایید ارسال شد به:
                      </span>
                      <span
                        dir="ltr"
                        className="text-sm font-bold tracking-wider text-foreground"
                      >
                        {maskPhone(phone)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => switchMode(previousMode)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/5 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>ویرایش شماره</span>
                  </button>
                </div>

                {/* ورودی پین سگمنتی ۵ رقمی (Segmented PIN Input) */}
                <div className="flex flex-col gap-2 text-center">
                  <label className="text-xs sm:text-sm font-semibold text-foreground">
                    کد ۵ رقمی تأیید را وارد کنید
                  </label>

                  <PinInput
                    length={5}
                    value={otp}
                    onChange={(val) => {
                      clearFieldError("otp");
                      setOtp(val);
                    }}
                    onComplete={(completeCode) => {
                      handleVerifySubmit(completeCode);
                    }}
                    disabled={isLoading || isPending}
                    hasError={Boolean(fieldErrors.otp)}
                    autoFocus
                  />

                  {fieldErrors.otp && (
                    <p
                      role="alert"
                      className="flex items-center justify-center gap-1.5 text-xs text-danger mt-1"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.otp}</span>
                    </p>
                  )}
                </div>

                {/* دکمه تایید و ورود */}
                <button
                  type="button"
                  onClick={() => handleVerifySubmit()}
                  disabled={isLoading || isPending || otp.length < 5}
                  aria-busy={isLoading || isPending}
                  className="w-full cursor-pointer bg-linear-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 enabled:active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                >
                  {isLoading || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال بررسی کد و ورود به پنل...</span>
                    </>
                  ) : (
                    <>
                      <span>تأیید و ورود</span>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </>
                  )}
                </button>

                {/* تایمر معکوس و ارسال مجدد پیامک */}
                <div className="pt-4 border-t border-border/60 text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    پیامک کد را دریافت نکرده‌اید؟
                  </p>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isResending || isLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>در حال ارسال مجدد پیامک...</span>
                      </>
                    ) : cooldown > 0 ? (
                      <span className="font-mono">
                        ارسال مجدد کد تا {formatTimer(cooldown)} دیگر
                      </span>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>ارسال مجدد پیامک کد تأیید</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* پانویس امنیتی */}
          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>اطلاعات شما با پروتکل رمزنگاری امن SSL محافظت می‌شود.</span>
          </div>
        </div>

        {/* ستون ویترین سازه‌ها و هوش مصنوعی (۵ ستون در دسکتاپ) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-10 flex-col justify-between overflow-hidden">
          {/* افکت نئونی */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/30 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-2xl"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-indigo-400 shadow-md shadow-primary/30">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight">
                  بیلبورد<span className="text-indigo-400">مارکت</span>
                </span>
                <span className="block text-[11px] text-slate-300/80">
                  اتوماسیون هوشمند تبلیغات محیطی (OOH)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold leading-snug">
                کمپین‌های محیطی خود را داده‌محور و هدفمند اکران کنید
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                با عضویت در بیلبورد مارکت، دسترسی مستقیم به صدها سازه بزرگراهی،
                استرابوردها و تلویزیون‌های شهری در سراسر ایران خواهید داشت.
              </p>
            </div>
          </div>

          {/* مزایای پلتفرم */}
          <div className="relative z-10 space-y-3.5 my-8">
            {features.map(({ icon: Icon, color, title, text }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-xs"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{title}</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* آمار زنده */}
          <div className="relative z-10 flex items-center justify-between rounded-2xl bg-white/10 p-4 border border-white/10 text-xs backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-slate-200 font-medium">سازه‌های فعال در سراسر ایران</span>
            </div>
            <span className="font-extrabold text-sm text-white">+۱,۵۰۰ سازه</span>
          </div>
        </div>
      </div>
    </div>
  );
}
