"use client";

import React, { useState } from "react";
import MediaOwnerSidebar from "./MediaOwnerSidebar";
import MediaOwnerHeader from "./MediaOwnerHeader";

interface MediaOwnerLayoutWrapperProps {
  children: React.ReactNode;
}

export default function MediaOwnerLayoutWrapper({
  children,
}: MediaOwnerLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-foreground" dir="rtl">
      {/* سایدبار ناوبری */}
      <React.Suspense fallback={<div className="w-68 bg-slate-900 min-h-screen hidden lg:block" />}>
        <MediaOwnerSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </React.Suspense>

      {/* ناحیه محتوای اصلی */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:mr-20" : "lg:mr-68"
        }`}
      >
        <MediaOwnerHeader
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          title="پنل مدیریت سازه‌های تبلیغاتی (Media Owner)"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
