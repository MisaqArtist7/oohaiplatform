"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({
  children,
}: AdminLayoutWrapperProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50/80 font-sans text-slate-800 antialiased flex"
    >
      {/* سایدبار مدیریت */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* ستون اصلی محتوا */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          title="سامانه مدیریت و مالی OOHAI"
          subtitle="پایش برخط رزروها، پیش‌فاکتورها، احراز هویت شرکت‌ها و کاربران"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
