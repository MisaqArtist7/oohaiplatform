import { Metadata } from "next";
import { AdminLayoutWrapper } from "@/features/admin";

export const metadata: Metadata = {
  title: "میز کار مدیریت و مالی | پلتفرم OOHAI",
  description: "پنل پیشرفته مدیریت رزروها، پیش‌فاکتورها، احراز هویت مالکان رسانه و مدیریت نقش‌ها",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
