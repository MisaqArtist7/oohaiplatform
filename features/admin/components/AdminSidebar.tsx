"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Building2,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import { LogoutButton } from "@/shared/components";
import { useHasPermission } from "@/features/auth/hooks/use-session";

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
  const canManageUsers = useHasPermission("admin.manage-user-roles");

  const navItems = [
    {
      title: "رزروها",
      href: "/admin/bookings",
      icon: CalendarCheck,
      visible: true,
    },
    {
      title: "کاربران",
      href: "/admin/users",
      icon: Users,
      visible: canManageUsers,
    },
    {
      title: "درخواست‌های مالکان",
      href: "/admin/media-owner-requests",
      icon: Building2,
      visible: true,
    },
  ];

  const isActive = (itemHref: string) => {
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* بک‌دراپ موبایل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* ستون کناری اصلی سایدبار مدیریت */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-slate-200 bg-white transition-all duration-300 shadow-sm lg:static ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileOpen ? "translate-x-0 w-64" : "translate-x-full lg:translate-x-0"
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
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  پلتفرم <span className="text-indigo-400">OOHAI</span>
                </span>
                <span className="block text-[11px] text-slate-300 font-medium">
                  پنل مدیریت
                </span>
              </div>
            )}
          </Link>

          {/* دکمه جمع/باز کردن سایدبار */}
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

        {/* منوهای ناوبری */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <nav className="space-y-1.5">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
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
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* فوتر سایدبار با دکمه خروج */}
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <LogoutButton
            className={`w-full ${isCollapsed ? "justify-center px-0" : ""}`}
            showText={!isCollapsed}
            label="خروج از حساب"
          />
        </div>
      </aside>
    </>
  );
}
