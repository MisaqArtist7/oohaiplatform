export type BookingStatusValue =
  | "pending_review"
  | "locked_for_contract"
  | "proforma_issued"
  | "payment_submitted"
  | "occupied"
  | "rejected"
  | "expired"
  | "completed";

export type BookingAction =
  | "lock_for_contract"
  | "issue_proforma"
  | "submit_payment"
  | "approve_payment"
  | "reject"
  | "complete";

export interface BookingStatus {
  value: BookingStatusValue;
  label: string;
}

export interface BookingUser {
  id: number;
  name: string;
  phone: string;
}

export interface BookingStructureLocation {
  latitude: number;
  longitude: number;
}

export interface BookingStructure {
  id: number;
  uuid: string;
  title: string;
  price: string;
  location: BookingStructureLocation;
  address: string;
}

export interface BookingLog {
  id: number;
  booking_id: number;
  changed_by_user_id: number;
  user_role: string;
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  note: string | null;
  created_at: string;
}

export interface BookingDocument {
  id: number;
  booking_id: number;
  uuid: string;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: number;
  created_at: string;
}

export interface Booking {
  id: number;
  uuid: string;
  user_id: number;
  user?: BookingUser;
  structure_id: number;
  structure: BookingStructure;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  locked_until: string | null;
  is_lock_expired: boolean;
  total_amount: string;
  payment_reference: string | null;
  rejection_reason: string | null;
  allowed_actions: BookingAction[];
  logs?: BookingLog[];
  documents?: BookingDocument[];
  created_at: string;
  updated_at: string;
}

export interface CreateBookingPayload {
  structure_id: number;
  start_date: string; // ISO YYYY-MM-DD
  end_date: string; // ISO YYYY-MM-DD
  company_name: string;
  national_id: string; // 10 or 11 digits
  total_amount: number; // Rial
  note?: string;
}

export interface BookingListFilters {
  page?: number;
  per_page?: number;
  status?: BookingStatusValue | string;
}

// تایپ‌های مربوط به پروپوزال و مالکان رسانه (تسک‌های ۸ و مرتبط)
export interface ProposalRecommendedStructure {
  structureId: string;
  title: string;
  type: string;
  location: string;
  monthlyPrice: number;
  reason: string;
}

export interface ProposalItem {
  id: string;
  trackingNumber: string;
  title: string;
  budget: number;
  city: string;
  cityId: number;
  scenario: string;
  status: "ai_generated" | "under_review" | "approved" | "converted";
  statusLabel: string;
  createdAt: string;
  strategy?: {
    summary: string;
    targetAudience: string;
    estimatedReach: string;
    recommendedStructures: ProposalRecommendedStructure[];
    budgetDistribution: Array<{
      category: string;
      percentage: number;
      amount: number;
    }>;
  };
}

export interface MediaOwnerApplication {
  id?: string;
  companyName: string;
  nationalId: string;
  contactPerson: string;
  phone: string;
  address: string;
  structuresCount: number;
  documents?: string[];
  status?: "pending" | "approved" | "rejected";
  submittedAt?: string;
  trackingCode?: string;
}
