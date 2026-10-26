import { Metadata } from "next";
import { AdminBookingsListView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت کل رزروها | داشبورد مدیریت OOHAI",
  description: "لیست جامع رزرواسیون سازه‌های تبلیغاتی، فیلترهای پیشرفته و دسترسی به مرکز عملیات رزرو",
};

export default function AdminBookingsPage() {
  return <AdminBookingsListView />;
}
