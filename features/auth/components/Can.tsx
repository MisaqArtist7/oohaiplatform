"use client";

import React from "react";
import { useHasPermission } from "../hooks/use-session";
import type { AuthPermission } from "../types";

export interface CanProps {
  perm: AuthPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * کامپوننت گارد سطح المان (UI Permission Guard)
 * اگر کاربر مجوز مشخص‌شده را داشته باشد فرزندان را رندر می‌کند.
 */
export function Can({ perm, children, fallback = null }: CanProps) {
  const hasPerm = useHasPermission(perm);
  if (!hasPerm) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
