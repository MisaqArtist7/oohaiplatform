    "use client";

    import { useEffect } from "react";
    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { z } from "zod";
    import { useRouter } from "next/navigation";

    const requestOtpSchema = z.object({
    phone: z.string().regex(/^09[0-9]{9}$/, {
        message: "شماره تماس معتبر نیست.",
    }),
    });

    type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;

    type RequestOtpApiResponse = {
    success?: boolean;
    message?: string;
    };

    const REQUEST_OTP_API_URL =
    "https://oohaiplatform.ir/api/v1/otp/request";

    export default function RequestOtpPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        watch,
        formState: { errors, isValid, isSubmitting },
    } = useForm<RequestOtpFormValues>({
        resolver: zodResolver(requestOtpSchema),
        mode: "onChange",
        defaultValues: {
        phone: "",
        },
    });

    const phone = watch("phone");

    // Load the stored phone number
    useEffect(() => {
        try {
        const storedPhone = sessionStorage.getItem("phone");

        const parsed = requestOtpSchema.safeParse({
            phone: storedPhone,
        });

        if (!parsed.success) {
            router.replace("/register");
            return;
        }

        setValue("phone", parsed.data.phone, {
            shouldValidate: true,
        });
        } catch {
        router.replace("/register");
        }
    }, [router, setValue]);

    const onSubmit = async (values: RequestOtpFormValues) => {
        clearErrors("root.server");

        try {
        const response = await fetch(REQUEST_OTP_API_URL, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            phone: values.phone,
            }),
        });

        const result = (await response
            .json()
            .catch(() => null)) as RequestOtpApiResponse | null;

        // Handle unsuccessful API responses
        if (!response.ok || result?.success !== true) {
            setError("root.server", {
            type: "server",
            message:
                result?.message ??
                "دریافت کد تأیید ناموفق بود. لطفاً دوباره تلاش کنید.",
            });

            return;
        }

        // Navigate to the verification page
        router.push("/verify-otp");
        } catch {
        setError("root.server", {
            type: "network",
            message:
            "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
        });
        }
    };

    // Wait until the phone number is loaded
    if (!phone) {
        return null;
    }

    return (
        // Main container
        <div
        className="min-h-screen flex items-center justify-center bg-muted p-4"
        dir="rtl"
        >
        {/* OTP request card */}
        <div className="w-full max-w-md bg-background rounded-2xl shadow-sm border border-border p-8">
            {/* Form header */}
            <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-3">
                دریافت کد تأیید
            </h1>

            <p className="text-sm text-muted-foreground leading-7">
                برای دریافت کد تأیید، شماره تماس خود را بررسی کنید.
            </p>
            </div>

            {/* OTP request form */}
            <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            >
            {/* Phone number field */}
            <div className="flex flex-col gap-2">
                <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground"
                >
                شماره تماس
                </label>

                <input
                type="tel"
                id="phone"
                dir="ltr"
                autoComplete="tel"
                inputMode="numeric"
                readOnly
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                    errors.phone ? "phone-error" : undefined
                }
                {...register("phone")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted focus:outline-none text-foreground text-left placeholder:text-muted-foreground"
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

            {/* API error message */}
            {errors.root?.server?.message && (
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
                className="w-full cursor-pointer bg-primary enabled:hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md enabled:active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {isSubmitting ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-xs text-center text-muted-foreground leading-6">
            کد تأیید برای شماره تماس شما ارسال خواهد شد.
            </p>
        </div>
        </div>
    );
    }