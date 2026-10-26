import React from "react";
import { ToastProvider } from "@/shared/components/Toast";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
