"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const phoneSchema = z.string().regex(/^09[0-9]{9}$/);

const verifyOtpSchema = z.object({
phone: phoneSchema,
otp: z
    .string()
    .trim()
    .min(1, { message: "کد تأیید را وارد کنید." })
    .regex(/^[0-9]+$/, {
    message: "کد تأیید باید فقط شامل ارقام باشد.",
    }),
});

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

type OtpApiResponse = {
success?: boolean;
message?: string;
};

const VERIFY_OTP_API_URL =
"https://oohaiplatform.ir/api/v1/otp/verify";

const REQUEST_OTP_API_URL =
"https://oohaiplatform.ir/api/v1/otp/request";

export default function VerifyOtpPage() {
const router = useRouter();

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
    } catch {
    router.replace("/register");
    }
}, [router, setValue]);

const onSubmit = async (values: VerifyOtpFormValues) => {
    clearErrors("root.server");
    setNotice(null);

    try {
    const response = await fetch(VERIFY_OTP_API_URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        phone: values.phone,
        otp: values.otp,
        }),
    });

    const result = (await response
        .json()
        .catch(() => null)) as OtpApiResponse | null;

    // Handle unsuccessful API responses
    if (!response.ok || result?.success !== true) {
        setError("root.server", {
        type: "server",
        message:
            result?.message ??
            "کد تأیید نامعتبر است یا تأیید انجام نشد.",
        });

        return;
    }

    // Remove the stored phone after successful verification
    sessionStorage.removeItem("phone");

    // Navigate to the dashboard
    router.push("/dashboard");
    } catch {
    setError("root.server", {
        type: "network",
        message:
        "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
    });
    }
};

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
        },
        body: JSON.stringify({
        phone,
        }),
    });

    const result = (await response
        .json()
        .catch(() => null)) as OtpApiResponse | null;

    // Handle unsuccessful API responses
    if (!response.ok || result?.success !== true) {
        setError("root.server", {
        type: "server",
        message:
            result?.message ??
            "ارسال مجدد کد ناموفق بود. لطفاً دوباره تلاش کنید.",
        });

        return;
    }

    setNotice(result.message ?? "کد تأیید دوباره ارسال شد.");
    } catch {
    setError("root.server", {
        type: "network",
        message:
        "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
    });
    } finally {
    setIsResending(false);
    }
};

// Wait until the phone number is loaded
if (!phone) {
    return null;
}

const maskedPhone = phone.replace(
    /^(\d{4})\d{4}(\d{3})$/,
    "$1****$2"
);

return (
    // Main container
    <div
    className="min-h-screen flex items-center justify-center bg-muted p-4"
    dir="rtl"
    >
    {/* Verification card */}
    <div className="w-full max-w-md bg-background rounded-2xl shadow-sm border border-border p-8">
        {/* Form header */}
        <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-3">
            تأیید شماره تماس
        </h1>

        <p className="text-sm text-muted-foreground leading-7">
            کد تأیید ارسال‌شده به شماره{" "}
            <span dir="ltr" className="inline-block font-medium">
            {maskedPhone}
            </span>{" "}
            را وارد کنید.
        </p>
        </div>

        {/* Verification form */}
        <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        >
        {/* OTP input */}
        <div className="flex flex-col gap-2">
            <label
            htmlFor="otp"
            className="text-sm font-medium text-foreground"
            >
            کد تأیید
            </label>

            <input
            type="text"
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="کد تأیید را وارد کنید"
            dir="ltr"
            aria-invalid={Boolean(errors.otp)}
            aria-describedby={errors.otp ? "otp-error" : undefined}
            {...register("otp")}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-center tracking-widest placeholder:text-muted-foreground placeholder:tracking-normal"
            />

            {errors.otp && (
            <p
                id="otp-error"
                role="alert"
                className="text-sm text-danger mt-1"
            >
                {errors.otp.message}
            </p>
            )}
        </div>

        {/* API error message */}
        {errors.root?.server?.message && (
            <p role="alert" className="text-sm text-danger leading-6">
            {errors.root.server.message}
            </p>
        )}

        {/* Resend success message */}
        {notice && (
            <p
            role="status"
            className="text-sm text-success leading-6"
            >
            {notice}
            </p>
        )}

        {/* Submit button */}
        <button
            type="submit"
            disabled={!isValid || isSubmitting || isResending}
            className="w-full bg-primary enabled:hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md enabled:active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
            {isSubmitting ? "در حال بررسی..." : "تأیید کد"}
        </button>
        </form>

        {/* Resend OTP section */}
        <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
            کد را دریافت نکرده‌اید؟
        </p>

        <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || isSubmitting}
            className="mt-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
        </button>
        </div>
    </div>
    </div>
);
}