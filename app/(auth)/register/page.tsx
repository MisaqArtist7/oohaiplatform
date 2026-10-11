"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const API_URL = "https://oohaiplatform.ir/api/v1/auth/register";

const schema = z.object({
name: z
    .string()
    .trim()
    .min(3, { message: "نام باید حداقل ۳ کاراکتر باشد." })
    .max(50, { message: "نام نباید بیشتر از ۵۰ کاراکتر باشد." }),

phone: z
    .string()
    .regex(/^09[0-9]{9}$/, {
    message: "شماره تماس معتبر نیست.",
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

    let response: Response;

    // Send registration request
    try {
    response = await fetch(API_URL, {
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

    // Parse API response
    const payload: unknown = await response.json().catch(() => null);
    const apiMessage = getApiMessage(payload);

    // Handle HTTP errors
    if (!response.ok) {
    setError("root.server", {
        type: "server",
        message: apiMessage ?? `ثبت‌نام ناموفق بود (خطای ${response.status}).`,
    });

    return;
    }

    // Validate successful response
    if (!isRecord(payload) || payload.success !== true) {
    setError("root.server", {
        type: "server",
        message: apiMessage ?? "ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.",
    });

    return;
    }

    // Check the next step returned by the API
    if (payload.next_step !== "request_otp") {
    setError("root.server", {
        type: "server",
        message: "ثبت‌نام انجام شد، اما مرحله بعدی مشخص نیست.",
    });

    return;
    }

    // Store the phone number for the OTP flow
    try {
    sessionStorage.setItem("phone", values.phone);
    } catch {
    setError("root.server", {
        type: "storage",
        message: "ثبت‌نام انجام شد، اما ذخیره شماره تماس ممکن نشد.",
    });

    return;
    }

    // Navigate to the OTP request page
    router.push("/request-otp");
};

return (
    // Main container
    <div
    className="min-h-screen flex items-center justify-center bg-muted p-4"
    dir="rtl"
    >
    {/* Registration card */}
    <div className="w-full max-w-md bg-background rounded-2xl shadow-sm border border-border p-8">
        {/* Form header */}
        <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
            ثبت‌نام
        </h1>

        <p className="text-sm text-muted-foreground">
            برای ادامه، اطلاعات خود را وارد کنید.
        </p>
        </div>

        {/* Registration form */}
        <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        >
        {/* Full name field */}
        <div className="flex flex-col gap-1.5">
            <label
            htmlFor="fullName"
            className="text-sm font-medium text-foreground"
            >
            نام و نام خانوادگی
            </label>

            <input
            type="text"
            id="fullName"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
            placeholder="مثال: علی احمدی"
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />

            {errors.name && (
            <p
                id="name-error"
                role="alert"
                className="text-sm text-danger mt-1"
            >
                {errors.name.message}
            </p>
            )}
        </div>

        {/* Phone number field */}
        <div className="flex flex-col gap-1.5">
            <label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-foreground"
            >
            شماره تماس
            </label>

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
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-left placeholder:text-muted-foreground placeholder:text-right"
            />

            {errors.phone && (
            <p
                id="phone-error"
                role="alert"
                className="text-sm text-danger mt-1"
            >
                {errors.phone.message}
            </p>
            )}
        </div>

        {/* Server and network errors */}
        {errors.root?.server && (
            <p
            role="alert"
            className="text-sm text-danger leading-6"
            >
            {errors.root.server.message}
            </p>
        )}

        {/* Submit button */}
        <button
            type="submit"
            disabled={!isValid || isSubmitting}
            aria-busy={isSubmitting}
            className="w-full mt-2 bg-primary enabled:hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md enabled:active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
            {isSubmitting ? "در حال ثبت‌نام..." : "تأیید و ثبت‌نام"}
        </button>
        </form>
    </div>
    </div>
);
}