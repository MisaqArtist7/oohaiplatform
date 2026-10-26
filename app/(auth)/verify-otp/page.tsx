import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth";

export const metadata: Metadata = {
  title: "تأیید شماره و ورود به حساب",
  description: "تأیید کد یکبار مصرف پیامکی و ورود امن به پنل بیلبورد مارکت",
};

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AuthCard initialMode="verify" />
    </Suspense>
  );
}