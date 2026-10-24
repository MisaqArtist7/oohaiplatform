"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LogoutButtonProps {
  className?: string;
  variant?: "sidebar" | "icon" | "header" | "dropdown";
  showText?: boolean;
  label?: string;
  redirectTo?: string;
}

export default function LogoutButton({
  className = "",
  variant = "sidebar",
  showText = true,
  label = "خروج از حساب کاربری",
  redirectTo = "/login",
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      toast.success("با موفقیت از حساب کاربری خارج شدید.");
    } catch {
      // حتی اگر درخواست شبکه با خطا مواجه شد، به خروج ادامه می‌دهیم
    } finally {
      // استفاده از window.location.href برای پاکسازی کامل حافظه و رفرش وضعیت احراز هویت
      window.location.href = redirectTo;
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        title={label}
        aria-label={label}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </button>
    );
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        title={label}
        aria-label={label}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer ${className}`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
        {showText && <span>{label}</span>}
      </button>
    );
  }

  // پیش‌فرض: سبک مناسب سایدبارها
  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title={label}
      aria-label={label}
      className={`inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
      ) : (
        <LogOut className="h-4 w-4 text-rose-500" />
      )}
      {showText && <span>{label}</span>}
    </button>
  );
}
