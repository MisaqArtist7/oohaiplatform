"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Sparkles,
  Building2,
  MapPin,
  Home,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
} from "lucide-react";

export interface ClientSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function ClientSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: ClientSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "رزروهای من",
      href: "/client/bookings",
      icon: CalendarCheck,
      badge: "فعال",
      exact: false,
    },
    {
      title: "مشاوره و پیشنهاد کمپین (AI)",
      href: "/client/proposals",
      icon: Sparkles,
      badge: "هوشمند",
      exact: false,
    },
    {
      title: "پنل مالکان رسانه (سازه‌ها)",
      href: "/media-owner/structures",
      icon: Layers,
      badge: "مالک",
      exact: false,
    },
    {
      title: "ارتقا به مالک رسانه",
      href: "/client/media-owner-request",
      icon: Building2,
      exact: false,
    },
    {
      title: "کاوشگر سازه‌ها روی نقشه",
      href: "/structures",
      icon: MapPin,
      exact: true,
    },
    {
      title: "پنل مدیریت و مالی (Admin)",
      href: "/admin/bookings",
      icon: ShieldCheck,
      badge: "ادمین",
      exact: false,
    },
  ];

  const isActive = (itemHref: string) => {
    if (itemHref === "/structures") return pathname === "/structures";
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

      {/* ستون کناری اصلی سایدبار */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-border bg-white transition-all duration-300 lg:static ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileOpen ? "translate-x-0 w-72" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* هدر سایدبار و لوگو */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden"
            onClick={onCloseMobile}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <MapPin className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-base font-extrabold tracking-tight text-foreground">
                  بیلبورد<span className="text-primary">مارکت</span>
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  پنل اختصاصی مشتریان
                </span>
              </div>
            )}
          </Link>

          {/* دکمه باز و بسته کردن سایدبار در دسکتاپ */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* منوی ناوبری اصلی */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold text-muted-foreground">
              مدیریت و خدمات اکران
            </div>
          )}

          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.title : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {!isCollapsed && (
            <div className="pt-4 pb-2 px-3 text-[11px] font-bold text-muted-foreground">
              دسترسی سریع
            </div>
          )}

          <Link
            href="/"
            onClick={onCloseMobile}
            title={isCollapsed ? "بازگشت به صفحه اصلی" : undefined}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
            {!isCollapsed && <span>صفحه اصلی سایت</span>}
          </Link>
        </div>

        {/* بخش پایین سایدبار: وضعیت تایید هویت و راهنما */}
        <div className="p-3 border-t border-border">
          {!isCollapsed ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>حساب کاربری حقوقی معتبر</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                قراردادهای شما با تضمین سازمان زیباسازی و کانون‌های رسمی منعقد می‌شود.
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-2" title="حساب حقوقی تایید شده">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export { ClientSidebar };
