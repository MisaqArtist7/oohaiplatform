import type { Metadata } from "next";
import ClientLayoutWrapper from "@/components/client/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "میز کار و داشبورد مشتریان | بیلبورد مارکت",
    template: "%s | بیلبورد مارکت",
  },
  description:
    "سامانه مدیریت آنلاین رزروهای بیلبورد، پیگیری پیش‌فاکتورها، بارگذاری فیش‌های واریزی و مشاور هوشمند کمپین.",
};

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
