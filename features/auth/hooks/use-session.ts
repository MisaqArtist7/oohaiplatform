"use client";

import { useQuery } from "@tanstack/react-query";
import type { User, AuthRole, AuthPermission } from "../types";

export const SESSION_QUERY_KEY = ["auth", "session"] as const;

/**
 * دریافت سشن جاری کاربر از Route Handler داخلی (/api/auth/session)
 */
export async function fetchSession(): Promise<User | null> {
  const res = await fetch("/api/auth/session", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`خطای دریافت نشست کاربر (${res.status})`);
  }

  const json = await res.json().catch(() => null);
  if (!json?.authenticated || !json?.user) {
    return null;
  }

  return json.user as User;
}

/**
 * هوک دریافت سشن کاربر با React Query
 * خروجی: { user, isLoading, isAuthenticated }
 */
export function useSession() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 60 * 1000, // ۱ دقیقه
    retry: false,
    refetchOnWindowFocus: true,
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
  };
}

/**
 * هوک بررسی تطابق نقش کاربر
 */
export function useHasRole(role: AuthRole): boolean {
  const { user } = useSession();
  return user?.role === role;
}

/**
 * هوک بررسی وجود مجوز (Permission) در دسترسی‌های کاربر
 */
export function useHasPermission(perm: AuthPermission): boolean {
  const { user } = useSession();
  return !!user?.permissions?.includes(perm);
}
