import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientLayoutWrapper } from "@/shared/components/layout";
import { getServerSession } from "@/features/auth/lib/server-session";

export const metadata: Metadata = {
  title: {
    default: "میز کار و داشبورد مشتریان | بیلبورد مارکت",
    template: "%s | بیلبورد مارکت",
  },
  description:
    "سامانه مدیریت آنلاین رزروهای بیلبورد، پیگیری پیش‌فاکتورها، بارگذاری فیش‌های واریزی و مشاور هوشمند کمپین.",
};

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/client");
  }

  // تمامی نقش‌های احراز هویت شده (client, media_owner, super_admin) مجاز هستند
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
