/**
 * پارامترهای مقداردهی اولیه کلاس خطای API
 */
export interface ApiErrorInit {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
  raw?: unknown;
}

/**
 * کلاس یکپارچه خطاهای شبکه و پاسخ‌های ناموفق سرور بک‌اند لاراول
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly retryAfter?: number;
  readonly raw?: unknown;

  constructor({ status, message, fieldErrors, retryAfter, raw }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors ?? {};
    this.retryAfter = retryAfter;
    this.raw = raw;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * آیا خطا مربوط به اعتبارسنجی فرم‌ها (Unprocessable Entity - 422) لاراول است؟
   */
  get isValidation(): boolean {
    return this.status === 422;
  }

  /**
   * آیا کاربر احراز هویت نشده یا توکن نامعتبر/منقضی است؟ (Unauthorized - 401)
   */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * آیا دسترسی کاربر به دلیل عدم داشتن پرمیشن یا نقش کافی رد شده است؟ (Forbidden - 403)
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * آیا درخواست به دلیل محدودیت تعداد فراخوانی (Rate Limit - 429) مسدود شده است؟
   */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /**
   * آیا منبع درخواستی یافت نشد؟ (Not Found - 404)
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * آیا خطای سمت سرور یا درگاه بالادستی رخ داده است؟ (500+)
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}
