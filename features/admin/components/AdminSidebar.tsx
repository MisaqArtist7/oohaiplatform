"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Building2,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRightLeft,
  Sparkles,
  MapPin,
  FileCheck2,
  Lock,
} from "lucide-react";
import { LogoutButton } from "@/shared/components";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "مدیریت و گردش‌کار رزروها",
      href: "/admin/bookings",
      icon: CalendarCheck,
      badge: "مرکزی",
      description: "بررسی، قفل ۴۸ ساعته و صدور پیش‌فاکتور",
    },
    {
      title: "درخواست‌های مالکان رسانه",
      href: "/admin/media-owner-requests",
      icon: Building2,
      badge: "احراز هویت",
      description: "بررسی مدارک شرکت‌های تبلیغاتی",
    },
    {
      title: "مدیریت کاربران و نقش‌ها",
      href: "/admin/users",
      icon: Users,
      badge: "دسترسی‌ها",
      description: "سطوح اختیارات مالی، عملیاتی و ادمین",
    },
  ];

  const quickLinks = [
    {
      title: "پنل مشتریان (رزروهای من)",
      href: "/client/bookings",
      icon: ArrowRightLeft,
    },
    {
      title: "پنل مالکان رسانه (سازه‌ها)",
      href: "/media-owner/structures",
      icon: Building2,
    },
    {
      title: "کاوشگر سازه‌ها روی نقشه",
      href: "/structures",
      icon: MapPin,
    },
    {
      title: "مشاور هوشمند کمپین (AI)",
      href: "/client/proposals",
      icon: Sparkles,
    },
  ];

  const isActive = (itemHref: string) => {
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* بک‌دراپ تاریک در حالت موبایل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* ستون کناری اصلی سایدبار مدیریت */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-slate-200 bg-white transition-all duration-300 shadow-sm lg:static ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        } ${
          mobileOpen ? "translate-x-0 w-72" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* هدر سایدبار و لوگو */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 bg-slate-900 text-white">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2.5 overflow-hidden"
            onClick={onCloseMobile}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Lock className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  پلتفرم <span className="text-indigo-400">OOHAI</span>
                </span>
                <span className="block text-[11px] text-slate-300 font-medium">
                  میز کار مدیریت و مالی
                </span>
              </div>
            )}
          </Link>

          {/* دکمه باز و بسته کردن سایدبار در دسکتاپ */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "باز کردن منو" : "جمع کردن منو"}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 rotate-180" />
            ) : (
              <PanelLeftClose className="h-4 w-4 rotate-180" />
            )}
          </button>
        </div>

        {/* منوهای اصلی پنل مدیریت */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                ماژول‌های مدیریتی
              </h3>
            )}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.title : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? "bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200/80 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              active
                                ? "bg-indigo-200 text-indigo-900"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* سوئیچ سریع بین پرتال‌ها */}
          <div className="pt-2 border-t border-slate-100">
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                دسترسی به سایر بخش‌ها
              </h3>
            )}
            <nav className="space-y-1">
              {quickLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.title : undefined}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <IconComponent className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* فوتر سایدبار با نشان وضعیت دسترسی مدیر ارشد و دکمه خروج */}
        <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-2">
          <div
            className={`flex items-center gap-3 rounded-xl bg-white p-2.5 border border-slate-200 shadow-xs ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
              <FileCheck2 className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-bold text-slate-900">
                    مدیریت مالی و اکران
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    فعال
                  </span>
                </div>
                <p className="truncate text-[10px] text-slate-500">
                  اتصال امن به سامانه بانکی
                </p>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-slate-200/80">
            <LogoutButton
              className={`w-full ${isCollapsed ? "justify-center px-0" : ""}`}
              showText={!isCollapsed}
              label="خروج از پنل مدیریت"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
