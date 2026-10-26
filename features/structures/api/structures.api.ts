import { http, QueryParams } from "@/shared/lib/http";
import {
  Page,
  fromPaginator,
  fromResource,
  LaravelPaginatorResponse,
  LaravelResourceResponse,
} from "@/shared/lib/pagination";
import {
  Structure,
  StructureTypeItem,
  StructureCategoryItem,
  StructureQueryFilters,
  BookingRequestInput,
  BookingResponse,
} from "../types";

/**
 * نرمال‌سازی آبجکت سازه برگشتی از API جهت سازگاری کامل با کامپوننت‌های فرانت‌اند
 */
export function normalizeStructure(raw: Record<string, unknown> | null | undefined): Structure {
  if (!raw) return raw as unknown as Structure;

  const rawLocation = (raw.location as Record<string, unknown>) || {};
  const rawPricing = (raw.pricing as Record<string, unknown>) || {};
  const rawSpecs = (raw.specs as Record<string, unknown>) || {};
  const rawDimensions = (raw.dimensions as Record<string, unknown>) || {};

  const lat = Number(raw.latitude ?? raw.lat ?? rawLocation.lat ?? 35.75);
  const lng = Number(raw.longitude ?? raw.lng ?? rawLocation.lng ?? 51.41);
  const priceRial = Number(raw.price ?? rawPricing.basePriceMonthly ?? 0);

  const rawImages = raw.images;
  const imageList: string[] = Array.isArray(rawImages)
    ? (rawImages as string[])
    : typeof rawImages === "object" && rawImages && "gallery" in rawImages
    ? ((rawImages as { gallery?: string[] }).gallery || [])
    : typeof raw.image === "string"
    ? [raw.image]
    : [];

  const mainImage =
    imageList[0] ||
    (typeof rawImages === "object" && rawImages && "day" in rawImages
      ? String((rawImages as { day?: string }).day)
      : "") ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";

  const cityName =
    typeof raw.city === "string"
      ? raw.city
      : (raw.city as { name?: string })?.name ||
        (rawLocation.city as string) ||
        "";

  const address =
    (raw.address as string) ||
    (rawLocation.address as string) ||
    "";

  const typeObj =
    raw.type && typeof raw.type === "object"
      ? (raw.type as StructureTypeItem)
      : raw.structure_type && typeof raw.structure_type === "object"
      ? (raw.structure_type as StructureTypeItem)
      : { id: Number(raw.structure_type_id || 1), name: "سازه تبلیغاتی" };

  const categoryObj =
    raw.category && typeof raw.category === "object"
      ? (raw.category as StructureCategoryItem)
      : Array.isArray(raw.categories) && raw.categories.length > 0 && typeof raw.categories[0] === "object"
      ? (raw.categories[0] as StructureCategoryItem)
      : { id: 1, name: "عمومی" };

  const dimensionsLabel =
    (rawDimensions.label as string) ||
    (raw.dimensions as string) ||
    "";

  return {
    id: (raw.id as string | number) ?? raw.uuid ?? "",
    uuid: (raw.uuid as string) ?? undefined,
    code: (raw.code as string) ?? String(raw.id ?? ""),
    title: (raw.title as string) || "سازه تبلیغاتی",
    slug: (raw.slug as string) || String(raw.id ?? ""),
    status: (raw.status as Structure["status"]) || "available",
    statusLabel: (raw.statusLabel as string) || (raw.status === "available" ? "آماده رزرو" : "رزرو شده"),
    price: priceRial,
    latitude: lat,
    longitude: lng,
    address,
    city_id: typeof raw.city_id === "number" ? raw.city_id : undefined,
    city: cityName,
    structure_type_id: typeof raw.structure_type_id === "number" ? raw.structure_type_id : undefined,
    type: typeObj,
    category: categoryObj,
    description: (raw.description as string) || "",
    audience_type: (raw.audience_type as string) || "",
    images: imageList.length > 0 ? imageList : [mainImage],
    image: mainImage,
    location: {
      city: cityName,
      address,
      lat,
      lng,
      district: (rawLocation.district as string) || "",
    },
    pricing: {
      basePriceMonthly: priceRial,
      dailyRate: Number(rawPricing.dailyRate || Math.round(priceRial / 30)),
    },
    specs: {
      minDurationDays: Number(rawSpecs.minDurationDays || 15),
    },
    dimensions: {
      width: Number(rawDimensions.width || 0),
      height: Number(rawDimensions.height || 0),
      area: Number(rawDimensions.area || 0),
      label: dimensionsLabel,
    },
  };
}

/**
 * دریافت لیست انواع سازه‌ها (GET /api/v1/structures/types)
 */
