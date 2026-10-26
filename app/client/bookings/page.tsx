import { Metadata } from "next";
import { Suspense } from "react";
import { BookingsListView } from "@/features/bookings";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "رزروهای من | بیلبورد مارکت",
  description: "مدیریت قراردادها، بررسی وضعیت پیش‌فاکتورها و پیگیری رزروهای اکران بیلبورد.",
};

function BookingsListFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>در حال بارگذاری رزروها...</span>
      </div>
    </div>
  );
}

export default function ClientBookingsPage() {
  return (
    <Suspense fallback={<BookingsListFallback />}>
      <BookingsListView />
    </Suspense>
  );
}
