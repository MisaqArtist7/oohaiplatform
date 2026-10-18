"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
MapPin,
ArrowRight,
ShieldCheck,
AlertCircle,
CheckCircle2,
RotateCcw,
Loader2,
KeyRound,
Smartphone,
ArrowLeft,
} from "lucide-react";

const phoneSchema = z.string().regex(/^09[0-9]{9}$/);

const verifyOtpSchema = z.object({
phone: phoneSchema,

otp: z
.string()
.trim()
.min(1, {
    message: "کد تأیید را وارد کنید.",
})
.regex(/^[0-9]+$/, {
    message: "کد تأیید باید فقط شامل ارقام باشد.",
}),
});

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

type OtpApiResponse = {
success?: boolean;
message?: string;
};

const VERIFY_OTP_API_URL = "https://oohaiplatform.ir/api/v1/otp/verify";
const REQUEST_OTP_API_URL = "https://oohaiplatform.ir/api/v1/otp/request";

function isRecord(value: unknown): value is Record<string, unknown> {
return typeof value === "object" && value !== null;
}

function getApiMessage(payload: unknown): string | undefined {
if (isRecord(payload) && typeof payload.message === "string") {
return payload.message;
}

return undefined;
}

export default function VerifyOtpPage() {
const router = useRouter();

const [isPhoneLoaded, setIsPhoneLoaded] = useState(false);
const [isResending, setIsResending] = useState(false);
const [notice, setNotice] = useState<string | null>(null);

const {
register,
handleSubmit,
setValue,
setError,
clearErrors,
watch,
formState: { errors, isValid, isSubmitting },
} = useForm<VerifyOtpFormValues>({
resolver: zodResolver(verifyOtpSchema),
mode: "onChange",
defaultValues: {
    phone: "",
    otp: "",
},
});

const phone = watch("phone");

// Load the stored phone number
useEffect(() => {
try {
    const storedPhone = sessionStorage.getItem("phone");

    const parsedPhone = phoneSchema.safeParse(storedPhone);

    if (!parsedPhone.success) {
    router.replace("/register");
    return;
    }

    setValue("phone", parsedPhone.data, {
    shouldValidate: true,
    });

    setIsPhoneLoaded(true);
} catch {
    router.replace("/register");
}
}, [router, setValue]);

// Verify OTP
const onSubmit = async (values: VerifyOtpFormValues) => {
clearErrors("root.server");
setNotice(null);

try {
    const response = await fetch(VERIFY_OTP_API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    body: JSON.stringify({
        phone: values.phone,
        otp: values.otp,
    }),
    });

    const result: unknown = await response.json().catch(() => null);

    const apiMessage = getApiMessage(result);

    if (!response.ok || !isRecord(result) || result.success !== true) {
    setError("root.server", {
        type: "server",
        message: apiMessage ?? "کد تأیید نامعتبر است یا تأیید انجام نشد.",
    });

    return;
    }

    // Remove the phone number from session storage
    try {
    sessionStorage.removeItem("phone");
    } catch {
    // Verification succeeded; storage cleanup is non-critical.
    }

    // Navigate to the dashboard
    router.push("/dashboard");
} catch {
    setError("root.server", {
    type: "network",
    message: "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
    });
}
};

// Resend OTP
const handleResendOtp = async () => {
if (!phone || isResending || isSubmitting) {
    return;
}

clearErrors("root.server");
setNotice(null);
setIsResending(true);

try {
    const response = await fetch(REQUEST_OTP_API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    body: JSON.stringify({
        phone,
    }),
    });

    const result: unknown = await response.json().catch(() => null);

    const apiMessage = getApiMessage(result);

    if (!response.ok || !isRecord(result) || result.success !== true) {
    setError("root.server", {
        type: "server",
        message: apiMessage ?? "ارسال مجدد کد ناموفق بود. لطفاً دوباره تلاش کنید.",
    });

    return;
    }

    setNotice(apiMessage ?? "کد تأیید جدید با موفقیت برای شما پیامک شد.");
} catch {
    setError("root.server", {
    type: "network",
    message: "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
    });
} finally {
    setIsResending(false);
}
};

