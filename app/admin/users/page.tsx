import { Suspense } from "react";
import { Metadata } from "next";
import { AdminUsersManagementView } from "@/features/admin";


export const metadata: Metadata = {
  title: "مدیریت کاربران و نقش‌ها | داشبورد مدیریت OOHAI",
  description: "مدیریت پرسنل و اختیارات ادمین سامانه OOHAI",
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">در حال بارگذاری...</div>}>
      <AdminUsersManagementView />
    </Suspense>
  );
}
