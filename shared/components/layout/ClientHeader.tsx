"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Plus,
  User,
  LogOut,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export interface ClientHeaderProps {
  onOpenMobileSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export default function ClientHeader({
  onOpenMobileSidebar,
  title = "داشبورد مدیریت تبلیغات",
  subtitle = "سامانه هوشمند اکران و رزرواسیون بیلبورد",
}: ClientHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      {/* سمت راست: دکمه همبرگری موبایل و عنوان صفحه */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="منو"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* سمت چپ: دکمه ثبت رزرو جدید، نوتیفیکیشن‌ها و پروفایل کاربری */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* دکمه رزرو جدید سازه */}
        <Link
          href="/structures"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>کاوش و رزرو سازه جدید</span>
        </Link>

        {/* نوتیفیکیشن‌ها */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            title="اعلان‌ها"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          </button>

          {/* منوی اعلان‌ها */}
          {showNotifications && (
            <div
              className="absolute left-0 mt-2 w-80 rounded-2xl border border-border bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/80 text-xs font-bold text-foreground">
                <span>اعلان‌های کمپین و مالی</span>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  ۲ پیام جدید
                </span>
              </div>

              <div className="py-2 space-y-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      پیش‌فاکتور رسمی صادر شد
                    </span>
                    <span className="text-[10px] text-muted-foreground">امروز</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    پیش‌فاکتور شماره PF-1403-1029 برای بیلبورد اتوبان همت صادر گردید.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      پیشنهاد هوش مصنوعی کمپین
                    </span>
                    <span className="text-[10px] text-muted-foreground">دیروز</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    استراتژی سبد رسانه‌ای پوشاک بهاره با بودجه ۴۵۰ میلیون آماده است.
                  </p>
                </div>
              </div>

              <Link
                href="/client/bookings"
                onClick={() => setShowNotifications(false)}
                className="block text-center pt-2 border-t border-border/80 text-[11px] font-bold text-primary hover:underline"
              >
                مشاهده همه فعالیت‌ها
              </Link>
            </div>
          )}
        </div>

        {/* پروفایل کاربر */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-bold text-foreground">
                رضا کمالی
              </span>
              <span className="block text-[10px] text-muted-foreground font-medium">
                برند دیجی‌کالا
              </span>
            </div>
          </button>

          {/* منوی پروفایل کشویی */}
          {showUserMenu && (
            <div
              className="absolute left-0 mt-2 w-56 rounded-2xl border border-border bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-border/70">
                <div className="font-bold text-foreground">رضا کمالی</div>
                <div className="text-[11px] text-muted-foreground">09121112233</div>
                <div className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  مشتری تایید شده حقوقی
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/structures"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  <span>کاوشگر نقشه سازه‌ها</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link
                  href="/client/media-owner-request"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  <span>ارتقا به پنل مالک رسانه</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>

              <div className="pt-1 border-t border-border/70">
                <Link
                  href="/login"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>خروج از حساب</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { ClientHeader };
