import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/lib/server-session";
import { getHomePath } from "@/features/auth/lib/get-home-path";
import { ToastProvider } from "@/shared/components/Toast";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // اگر کاربر قبلاً لاگین کرده باشد، فوراً در سمت سرور به مقصد نقشش ریدایرکت می‌شود
  const session = await getServerSession();
  if (session) {
    redirect(getHomePath(session.role));
  }

  return <ToastProvider>{children}</ToastProvider>;
}
