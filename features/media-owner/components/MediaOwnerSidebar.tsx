"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  PlusCircle,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { LogoutButton } from "@/shared/components";

interface MediaOwnerSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function MediaOwnerSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: MediaOwnerSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "سازه‌های من",
      href: "/media-owner/structures",
      icon: Layers,
      badge: "مدیریت",
      exact: true,
    },
    {
      title: "ثبت سازه جدید",
      href: "/media-owner/structures/new",
      icon: PlusCircle,
      badge: "جدید",
      exact: true,
    },
    {
      title: "کاوشگر سازه‌ها روی نقشه",
      href: "/structures",
      icon: MapPin,
      exact: true,
    },
    {
      title: "داشبورد رزروها (مشتری)",
      href: "/client/bookings",
      icon: CalendarCheck,
      exact: false,
    },
  ];

  const isActive = (itemHref: string) => {
    if (itemHref === "/media-owner/structures") {
      return pathname === "/media-owner/structures";
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* بک‌دراپ تاریک در حالت موبایل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* سایدبار اصلی */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 flex flex-col border-l border-border bg-white transition-all duration-300 ease-in-out shadow-xs ${
          isCollapsed ? "w-20" : "w-68"
        } ${
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* هدر سایدبار */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link
            href="/media-owner/structures"
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate text-right">
                <span className="block text-sm font-black text-foreground tracking-tight">
                  پنل مالکان رسانه
                </span>
                <span className="block text-[10px] text-muted-foreground font-medium">
                  مدیریت و واگذاری بیلبوردها
                </span>
              </div>
            )}
          </Link>

          {/* دکمه باز/بسته کردن سایدبار در دسکتاپ */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-foreground transition-colors"
            title={isCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* برچسب مشخصات مالک رسانه لاگین‌شده */}
        {!isCollapsed && (
          <div className="m-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span className="truncate">کانون آوای رسانه تهران</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-amber-700/90 mt-1">
              <span>مالک تایید شده</span>
              <span className="font-mono font-bold bg-amber-100/80 px-1.5 py-0.2 rounded text-[10px]">
                کد: MO-1044
              </span>
            </div>
          </div>
        )}

        {/* لیست آیتم‌های ناوبری */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all relative ${
                  active
                    ? "bg-amber-600 text-white shadow-xs font-black"
                    : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                    active ? "text-white" : "text-slate-500"
                  }`}
                />

                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* کارت فوتر سایدبار: انتقال به داشبورد مشتری یا صفحه اصلی */}
        <div className="p-3 border-t border-border space-y-2">
          {!isCollapsed && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>پشتیبانی مالکان:</span>
                <span className="font-mono text-amber-700 font-bold">۰۲۱-۸۸۴۴۲۲۱۱</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                سامانه هوشمند مانیتورینگ اکران و تسویه حساب‌های ریالی
              </p>
            </div>
          )}

          <Link
            href="/"
            className={`flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="بازگشت به سایت اصلی"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>صفحه اصلی بیلبورد مارکت</span>}
          </Link>

          <div className="pt-1 border-t border-border/60">
            <LogoutButton
              className={`w-full ${isCollapsed ? "justify-center px-0" : ""}`}
              showText={!isCollapsed}
              label="خروج از پنل مالک رسانه"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
