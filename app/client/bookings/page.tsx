import { Metadata } from "next";
import { BookingsListView } from "@/features/bookings";

export const metadata: Metadata = {
  title: "رزروهای من | بیلبورد مارکت",
  description: "مدیریت قراردادها، بررسی وضعیت پیش‌فاکتورها و پیگیری رزروهای اکران بیلبورد.",
};

export default function ClientBookingsPage() {
  return <BookingsListView />;
}
