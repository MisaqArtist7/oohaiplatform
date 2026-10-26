"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Sparkles, User, Menu, X, Building2, ShieldAlert, CalendarCheck } from "lucide-react";
import LogoutButton from "@/shared/components/LogoutButton";

import { useSession } from "@/features/auth/hooks/use-session";
import { getHomePath } from "@/features/auth/lib/get-home-path";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading: loading } = useSession();

  const isSuperAdmin = user?.role === "super_admin";
  const isMediaOwner = user?.role === "media_owner";
  const dashboardUrl = getHomePath(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* لوگو و نام پلتفرم */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                بیلبورد<span className="text-primary">مارکت</span>
              </span>
              <span className="block text-[10px] text-muted-foreground">
                اتوماسیون هوشمند تبلیغات محیطی
              </span>
            </div>
          </Link>

          {/* منوی ناوبری دسکتاپ */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/structures"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <MapPin className="h-4 w-4" />
              کاوشگر نقشه
            </Link>
            <Link
              href="/client/bookings"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <CalendarCheck className="h-4 w-4 text-primary" />
              رزروهای من
            </Link>
            <Link
              href="/client/proposals"
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary transition-all hover:bg-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              مشاور هوشمند کمپین (AI)
            </Link>
            <Link
              href="/media-owner/structures"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Building2 className="h-4 w-4 text-amber-600" />
              پنل مالکان رسانه
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1.5 transition-colors hover:text-indigo-600"
            >
              <ShieldAlert className="h-4 w-4 text-indigo-600" />
              پنل مدیریت و مالی
            </Link>
          </nav>
        </div>

        {/* دکمه‌های سمت چپ (ورود / پروفایل کاربری) */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-10 w-28 rounded-xl bg-muted/60 animate-pulse" />
          ) : user ? (
            <>
            <Link
              href={dashboardUrl}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-muted"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {isSuperAdmin ? (
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                ) : isMediaOwner ? (
                  <Building2 className="h-4 w-4 text-amber-600" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="max-w-32 truncate">{user.name || "حساب کاربری"}</span>
              {isSuperAdmin && (
                <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  سوپر ادمین
                </span>
              )}
              {isMediaOwner && (
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  مالک رسانه
                </span>
              )}
            </Link>
            <LogoutButton variant="icon" label="خروج از حساب" />
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              <User className="h-4 w-4" />
              ورود | ثبت‌نام
            </Link>
          )}
        </div>

        {/* دکمه همبرگری موبایل */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden items-center justify-center rounded-lg border border-border p-2 text-foreground hover:bg-muted"
          aria-label="منو"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* منوی کشویی موبایل */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/structures"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <MapPin className="h-4 w-4 text-primary" />
            کاوشگر نقشه
          </Link>
          <Link
            href="/client/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <CalendarCheck className="h-4 w-4 text-primary" />
            رزروهای من
          </Link>
          <Link
            href="/client/proposals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
          >
            <Sparkles className="h-4 w-4" />
            مشاور هوشمند کمپین (AI)
          </Link>
          <Link
            href="/media-owner/structures"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Building2 className="h-4 w-4 text-amber-600" />
            پنل مالکان رسانه
          </Link>
          <Link
            href="/admin/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
          >
            <ShieldAlert className="h-4 w-4 text-indigo-600" />
            پنل مدیریت و مالی (Admin)
          </Link>
          <div className="pt-2 border-t border-border">
            {loading ? (
              <div className="h-10 w-full rounded-xl bg-muted/60 animate-pulse" />
            ) : user ? (
              <>
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {isSuperAdmin ? <ShieldAlert className="h-4 w-4 text-indigo-600" /> : <User className="h-4 w-4" />}
                  </div>
                  <span>{user.name || "حساب کاربری"}</span>
                </div>
                {isSuperAdmin ? (
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    سوپر ادمین
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">مشاهده داشبورد</span>
                )}
              </Link>
              <LogoutButton className="w-full justify-center mt-2 border border-border" label="خروج از حساب کاربری" />
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <User className="h-4 w-4" />
                ورود | ثبت‌نام با شماره موبایل
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export { Header };
