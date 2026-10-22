export type BookingStatusType =
  | "pending_review"
  | "awaiting_payment"
  | "active"
  | "cancelled"
  | "completed";

export interface BookingTimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  status: string;
  isDone: boolean;
  isCurrent?: boolean;
}

export interface BookingDocument {
  id: string;
  title: string;
  type: "proforma" | "contract" | "installation_order" | "invoice";
  typeLabel: string;
  date: string;
  fileSize: string;
  downloadUrl: string;
  requiresSignature?: boolean;
}

export interface BookingPayment {
  id: string;
  method: "satna" | "sayad_check";
  methodLabel: string;
  amount: number;
  trackingCode?: string;
  bankName?: string;
  checkSerial?: string;
  checkSayadId?: string;
  dueDate?: string;
  submittedAt: string;
  status: "pending_verification" | "verified" | "rejected";
  statusLabel: string;
  receiptUrl?: string;
  notes?: string;
}

export interface ClientBooking {
  id: string;
  trackingCode: string;
  structure: {
    id: string;
    code: string;
    title: string;
    address: string;
    district: string;
    dimensions: string;
    image: string;
    type: string;
    category: string;
  };
  startDate: string;
  endDate: string;
  durationDays: number;
  totalPrice: number;
  status: {
    value: BookingStatusType;
    label: string;
    color: "amber" | "indigo" | "emerald" | "rose" | "slate";
  };
  brandName: string;
  contactPerson: string;
  contactPhone: string;
  createdAt: string;
  lockedUntil?: string;
  proforma?: {
    id: string;
    number: string;
    issueDate: string;
    expiresAt: string;
    amount: number;
    downloadUrl: string;
  };
  timeline: BookingTimelineItem[];
  payments: BookingPayment[];
  documents: BookingDocument[];
}

export interface PaymentSubmissionInput {
  bookingId: string;
  method: "satna" | "sayad_check";
  amount: number;
  bankName?: string;
  trackingCode?: string;
  checkSerial?: string;
  checkSayadId?: string;
  dueDate?: string;
  receiptFileName?: string;
  notes?: string;
}

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
