"use client";

import { Menu, User as UserIcon } from "lucide-react";
import { LogoutButton } from "@/shared/components";
import { useSession } from "@/features/auth/hooks/use-session";
import { USER_ROLE_LABELS } from "../types";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  onOpenMobileMenu,
  title = "پنل مدیریت",
  subtitle,
}: AdminHeaderProps) {
  const { user } = useSession();

  const roleLabel = user?.role
    ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS] || user.role
    : "مدیر";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* بخش راست: دکمه موبایل و عنوان صفحه */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* بخش چپ: اطلاعات کاربر واقعی لاگین‌شده و دکمه خروج */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1.5 pr-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user.name || user.phone}
              </p>
              <p className="text-[10px] text-slate-500 font-medium dir-ltr text-right">
                {user.phone}
              </p>
            </div>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
              {roleLabel}
            </span>
          </div>
        )}

        <LogoutButton variant="icon" label="خروج از پنل مدیریت" />
      </div>
    </header>
  );
}
