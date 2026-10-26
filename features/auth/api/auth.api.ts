import type {
  AuthApiResponse,
  RegisterPayload,
  RequestOtpPayload,
  User,
  VerifyOtpPayload,
} from "../types";
import { getRedirectPath } from "../redirect-by-permissions";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export const IRAN_PHONE_REGEX = /^09[0-9]{9}$/;

/**
 * تبدیل ارقام فارسی و عربی به ارقام انگلیسی
 */
export function toEnDigits(input: string): string {
  if (!input) return "";
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .trim();
}

/**
 * تبدیل ارقام انگلیسی به فارسی برای نمایش
 */
export function toFaDigits(input: string | number): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str.replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1728));
}

/**
 * ماسک کردن شماره تلفن برای نمایش امن: ۰۹۱۲****۷۸۹
 */
export function maskPhone(phone: string): string {
  const clean = toEnDigits(phone);
  if (!clean || clean.length < 11) return phone;
  return clean.replace(/^(\d{4})\d{4}(\d{3})$/, "$1****$2");
}

/**
 * فرمت خوانای شماره تماس: ۰۹۱۲ ۳۴۵ ۶۷۸۹
 */
export function formatPhoneSpacing(phone: string): string {
  const clean = toEnDigits(phone);
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
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage:
        err instanceof TypeError
          ? "عدم برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
          : (err as Error).message || "خطای ناشناخته رخ داد.",
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
      phone: toEnDigits(payload.phone),
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
      phone: toEnDigits(payload.phone),
    }),
  });
}

/**
 * ۳. تأیید کد یکبار مصرف از طریق Route Handler داخلی (برای ست شدن امن Cookie)
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
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone: toEnDigits(payload.phone),
        otp: toEnDigits(payload.otp),
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
        redirectUrl: "/dashboard",
        fieldErrors,
      };
    }

    if (!res.ok || !data?.success) {
      return {
        ok: false,
        status: res.status,
        message: data?.message || "تأیید کد با خطا مواجه شد.",
        user: null,
        redirectUrl: "/dashboard",
      };
    }

    const user: User = data.user;
    const permissions: string[] = user?.permissions || [];
    const roles = user?.roles || [];
    const redirectUrl = getRedirectPath(permissions, roles);

    return {
      ok: true,
      status: 200,
      message: data.message || "ورود با موفقیت انجام شد.",
      user,
      redirectUrl,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message:
        err instanceof TypeError
          ? "عدم برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
          : (err as Error).message || "خطای ناشناخته رخ داد.",
      user: null,
      redirectUrl: "/dashboard",
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
