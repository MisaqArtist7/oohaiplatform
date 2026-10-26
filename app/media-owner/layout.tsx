import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MediaOwnerLayoutWrapper } from "@/features/media-owner";
import { getServerSession } from "@/features/auth/lib/server-session";

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت سازه‌ها (مالکان رسانه) | بیلبورد مارکت",
    template: "%s | بیلبورد مارکت",
  },
  description:
    "مدیریت، ثبت و واگذاری بیلبوردها، عرشه پل و فضاهای تبلیغات محیطی در پلتفرم جامع OOHAI.",
};

export default async function MediaOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/media-owner/structures");
  }

  if (session.role !== "media_owner" && session.role !== "super_admin") {
    redirect("/403");
  }

  return <MediaOwnerLayoutWrapper>{children}</MediaOwnerLayoutWrapper>;
}
