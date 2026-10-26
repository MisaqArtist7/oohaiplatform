"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { BookingStatusValue } from "../types";
import { toPersianDigits } from "@/shared/lib/digits";

interface LockCountdownProps {
  lockedUntil: string | null;
  isLockExpired: boolean;
  statusValue: BookingStatusValue;
  onExpired?: () => void;
  className?: string;
}

function pad2(num: number): string {
  return String(num).padStart(2, "0");
}

export default function LockCountdown({
  lockedUntil,
  isLockExpired,
  statusValue,
  onExpired,
  className = "",
}: LockCountdownProps) {
  const isTargetStatus =
    statusValue === "locked_for_contract" || statusValue === "proforma_issued";

  const expiredFiredRef = useRef(false);

  // محاسبه میلی‌ثانیه‌های باقیمانده
  const computeRemainingMs = React.useCallback((): number => {
    if (!lockedUntil) return 0;
    const targetMs = new Date(lockedUntil).getTime();
    if (isNaN(targetMs)) return 0;
    return targetMs - Date.now();
  }, [lockedUntil]);

  const [remainingMs, setRemainingMs] = useState<number>(computeRemainingMs);

  useEffect(() => {
    if (!isTargetStatus || isLockExpired || !lockedUntil) return;

    const interval = setInterval(() => {
      const ms = computeRemainingMs();
      setRemainingMs(ms);

      if (ms <= 0 && !expiredFiredRef.current) {
        expiredFiredRef.current = true;
        if (onExpired) {
          onExpired();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil, isLockExpired, isTargetStatus, onExpired, computeRemainingMs]);

  if (!isTargetStatus) {
    return null;
  }

  if (isLockExpired || remainingMs <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 ${className}`}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>مهلت قفل پایان یافته</span>
      </span>
    );
  }

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 ${className}`}
    >
      <Clock className="h-3.5 w-3.5 animate-pulse text-amber-600 shrink-0" />
      <span>قفل تا:</span>
      <span className="font-mono text-[13px] tracking-wider" dir="ltr">
        {toPersianDigits(formattedTime)}
      </span>
    </span>
  );
}
