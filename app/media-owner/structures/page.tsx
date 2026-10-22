import { Metadata } from "next";
import MyStructuresListView from "@/components/media-owner/structures/MyStructuresListView";

export const metadata: Metadata = {
  title: "سازه‌های من | پنل مالکان رسانه بیلبورد مارکت",
  description: "مدیریت سازه‌های تبلیغاتی، بررسی وضعیت اکران، رزروها و تنظیم قیمت‌های پایه.",
};

export default function MyStructuresPage() {
  return <MyStructuresListView />;
}
