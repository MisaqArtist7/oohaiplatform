import type {
  AuthApiResponse,
  RegisterPayload,
  RequestOtpPayload,
  User,
  VerifyOtpPayload,
} from "../types";
import { getHomePath } from "../lib/get-home-path";
import { toEnglishDigits, toPersianDigits } from "@/shared/lib/digits";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export const IRAN_PHONE_REGEX = /^09[0-9]{9}$/;

export class ApiError extends Error {
  status: number;
  data: unknown;
  fieldErrors?: Record<string, string>;
  retryAfter?: number;

  constructor(
    status: number,
    message: string,
    data?: unknown,
    fieldErrors?: Record<string, string>,
    retryAfter?: number
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
    this.retryAfter = retryAfter;
  }
}

/**
 * تبدیل ارقام فارسی و عربی به ارقام انگلیسی
 */
export function toEnDigits(input: string | undefined | null): string {
  return toEnglishDigits(input);
}

/**
 * تبدیل ارقام انگلیسی به فارسی برای نمایش
 */
export function toFaDigits(input: string | number | undefined | null): string {
  return toPersianDigits(input);
}

/**
 * ماسک کردن شماره تلفن برای نمایش امن: ۰۹۱۲****۷۸۹
 */
export function maskPhone(phone: string): string {
  const clean = toEnglishDigits(phone);
  if (!clean || clean.length < 11) return phone;
  return clean.replace(/^(\d{4})\d{4}(\d{3})$/, "$1****$2");
}

/**
 * فرمت خوانای شماره تماس: ۰۹۱۲ ۳۴۵ ۶۷۸۹
 */
export function formatPhoneSpacing(phone: string): string {
  const clean = toEnglishDigits(phone);
  if (clean.length === 11) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return clean;
}

export interface ApiCallResult<T = unknown> {
  ok: boolean;
  status: number;
  data: AuthApiResponse<T> | null;
  errorMessage: string | null;
  fieldErrors?: Record<string, string>;
  retryAfter?: number;
}

/**
 * استخراج زمان انتظار (Retry-After) در صورت وقوع خطای Rate Limit (کد ۴۲۹)
 */
function extractRetryAfter(res: Response, data: AuthApiResponse<unknown> | null): number | undefined {
  const headerVal =
    res.headers.get("retry-after") ??
    res.headers.get("Retry-After");

  if (headerVal) {
    const parsed = parseInt(headerVal, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  if (data?.retry_after && typeof data.retry_after === "number" && data.retry_after > 0) {
    return data.retry_after;
  }

  return undefined;
}

/**
 * مدیریت یکپارچه درخواست‌های شبکه به API
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiCallResult<T>> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    const data: AuthApiResponse<T> = await res.json().catch(() => null);

    if (res.status === 429) {
      const retryAfter = extractRetryAfter(res, data);
      return {
        ok: false,
        status: 429,
        data,
        errorMessage:
          data?.message || "تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید.",
        retryAfter,
      };
    }

    if (res.status === 422 && data?.errors) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(data.errors)) {
        if (Array.isArray(msgs) && msgs.length > 0) {
          fieldErrors[key] = msgs[0];
        }
      }
      return {
        ok: false,
        status: 422,
        data,
        errorMessage: data.message || "اطلاعات وارد شده نامعتبر است.",
        fieldErrors,
      };
    }

    if (res.status === 401) {
      return {
        ok: false,
        status: 401,
        data,
        errorMessage: data?.message || "دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.",
      };
    }

    if (!res.ok || (data && data.success === false)) {
      return {
        ok: false,
        status: res.status,
        data,
        errorMessage: data?.message || `خطای سرور (${res.status})`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
      errorMessage: null,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage: "ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.",
    };
  }
}

/**
 * ۱. ثبت‌نام کاربر
 */
export async function apiRegister(payload: RegisterPayload) {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name.trim(),
      phone: toEnglishDigits(payload.phone),
    }),
  });
}

/**
 * ۲. درخواست کد تأیید یکبار مصرف (OTP)
 */
export async function apiRequestOtp(payload: RequestOtpPayload) {
  return apiFetch<null>("/otp/request", {
    method: "POST",
    body: JSON.stringify({
      phone: toEnglishDigits(payload.phone),
    }),
  });
}

/**
 * ۳. تأیید کد یکبار مصرف از طریق BFF Route Handler
 */
export async function apiVerifyOtp(payload: VerifyOtpPayload): Promise<{
  ok: boolean;
  status: number;
  message: string;
  user: User | null;
  redirectUrl: string;
  fieldErrors?: Record<string, string>;
}> {
  try {
    const res = await fetch("/api/v1/otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone: toEnglishDigits(payload.phone),
        otp: toEnglishDigits(payload.otp),
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 422 && data?.errors) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(data.errors as Record<string, string[]>)) {
        if (Array.isArray(msgs) && msgs.length > 0) {
          fieldErrors[key] = msgs[0];
        }
      }
      return {
        ok: false,
        status: 422,
        message: data.message || "کد تأیید نامعتبر است.",
        user: null,
        redirectUrl: "/client",
        fieldErrors,
      };
    }

    if (!res.ok || !data?.success) {
      return {
        ok: false,
        status: res.status,
        message: data?.message || "تأیید کد با خطا مواجه شد.",
        user: null,
        redirectUrl: "/client",
      };
    }

    const user: User = data.user;
    const redirectUrl = getHomePath(user?.role);

    return {
      ok: true,
      status: 200,
      message: data.message || "ورود با موفقیت انجام شد.",
      user,
      redirectUrl,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.",
      user: null,
      redirectUrl: "/client",
    };
  }
}

/**
 * ۴. خروج از حساب کاربری
 */
export async function apiLogout(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}
