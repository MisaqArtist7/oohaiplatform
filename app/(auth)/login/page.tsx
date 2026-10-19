import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/AuthCard";

export const metadata: Metadata = {
  title: "ورود با شماره موبایل",
  description: "ورود سریع با شماره همراه و کد تأیید یکبار مصرف بدون نیاز به کلمه عبور",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AuthCard initialMode="login" />
    </Suspense>
  );
}
