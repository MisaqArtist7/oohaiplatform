import { Suspense } from "react";
import { Metadata } from "next";
import { AdminBookingsListView } from "@/features/admin";


export const metadata: Metadata = {
  title: "مدیریت کل رزروها | داشبورد مدیریت OOHAI",
  description: "لیست جامع رزرواسیون سازه‌های تبلیغاتی، فیلترهای استاندارد و دسترسی به مرکز عملیات رزرو",
};

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">در حال بارگذاری...</div>}>
      <AdminBookingsListView />
    </Suspense>
  );
}
