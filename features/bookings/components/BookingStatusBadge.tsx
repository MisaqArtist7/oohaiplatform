import React from "react";
import { BookingStatus, BookingStatusValue } from "../types";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusColorMap: Record<BookingStatusValue, string> = {
  pending_review:
    "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  locked_for_contract:
    "bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  proforma_issued:
    "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  payment_submitted:
    "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  occupied:
    "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  completed:
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  rejected:
    "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  expired:
    "bg-rose-50/70 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900",
};

const sizeClasses = {
  sm: "text-[11px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export default function BookingStatusBadge({
  status,
  className = "",
  size = "md",
}: BookingStatusBadgeProps) {
  const colorClass =
    statusColorMap[status.value] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full border shadow-2xs whitespace-nowrap transition-colors ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {status.label}
    </span>
  );
}