// Wait until the phone number is loaded
if (!isPhoneLoaded || !phone) {
return null;
}

// Mask the phone number
const maskedPhone = phone.replace(/^(\d{4})\d{4}(\d{3})$/, "$1****$2");

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

    {/* Main card */}
    <div className="relative w-full max-w-md bg-background/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-950/10 border border-border/80 p-6 sm:p-8 transition-all">
    {/* Top bar */}
    <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
        <Link
        href="/register"
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        <span>ویرایش شماره</span>
        </Link>

        <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <MapPin className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-bold tracking-tight text-foreground">
            بیلبورد<span className="text-primary">مارکت</span>
        </span>
        </div>
    </div>

    {/* Header */}
    <div className="mb-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 shadow-2xs">
        <KeyRound className="h-6 w-6" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-2">
        تأیید شماره موبایل
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        کد تأیید ۵ رقمی ارسال‌شده به شماره زیر را وارد نمایید:
        </p>

        <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-muted/70 border border-border/80 text-xs sm:text-sm font-semibold text-foreground">
        <Smartphone className="h-3.5 w-3.5 text-primary" />
        <span dir="ltr">{maskedPhone}</span>
        </div>
    </div>

    {/* Verification form */}
    <form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
    >
        {/* Hidden Phone field for react-hook-form */}
        <input type="hidden" {...register("phone")} />

        {/* OTP input */}
        <div className="flex flex-col gap-2">
        <label
            htmlFor="otp"
            className="text-xs font-semibold text-foreground flex items-center justify-between"
        >
            <span>کد تأیید یکبار مصرف</span>
            <span className="text-[11px] text-muted-foreground font-normal">
            ارقام انگلیسی یا فارسی
            </span>
        </label>

        <div className="relative">
            <input
            type="text"
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="• • • • •"
            dir="ltr"
            aria-invalid={Boolean(errors.otp)}
            aria-describedby={errors.otp ? "otp-error" : undefined}
            {...register("otp")}
            className={`w-full py-3.5 px-4 rounded-xl border bg-muted/40 focus:bg-background text-lg sm:text-xl font-bold tracking-[0.35em] text-center transition-all text-foreground placeholder:text-muted-foreground/40 placeholder:tracking-widest focus:outline-none focus:ring-3 ${
                errors.otp
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            }`}
            />
        </div>

        {errors.otp && (
            <p
            id="otp-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-danger mt-0.5"
            >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.otp.message}</span>
            </p>
        )}
        </div>

        {/* Server errors */}
        {errors.root?.server?.message && (
        <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger leading-relaxed"
        >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errors.root.server.message}</span>
        </div>
        )}

        {/* Resend success notice */}
        {notice && (
        <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-xs text-success leading-relaxed"
        >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
        </div>
        )}

        {/* Verify button */}
        <button
        type="submit"
        disabled={!isValid || isSubmitting || isResending}
        aria-busy={isSubmitting}
        className="w-full cursor-pointer mt-2 bg-linear-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 enabled:active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
        >
        {isSubmitting ? (
            <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>در حال بررسی کد تأیید...</span>
            </>
        ) : (
            <>
            <span>تأیید و ورود به پنل</span>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </>
        )}
        </button>
    </form>

    {/* Resend OTP */}
    <div className="mt-6 pt-5 border-t border-border/60 text-center">
        <p className="text-xs text-muted-foreground">
        پیامک کد را دریافت نکرده‌اید؟
        </p>

        <button
        type="button"
        onClick={handleResendOtp}
        disabled={isResending || isSubmitting}
        className="mt-2 inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {isResending ? (
            <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>در حال ارسال مجدد...</span>
            </>
        ) : (
            <>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>ارسال مجدد پیامک کد تأیید</span>
            </>
        )}
        </button>
    </div>

    {/* Trust Note */}
    <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span>ارتباط امن رمزنگاری‌شده با سرور</span>
    </div>
    </div>
</div>
);
}