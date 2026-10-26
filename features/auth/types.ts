export interface UserRole {
  id?: number | string;
  name: string;
}

export interface User {
  id: number | string;
  uuid?: string;
  name: string;
  phone: string;
  is_active?: boolean;
  roles?: (string | UserRole)[];
  permissions?: string[];
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
}

export interface VerifyOtpSuccessData {
  token: string;
  user: User;
}

export type AuthMode = "login" | "register" | "verify";
