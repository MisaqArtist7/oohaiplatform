import { Metadata } from "next";
import { AdminUsersManagementView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت کاربران و نقش‌ها | داشبورد مدیریت OOHAI",
  description: "مدیریت پرسنل، سطوح دسترسی مالی، عملیاتی، مالکان رسانه و اختیارات ادمین سامانه OOHAI",
};

export default function AdminUsersPage() {
  return <AdminUsersManagementView />;
}
