import { ClientBooking } from "./client-dashboard";

export type AdminBookingStatus =
  | "pending_review"
  | "locked_for_contract"
  | "proforma_issued"
  | "payment_submitted"
  | "approved"
  | "active"
  | "rejected"
  | "cancelled";

export interface AdminBooking extends ClientBooking {
  customer?: {
    fullName: string;
    companyName: string;
    phone: string;
  };
  rejectionReason?: string;
  lockedAt?: string;
  approvedAt?: string;
  financialManagerNote?: string;
}

export interface AdminMediaOwnerRequest {
  id: string;
  trackingCode: string;
  companyName: string;
  nationalId: string;
  contactPerson: string;
  phone: string;
  address: string;
  structuresCount: number;
  province: string;
  status: "pending" | "approved" | "rejected";
  statusLabel: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  documents: Array<{
    id: string;
    title: string;
    fileUrl: string;
    fileSize: string;
  }>;
}

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  permissionsCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  fullName?: string;
  phone: string;
  email: string;
  nationalCode?: string;
  company?: string;
  department: string;
  roles: AdminRole[];
  status: "active" | "inactive" | "suspended";
  statusLabel: string;
  createdAt: string;
  lastLogin: string;
  avatarUrl?: string;
}

export interface BookingAuditLog {
  id: string;
  bookingId: string;
  actor: string;
  action: string;
  previousStatus?: string;
  newStatus: string;
  timestamp: string;
  note?: string;
  ipAddress?: string;
}

export interface AdminBookingFilterParams {
  status?: string;
  customer?: string;
  structure?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
