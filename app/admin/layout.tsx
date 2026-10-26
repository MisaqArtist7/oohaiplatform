import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLayoutWrapper } from "@/features/admin";
import { getServerSession } from "@/features/auth/lib/server-session";

export const metadata: Metadata = {
  title: "میز کار مدیریت و مالی | پلتفرم OOHAI",
  description: "پنل پیشرفته مدیریت رزروها، پیش‌فاکتورها، احراز هویت مالکان رسانه و مدیریت نقش‌ها",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.role !== "super_admin") {
    redirect("/403");
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
