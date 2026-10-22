export type StructureStatus = 'available' | 'booked' | 'reserved' | 'pending_review' | 'inactive';

export interface StructureType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
  iconName?: string;
}

export interface StructureCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface StructureDimensions {
  width: number;
  height: number;
  area: number;
  label: string;
}

export interface StructureLocation {
  city: string;
  province: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  viewingAngle: string;
  trafficFlow: string;
}

export interface StructurePricing {
  basePriceMonthly: number;
  dailyRate: number;
  currency: string;
  discountMonthlyPercent?: number;
  printablePrice: string;
}

export interface StructureSpecs {
  lighting: string;
  orientation: string;
  visibilityScore: number; // 0 - 100
  minDurationDays: number;
  mediaType: string;
  isTwoSided: boolean;
  rushHourPeak?: string;
}

export interface StructureImages {
  day: string;
  night: string;
  gallery: string[];
}

export interface StructureOwner {
  name: string;
  verified: boolean;
  rating: number;
  contactNumber?: string;
}

export interface Structure {
  id: string;
  code: string;
  title: string;
  slug: string;
  type: StructureType;
  category: StructureCategory;
  status: StructureStatus;
  statusLabel: string;
  dimensions: StructureDimensions;
  location: StructureLocation;
  pricing: StructurePricing;
  specs: StructureSpecs;
  images: StructureImages;
  description: string;
  features: string[];
  owner: StructureOwner;
  targetAudience?: string[];
  createdAt: string;
}

export interface StructureFilters {
  search?: string;
  typeId?: string;
  categoryId?: string;
  status?: StructureStatus | 'all';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'recommended' | 'price_asc' | 'price_desc' | 'visibility' | 'newest';
}

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
    status: 'pending_review' | 'confirmed';
    createdAt: string;
  };
}
