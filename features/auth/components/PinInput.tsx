"use client";

import React, { useRef, useEffect } from "react";
import { toEnglishDigits } from "@/shared/lib/digits";

export interface PinInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // اطمینان از مقداردهی آرایه ارقام
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  // هنگام پاک شدن مقدار (مثلاً پس از خطای کد نادرست/منقضی)، فوکوس خودکار روی اولین خانه برمی‌گردد
  useEffect(() => {
    if (!value && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [value, disabled]);

  const setPinValue = (newDigits: string[]) => {
    const combined = newDigits.join("");
    onChange(combined);
    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawVal = e.target.value;
    const cleanDigits = toEnglishDigits(rawVal).replace(/\D/g, "");

    if (!cleanDigits) {
      const next = [...digits];
      next[index] = "";
      setPinValue(next);
      return;
    }

    // اگر کاربر چند رقم را با هم وارد کرده باشد (مثلاً کیبورد پیش‌بینی)
    if (cleanDigits.length > 1) {
      handlePastedContent(cleanDigits, index);
      return;
    }

    const next = [...digits];
    next[index] = cleanDigits.slice(-1); // فقط آخرین رقم
    setPinValue(next);

    // حرکت به خانه بعدی
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // اگر خالی است به خانه قبلی برو و پاکش کن
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = "";
        setPinValue(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      if (index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePastedContent = (pasted: string, fromIndex = 0) => {
    const clean = toEnglishDigits(pasted).replace(/\D/g, "");
    if (!clean) return;

    const next = [...digits];
    for (let i = 0; i < clean.length && fromIndex + i < length; i++) {
      next[fromIndex + i] = clean[i];
    }
    setPinValue(next);

    const targetFocus = Math.min(fromIndex + clean.length, length - 1);
    inputRefs.current[targetFocus]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    handlePastedContent(pastedData, 0);
  };

  return (
    <div
      dir="ltr"
      className="flex items-center justify-center gap-2 sm:gap-3 my-2"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`رقم ${i + 1} از ${length} کد تأیید`}
          className={`h-12 w-11 sm:h-14 sm:w-13 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border bg-muted/40 transition-all duration-200 select-all focus:outline-none focus:bg-background ${
            disabled ? "opacity-60 cursor-not-allowed bg-muted/70" : ""
          } ${
            hasError
              ? "border-danger text-danger focus:ring-4 focus:ring-danger/20"
              : digit
              ? "border-primary text-foreground shadow-xs ring-1 ring-primary/30"
              : "border-border text-foreground hover:border-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/20"
          }`}
        />
      ))}
    </div>
  );
}
