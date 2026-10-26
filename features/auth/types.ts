export type AuthRole = "client" | "media_owner" | "super_admin";

export type AuthPermission =
  | "client.view-bookings"
  | "structure.view-own"
  | "structure.create"
  | "structure.update"
  | "admin.manage-media-owner-requests"
  | "admin.manage-user-roles";

export interface User {
  id: number | string;
  uuid?: string;
  name: string;
  phone: string;
  is_active?: boolean;
  role: AuthRole;
  permissions: AuthPermission[];
}

export interface RegisterPayload {
  name: string;
  phone: string;
}

export interface RequestOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  next_step?: "request_otp" | "verify_otp" | string | null;
  errors?: Record<string, string[]>;
  retry_after?: number;
}

export interface VerifyOtpSuccessData {
  token: string;
  user: User;
}

export type AuthMode = "login" | "register" | "verify";
