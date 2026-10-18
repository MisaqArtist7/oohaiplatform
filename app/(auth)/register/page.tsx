"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  MapPin,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const REGISTER_API_URL = "https://oohaiplatform.ir/api/v1/auth/register";
const REQUEST_OTP_API_URL = "https://oohaiplatform.ir/api/v1/otp/request";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, {
      message: "نام باید حداقل ۳ کاراکتر باشد.",
    })
    .max(50, {
      message: "نام نباید بیشتر از ۵۰ کاراکتر باشد.",
    }),

  phone: z.string().regex(/^09[0-9]{9}$/, {
    message: "شماره تماس معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).",
  }),
});

type RegisterFormValues = z.infer<typeof schema>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiMessage(payload: unknown): string | undefined {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return undefined;
}

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors("root.server");

    // Step 1: Register the user
    let registerResponse: Response;

    try {
      registerResponse = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });
    } catch {
      setError("root.server", {
        type: "network",
        message: "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
      });
      return;
    }

    const registerResult: unknown = await registerResponse
      .json()
      .catch(() => null);

    const registerMessage = getApiMessage(registerResult);

    if (!registerResponse.ok) {
      setError("root.server", {
        type: "server",
        message:
          registerMessage ??
          `ثبت‌نام ناموفق بود (خطای ${registerResponse.status}).`,
      });
      return;
    }

    if (!isRecord(registerResult) || registerResult.success !== true) {
      setError("root.server", {
        type: "server",
        message: registerMessage ?? "ثبت‌نام انجام نشد.",
      });
      return;
    }

    // Step 2: Store the phone number
    try {
      sessionStorage.setItem("phone", values.phone);
    } catch {
      setError("root.server", {
        type: "storage",
        message: "ثبت‌نام انجام شد، اما ذخیره شماره تماس ممکن نشد.",
      });
      return;
    }

    // Step 3: Request the OTP
    let otpResponse: Response;

    try {
      otpResponse = await fetch(REQUEST_OTP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phone: values.phone,
        }),
      });
    } catch {
      setError("root.server", {
        type: "network",
        message:
          "ثبت‌نام انجام شد، اما ارتباط با سرور برای ارسال کد برقرار نشد. لطفاً دوباره تلاش کنید.",
      });
      return;
    }

    const otpResult: unknown = await otpResponse.json().catch(() => null);
    const otpMessage = getApiMessage(otpResult);

    if (!otpResponse.ok || !isRecord(otpResult) || otpResult.success !== true) {
      setError("root.server", {
        type: "server",
        message:
          otpMessage ??
          "ثبت‌نام انجام شد، اما ارسال کد تأیید ناموفق بود. لطفاً دوباره تلاش کنید.",
      });
      return;
    }

    // Step 4: Navigate directly to verification
    router.push("/verify-otp");
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-violet-400/5 blur-[120px]"
      />

      {/* Main card container */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-indigo-950/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* Right column: Form section */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Bar: Back Link & Mobile Logo */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <span>بازگشت به صفحه اصلی</span>
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold tracking-tight text-foreground">
                  بیلبورد<span className="text-primary">مارکت</span>
                </span>
              </div>
            </div>

            {/* Header Title & Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary mb-3.5 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>عضویت سریع • ورود بدون نیاز به کلمه عبور</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2.5">
                ثبت‌نام در بیلبورد مارکت
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed">
                جهت دسترسی به کاتالوگ سازه‌ها، رزرو آنلاین بیلبورد و مشاوره هوش مصنوعی اطلاعات خود را وارد کنید.
              </p>
            </div>

            {/* Registration Form */}
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Full name input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fullName"
                  className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between"
                >
                  <span>نام و نام خانوادگی</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (حداقل ۳ کاراکتر)
                  </span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>

                  <input
                    type="text"
                    id="fullName"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    {...register("name")}
                    placeholder="مثال: علی احمدی"
                    className={`w-full pr-10 pl-4 py-3 rounded-xl border bg-muted/50 focus:bg-background text-sm transition-all text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-3 ${
                      errors.name
                        ? "border-danger focus:ring-danger/20"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>

                {errors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-danger mt-0.5"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Phone number input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phoneNumber"
                  className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between"
                >
                  <span>شماره موبایل</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    کد تأیید به این شماره ارسال خواهد شد
                  </span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>

                  <input
                    type="tel"
                    id="phoneNumber"
                    autoComplete="tel"
                    inputMode="numeric"
                    dir="ltr"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    {...register("phone")}
                    placeholder="09123456789"
                    className={`w-full pr-10 pl-20 py-3 rounded-xl border bg-muted/50 focus:bg-background text-sm font-medium transition-all text-foreground text-left placeholder:text-muted-foreground/70 focus:outline-none focus:ring-3 tracking-wide ${
                      errors.phone
                        ? "border-danger focus:ring-danger/20"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                  />

                  {/* Country / Prefix Indicator */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 pr-2 text-xs font-semibold text-muted-foreground border-r border-border/70 my-2">
                    <span dir="ltr">+۹۸ ایران</span>
                  </div>
                </div>

                {errors.phone && (
                  <p
                    id="phone-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-danger mt-0.5"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.phone.message}</span>
                  </p>
                )}
              </div>

              {/* Server errors alert */}
              {errors.root?.server && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger leading-relaxed"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errors.root.server.message}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                aria-busy={isSubmitting}
                className="w-full cursor-pointer mt-2 bg-linear-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 enabled:active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ثبت‌نام و ارسال پیامک...</span>
                  </>
                ) : (
                  <>
                    <span>تأیید و دریافت کد یکبار مصرف</span>
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>

              {/* Terms hint */}
              <p className="text-[11px] sm:text-xs text-center text-muted-foreground leading-relaxed pt-1">
                با ثبت‌نام در سامانه، کلیه{" "}
                <Link
                  href="/terms"
                  className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                >
                  قوانین و شرایط استفاده
                </Link>{" "}
                و سیاست‌های حفظ حریم خصوصی را می‌پذیرید.
              </p>
            </form>
          </div>

          {/* Trust and privacy badges */}
          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>اطلاعات شما با پروتکل‌های امنیتی روز محافظت می‌شود.</span>
          </div>
        </div>

        {/* Left column (in RTL): Visual Showcase and Value Props */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-10 flex-col justify-between overflow-hidden">
          {/* Ambient orbs in showcase */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/30 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-2xl"
          />

          {/* Decorative Grid Pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]"
          />

          {/* Top Brand Showcase */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-indigo-400 text-white shadow-md shadow-primary/30">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight">
                  بیلبورد<span className="text-indigo-400">مارکت</span>
                </span>
                <span className="block text-[11px] text-slate-300/80">
                  اتوماسیون هوشمند تبلیغات محیطی
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-medium backdrop-blur-md border border-white/10">
                پلتفرم نسل جدید رسانه‌های OOH
              </span>
              <h2 className="text-xl font-bold leading-snug">
                کمپین‌های محیطی خود را داده‌محور و هدفمند اکران کنید
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                با عضویت در بیلبورد مارکت، دسترسی مستقیم به صدها سازه بزرگراهی،
                استرابوردها و تلویزیون‌های شهری در سراسر ایران خواهید داشت.
              </p>
            </div>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 space-y-3.5 my-8">
            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">مشاوره هوشمند با AI</h3>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  پیشنهاد بهترین لوکیشن‌ها متناسب با پرسونای مخاطب و بودجه شما
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">تحلیل دقیق ترافیک</h3>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  بررسی تخمین نرخ بازدید روزانه، زاویه دید و عکس‌های میدانی سازه‌ها
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">رزرو آنی بدون واسطه</h3>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  قفل آنی سازه به مدت ۴۸ ساعت بدون تداخل با سایر سفارش‌ها
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Live Stats Box */}
          <div className="relative z-10 rounded-2xl bg-linear-to-r from-white/10 to-white/5 p-4 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-slate-200 font-medium">سازه فعال در سراسر ایران</span>
              </div>
              <span className="font-extrabold text-white text-sm">+۱,۵۰۰ سازه</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}