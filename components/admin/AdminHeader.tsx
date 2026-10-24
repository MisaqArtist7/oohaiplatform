"use client";

import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  Lock,
} from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  onOpenMobileMenu,
  title = "داشبورد مدیریت و مالی OOHAI",
  subtitle = "نظارت بر رزرواسیون سازه‌ها، قراردادها و احراز هویت مالکان",
}: AdminHeaderProps) {
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

        <div className="hidden sm:block">
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60">
              مدیریت کل
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
        <div className="sm:hidden font-bold text-sm text-slate-900 truncate">
          {title}
        </div>
      </div>

      {/* بخش چپ: دسترسی سریع، اعلان‌ها و پروفایل مدیر */}
      <div className="flex items-center gap-3">
        {/* لینک سریع به کاوشگر سازه‌ها روی نقشه */}
        <Link
          href="/structures"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span>مشاهده نقشه عمومی</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* دکمه جستجو */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="جستجوی سریع شناسه، مشتری، سازه..."
            className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-3 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* دکمه اعلان‌ها */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          title="اعلان‌های سیستمی"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* پروفایل مدیر ارشد مالی */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1.5 pr-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <div className="hidden xl:block text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              مدیر مالی و اعتبارات
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              دسترسی سطح ۴ (Senior Admin)
            </p>
          </div>
          <span className="hidden sm:inline-flex rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
            مدیریت
          </span>
        </div>

        {/* دکمه خروج سریع */}
        <LogoutButton variant="icon" label="خروج از پنل مدیریت" />
      </div>
    </header>
  );
}
