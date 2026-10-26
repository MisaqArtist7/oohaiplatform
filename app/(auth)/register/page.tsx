import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth";

export const metadata: Metadata = {
  title: "ثبت‌نام در پلتفرم بیلبورد مارکت",
  description: "عضویت سریع و رزرو آنلاین سازه‌های تبلیغاتی سراسر کشور با مشاوره هوش مصنوعی",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AuthCard initialMode="register" />
    </Suspense>
  );
}