export async function fetchStructureTypes(): Promise<StructureTypeItem[]> {
  const res = await http<{ data?: StructureTypeItem[] } | StructureTypeItem[]>("/structures/types");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

/**
 * دریافت دسته‌بندی‌های سازه‌ها (GET /api/v1/structures/categories)
 */
export async function fetchStructureCategories(): Promise<StructureCategoryItem[]> {
  const res = await http<{ data?: StructureCategoryItem[] } | StructureCategoryItem[]>("/structures/categories");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

/**
 * دریافت لیست سازه‌ها با صفحه بندی و فیلترهای مجاز API (GET /api/v1/structures)
 * پارامترها منحصراً: page, per_page, structure_type_id, category_ids[]
 */
export async function fetchStructures(
  filters: StructureQueryFilters = {}
): Promise<Page<Structure>> {
  const query: QueryParams = {};

  if (filters.page) query.page = filters.page;
  if (filters.per_page) query.per_page = filters.per_page;
  if (filters.structure_type_id) {
    query.structure_type_id = filters.structure_type_id;
  }
  if (filters.category_ids && filters.category_ids.length > 0) {
    query["category_ids[]"] = filters.category_ids;
  }

  const res = await http<
    | LaravelResourceResponse<Record<string, unknown>>
    | LaravelPaginatorResponse<Record<string, unknown>>
    | { data?: Record<string, unknown>[] }
    | Record<string, unknown>[]
  >("/structures", { query });

  let pageData: Page<Record<string, unknown>>;
  if (res && "meta" in res && typeof res.meta === "object") {
    pageData = fromResource(res as LaravelResourceResponse<Record<string, unknown>>);
  } else if (res && "current_page" in res && typeof res.current_page === "number") {
    pageData = fromPaginator(res as LaravelPaginatorResponse<Record<string, unknown>>);
  } else if (Array.isArray(res)) {
    pageData = { items: res, page: 1, lastPage: 1, total: res.length, perPage: res.length };
  } else if (res && "data" in res && Array.isArray(res.data)) {
    const pRes = res as LaravelPaginatorResponse<Record<string, unknown>>;
    pageData = {
      items: res.data,
      page: pRes.current_page ?? 1,
      lastPage: pRes.last_page ?? 1,
      total: pRes.total ?? res.data.length,
      perPage: pRes.per_page ?? res.data.length,
    };
  } else {
    pageData = { items: [], page: 1, lastPage: 1, total: 0, perPage: 15 };
  }

  return {
    ...pageData,
    items: pageData.items.map(normalizeStructure),
  };
}

/**
 * مشاهده جزییات سازه از بک‌اند (GET /api/v1/structures/{id})
 */
export async function fetchStructureById(id: string | number): Promise<Structure | null> {
  const res = await http<Record<string, unknown>>(`/structures/${id}`);
  if (!res || typeof res !== "object") return null;
  const rawData = res.data && typeof res.data === "object" ? res.data : res;
  return normalizeStructure(rawData as Record<string, unknown>);
}

/**
 * دریافت سازه‌های مالک رسانه جاری (GET /api/v1/my-structures)
 * نیازمند پرمیشن structure.view-own
 */
export async function fetchMyStructures(params: {
  page?: number;
  per_page?: number;
} = {}): Promise<Page<Structure>> {
  const query: QueryParams = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;

  const res = await http<
    | LaravelResourceResponse<Record<string, unknown>>
    | LaravelPaginatorResponse<Record<string, unknown>>
    | { data?: Record<string, unknown>[] }
    | Record<string, unknown>[]
  >("/my-structures", { query });

  let pageData: Page<Record<string, unknown>>;
  if (res && "meta" in res && typeof res.meta === "object") {
    pageData = fromResource(res as LaravelResourceResponse<Record<string, unknown>>);
  } else if (res && "current_page" in res && typeof res.current_page === "number") {
    pageData = fromPaginator(res as LaravelPaginatorResponse<Record<string, unknown>>);
  } else if (res && "data" in res && Array.isArray(res.data)) {
    const pRes = res as LaravelPaginatorResponse<Record<string, unknown>>;
    pageData = {
      items: res.data,
      page: pRes.current_page ?? 1,
      lastPage: pRes.last_page ?? 1,
      total: pRes.total ?? res.data.length,
      perPage: pRes.per_page ?? res.data.length,
    };
  } else {
    pageData = { items: [], page: 1, lastPage: 1, total: 0, perPage: 15 };
  }

  return {
    ...pageData,
    items: pageData.items.map(normalizeStructure),
  };
}

/**
 * ثبت سازه جدید با FormData و تصاویر (POST /api/v1/structures)
 * نیازمند پرمیشن structure.create
 */
export async function createStructureApi(
  formData: FormData
): Promise<{ message?: string; data?: unknown }> {
  return http.post<{ message?: string; data?: unknown }>("/structures", formData);
}

/**
 * ویرایش متادیتای سازه با JSON بدون تصویر (PUT /api/v1/structures/{id})
 * نیازمند پرمیشن structure.update
 */
export async function updateStructureApi(
  id: string | number,
  data: Record<string, unknown>
): Promise<{ message?: string; data?: unknown }> {
  return http.put<{ message?: string; data?: unknown }>(`/structures/${id}`, data);
}

/**
 * ثبت درخواست رزرو سازه (POST /api/v1/client/bookings)
 */
export async function submitBookingRequest(
  bookingInput: BookingRequestInput
): Promise<BookingResponse> {
  return http.post<BookingResponse>(
    "/client/bookings",
    bookingInput as unknown as Record<string, unknown>
  );
}
