"use client";

import React, { useState } from "react";
import ClientSidebar from "./ClientSidebar";
import ClientHeader from "./ClientHeader";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-foreground font-sans">
      {/* سایدبار ناوبری */}
      <ClientSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* محتوای اصلی داشبورد */}
      <div className="flex-1 flex flex-col min-w-0">
        <ClientHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          title="میز کار و داشبورد مشتریان"
          subtitle="سامانه یکپارچه رزرواسیون، مدیریت پرداخت و پیشنهادات هوشمند کمپین"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
