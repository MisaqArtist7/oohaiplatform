"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  PlusCircle,
  Building2,
  MapPin,
} from "lucide-react";

interface MediaOwnerHeaderProps {
  onToggleMobile: () => void;
  title?: string;
}

export default function MediaOwnerHeader({
  onToggleMobile,
  title = "پنل مدیریت سازه‌ها",
}: MediaOwnerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white/90 backdrop-blur-md px-4 sm:px-6">
      {/* دکمه همبرگری موبایل و عنوان صفحه */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border text-slate-700 hover:bg-slate-100"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <span className="hidden sm:inline-block rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
              مالک رسانه
            </span>
          </h1>
        </div>
      </div>

      {/* ابزارهای هدر و دکمه‌های سریع */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* لینک سریع به کاوشگر نقشه */}
        <Link
          href="/structures"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>کاوشگر نقشه</span>
        </Link>

        {/* دکمه ثبت سازه جدید */}
        <Link
          href="/media-owner/structures/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">ثبت سازه جدید</span>
          <span className="sm:hidden">ثبت سازه</span>
        </Link>

        {/* پروفایل مالک رسانه */}
        <div className="flex items-center gap-2 pr-2 border-r border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-xs">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-foreground truncate max-w-36">
              آوای رسانه تهران
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>احراز هویت شده</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
