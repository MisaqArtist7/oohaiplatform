import { ApiError } from "./errors";

export const PROXY_BASE_PATH = "/api/proxy/v1";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean | null | undefined)[];

export type QueryParams = Record<string, QueryValue>;

/**
 * تبدیل شیء پارامترهای کوئری به رشته URL با پشتیبانی استاندارد از آرایه‌ها به فرم key[]=1&key[]=2
 * @param params شیء پارامترهای کوئری
 * @returns رشته کوئری با پیشوند علامت سوال (یا رشته خالی در صورت عدم وجود پارامتر)
 */
export function buildQuery(params?: QueryParams | null): string {
  if (!params) return "";

  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      const normalizedKey = key.endsWith("[]") ? key : `${key}[]`;
      for (const item of value) {
        if (item !== undefined && item !== null) {
          pairs.push(`${encodeURIComponent(normalizedKey)}=${encodeURIComponent(String(item))}`);
        }
      }
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
}

/**
 * تنظیمات و گزینه‌های فراخوانی درخواست شبکه
 */
export interface HttpOptions extends Omit<RequestInit, "body"> {
  query?: QueryParams | null;
  body?: BodyInit | Record<string, unknown> | null;
}

/**
 * ساخت آدرس کامل برای پروکسی داخلی
 */
export function resolveProxyUrl(path: string, query?: QueryParams | null): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = cleanPath.startsWith(PROXY_BASE_PATH)
    ? cleanPath
    : `${PROXY_BASE_PATH}${cleanPath}`;

  const queryString = buildQuery(query);
  return `${basePath}${queryString}`;
}

/**
 * کلاینت جنریک و یکپارچه HTTP برای ارسال درخواست‌ها به پروکسی داخلی (/api/proxy/v1)
 *
 * قوانین رفتار:
 * ۱. هدایت تمامی درخواست‌ها به مبدأ یکپارچه /api/proxy/v1<path>
 * ۲. افزودن دائمی هدر Accept: application/json
 * ۳. افزودن هدر Content-Type: application/json فقط در صورت غیر-FormData بودن بادی
 * ۴. پشتیبانی از پارامترهای کوئری و آرایه‌ها به صورت key[]=1&key[]=2
 * ۵. پرتاب ApiError در پاسخ‌های غیر-OK بدون هیچ‌گونه Fallback یا داده ساختگی
 */
export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const { query, body, headers: customHeaders, ...restOptions } = options;

  const url = resolveProxyUrl(path, query);

  const headers = new Headers(customHeaders);
  headers.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let requestBody: BodyInit | null | undefined;

  if (isFormData) {
    // در صورت ارسال فرم‌دیتا، مرورگر خود Content-Type همراه با boundary را ایجاد می‌کند
    headers.delete("Content-Type");
    requestBody = body as FormData;
  } else if (body !== undefined && body !== null) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (
      typeof body === "object" &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !(body instanceof URLSearchParams)
    ) {
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body as BodyInit;
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    const retryHeader = response.headers.get("retry-after") ?? response.headers.get("Retry-After");
    const parsedRetry = retryHeader ? parseInt(retryHeader, 10) : undefined;
    const retryAfter = Number.isFinite(parsedRetry) ? parsedRetry : undefined;

    let errorJson: Record<string, unknown> | null = null;
    try {
      errorJson = (await response.json()) as Record<string, unknown>;
    } catch {
      errorJson = null;
    }

    const message =
      (typeof errorJson?.message === "string" && errorJson.message.trim()) ||
      response.statusText ||
      `خطای شبکه با کد ${response.status}`;

    const fieldErrors =
      errorJson?.errors && typeof errorJson.errors === "object"
        ? (errorJson.errors as Record<string, string[]>)
        : undefined;

    throw new ApiError({
      status: response.status,
      message,
      fieldErrors,
      retryAfter,
      raw: errorJson,
    });
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

http.get = <T>(path: string, options?: Omit<HttpOptions, "method">): Promise<T> =>
  http<T>(path, { ...options, method: "GET" });

http.post = <T>(
  path: string,
  body?: HttpOptions["body"],
  options?: Omit<HttpOptions, "method" | "body">
): Promise<T> => http<T>(path, { ...options, method: "POST", body });

http.put = <T>(
  path: string,
  body?: HttpOptions["body"],
  options?: Omit<HttpOptions, "method" | "body">
): Promise<T> => http<T>(path, { ...options, method: "PUT", body });

http.patch = <T>(
  path: string,
  body?: HttpOptions["body"],
  options?: Omit<HttpOptions, "method" | "body">
): Promise<T> => http<T>(path, { ...options, method: "PATCH", body });

http.delete = <T>(path: string, options?: Omit<HttpOptions, "method">): Promise<T> =>
  http<T>(path, { ...options, method: "DELETE" });
