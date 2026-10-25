/**
 * خروجی استاندارد و یکپارچه صفحه‌بندی در سراسر فرانت‌اند
 */
export interface Page<T> {
  items: T[];
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
}

/**
 * متادیتای پاسخ استاندارد Resource Collection لاراول
 */
export interface ResourcePaginationMeta {
  current_page: number;
  from?: number | null;
  last_page: number;
  path?: string;
  per_page: number;
  to?: number | null;
  total: number;
}

/**
 * لینک‌های ناوبری استاندارد Resource لاراول
 */
export interface ResourcePaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

/**
 * ساختار پاسخ استاندارد Laravel Resource Collection
 * نمونه: { data: [...], meta: { current_page, last_page, total, per_page }, links: { ... } }
 */
export interface LaravelResourceResponse<T> {
  data: T[];
  meta: ResourcePaginationMeta;
  links?: ResourcePaginationLinks;
}

/**
 * ساختار خروجی مستقیم LengthAwarePaginator لاراول
 * نمونه: { data: [...], current_page, last_page, total, per_page, ... }
 */
export interface LaravelPaginatorResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from?: number | null;
  to?: number | null;
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  path?: string;
}

/**
 * آداپتر تبدیل پاسخ‌های Resource لاراول به مدل یکپارچه Page<T>
 */
export function fromResource<T>(response: LaravelResourceResponse<T>): Page<T> {
  const items = Array.isArray(response.data) ? response.data : [];
  const meta = response.meta ?? ({} as Partial<ResourcePaginationMeta>);

  return {
    items,
    page: meta.current_page ?? 1,
    lastPage: meta.last_page ?? 1,
    total: meta.total ?? items.length,
    perPage: meta.per_page ?? (items.length > 0 ? items.length : 15),
  };
}

/**
 * آداپتر تبدیل خروجی مستقیم Paginator لاراول به مدل یکپارچه Page<T>
 */
export function fromPaginator<T>(response: LaravelPaginatorResponse<T>): Page<T> {
  const items = Array.isArray(response.data) ? response.data : [];

  return {
    items,
    page: response.current_page ?? 1,
    lastPage: response.last_page ?? 1,
    total: response.total ?? items.length,
    perPage: response.per_page ?? (items.length > 0 ? items.length : 15),
  };
}
