import type { Metadata } from "next";
import MediaOwnerLayoutWrapper from "@/components/media-owner/MediaOwnerLayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت سازه‌ها (مالکان رسانه) | بیلبورد مارکت",
    template: "%s | بیلبورد مارکت",
  },
  description:
    "مدیریت، ثبت و واگذاری بیلبوردها، عرشه پل و فضاهای تبلیغات محیطی در پلتفرم جامع OOHAI.",
};

export default function MediaOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MediaOwnerLayoutWrapper>{children}</MediaOwnerLayoutWrapper>;
}
