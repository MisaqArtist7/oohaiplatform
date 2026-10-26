import { City } from "@/features/locations/types";

export type StructureStatus =
  | "available"
  | "booked"
  | "reserved"
  | "pending_review"
  | "inactive"
  | "occupied"
  | "locked";

export interface StructureTypeItem {
  id: number;
  name: string;
  is_active?: boolean;
  slug?: string;
  description?: string;
  count?: number;
  iconName?: string;
}

export type StructureType = StructureTypeItem;

export interface StructureCategoryItem {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  count?: number;
}

export type StructureCategory = StructureCategoryItem;

export interface StructureDimensions {
  width: number;
  height: number;
  area: number;
  label: string;
}

export interface StructureLocation {
  city: string;
  province?: string;
  district?: string;
  address: string;
  lat: number;
  lng: number;
  viewingAngle?: string;
  trafficFlow?: string;
}

export interface StructurePricing {
  basePriceMonthly: number;
  dailyRate?: number;
  currency?: string;
  discountMonthlyPercent?: number;
  printablePrice?: string;
}

export interface StructureSpecs {
  lighting?: string;
  orientation?: string;
  visibilityScore?: number;
  minDurationDays?: number;
  mediaType?: string;
  isTwoSided?: boolean;
  rushHourPeak?: string;
}

export interface StructureImagesObj {
  day?: string;
  night?: string;
  gallery: string[];
}

export interface StructureOwner {
  name: string;
  verified?: boolean;
  rating?: number;
  contactNumber?: string;
}

/**
 * مدل سازه در فرانت‌اند منطبق با خروجی API واقعی لاراول
 */
export interface Structure {
  id: string | number;
  uuid?: string;
  title: string;
  code?: string;
  slug?: string;
  city_id?: number;
  city?: City | { id: number; name: string } | string;
  structure_type_id?: number;
  type?: StructureTypeItem;
  category_ids?: number[];
  category?: StructureCategoryItem;
  categories?: StructureCategoryItem[];
  status: StructureStatus;
  statusLabel?: string;
  latitude?: number;
  longitude?: number;
  price?: number; // به ریال طبق استاندارد API بک‌اند
  address?: string;
  description?: string;
  audience_type?: string;
  images?: string[] | StructureImagesObj;
  created_at?: string;
  updated_at?: string;

  // فیلدهای کمکی لایه Presentation
  image?: string;
  dimensions?: StructureDimensions;
  location?: StructureLocation;
  pricing?: StructurePricing;
  specs?: StructureSpecs;
  features?: string[];
  owner?: StructureOwner;
  targetAudience?: string[];
}

/**
 * فیلترهای مجاز ارسالی به اندپوینت GET /structures طبق مشخصات دقیق بک‌اند:
 * پارامترها فقط: page, per_page, structure_type_id, category_ids[]
 */
export interface StructureQueryFilters {
  page?: number;
  per_page?: number;
  structure_type_id?: number | string;
  category_ids?: (number | string)[];
}

/**
 * نام مستعار برای سازگاری با ماژول‌های موجود
 */
export type StructureFilters = StructureQueryFilters & {
  // فیلترهای غیرفعال‌شده که در بک‌اند پشتیبانی نمی‌شوند (ثبت در BACKEND_GAPS.md)
  search?: string;
  typeId?: string;
  categoryId?: string;
  status?: StructureStatus | "all";
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "recommended" | "price_asc" | "price_desc" | "visibility" | "newest";
};

export interface BookingRequestInput {
  structureId: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  fullName: string;
  phone: string;
  brandName: string;
  notes?: string;
  estimatedPrice?: number;
}

export interface BookingResponse {
  success: boolean;
  trackingCode: string;
  bookingId: string;
  message: string;
  bookingDetails: {
    structureId: string;
    structureTitle: string;
    structureCode: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    fullName: string;
    phone: string;
    brandName: string;
    notes?: string;
    totalPrice: number;
    status: "pending_review" | "confirmed";
    createdAt: string;
  };
}
