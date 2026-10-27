import { z } from "zod";

/**
 * اسکیمای متغیرهای محیطی مختص سرور (فاقد پیشوند NEXT_PUBLIC)
 */
export const serverEnvSchema = z.object({
  BACKEND_URL: z
    .string({
      message:
        "متغیر محیطی BACKEND_URL در سمت سرور تعریف نشده است. لطفاً آن را در فایل .env یا متغیرهای سرور تنظیم فرمایید.",
    })
    .url("متغیر محیطی BACKEND_URL باید یک URL معتبر باشد (مثلاً https://oohaiplatform.ir/api/v1).")
    .min(1, "متغیر محیطی BACKEND_URL نمی‌تواند رشته خالی باشد."),
});

/**
 * اسکیمای متغیرهای محیطی کلاینت (وب‌سوکت Reverb)
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_REVERB_APP_KEY: z.string().default("platform-reverb-key"),
  NEXT_PUBLIC_REVERB_HOST: z.string().default("oohaiplatform.ir"),
  NEXT_PUBLIC_REVERB_PORT: z.coerce.number().default(443),
  NEXT_PUBLIC_REVERB_FORCE_TLS: z
    .enum(["true", "false"])
    .or(z.boolean())
    .optional()
    .transform((val) => val === true || val === "true")
    .default(true),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type AppEnv = ServerEnv & ClientEnv;

/**
 * دریافت و اعتبارسنجی آدرس بک‌اند در سمت سرور
 * در صورتی که در سمت کلاینت فراخوانی شود یا در سرور مقدار نداشته باشد خطای صریح پرتاب می‌کند.
 */
export function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    throw new Error("خطای امنیتی: متغیر BACKEND_URL فقط در محیط سرور در دسترس است و نباید به کلاینت نشت کند.");
  }

  const rawValue =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://oohaiplatform.ir";

  const result = serverEnvSchema.safeParse({ BACKEND_URL: rawValue });
  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => issue.message).join(" | ");
    throw new Error(`خطای اعتبارسنجی متغیر BACKEND_URL: ${errorMessages}`);
  }

  return result.data.BACKEND_URL;
}

/**
 * دریافت و اعتبارسنجی متغیرهای کلاینت (Reverb WebSocket)
 */
export function getClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_REVERB_APP_KEY: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    NEXT_PUBLIC_REVERB_HOST: process.env.NEXT_PUBLIC_REVERB_HOST,
    NEXT_PUBLIC_REVERB_PORT: process.env.NEXT_PUBLIC_REVERB_PORT,
    NEXT_PUBLIC_REVERB_FORCE_TLS: process.env.NEXT_PUBLIC_REVERB_FORCE_TLS,
  });

  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => issue.message).join(" | ");
    throw new Error(`خطای اعتبارسنجی متغیرهای محیطی کلاینت: ${errorMessages}`);
  }

  return result.data;
}

/**
 * اعتبارسنجی جامع تمامی متغیرهای برنامه در زمان راه‌اندازی سرور
 */
export function validateEnv(): AppEnv {
  const client = getClientEnv();
  const backendUrl = getBackendUrl();

  return {
    ...client,
    BACKEND_URL: backendUrl,
  };
}

/**
 * پروکسی دسترسی امن به متغیرهای محیطی با اعتبارسنجی Zod
 */
export const env: AppEnv = new Proxy({} as AppEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== "string") return undefined;

    if (prop === "BACKEND_URL") {
      return getBackendUrl();
    }

    const clientData = getClientEnv();
    if (prop in clientData) {
      return clientData[prop as keyof ClientEnv];
    }

    return process.env[prop];
  },
});
