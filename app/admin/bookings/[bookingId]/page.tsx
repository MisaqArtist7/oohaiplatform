import { Metadata } from "next";
import { AdminBookingActionCenterView } from "@/features/admin";
import { adminBookingsStore } from "@/lib/admin-dashboard-data";

export async function generateStaticParams() {
  return adminBookingsStore.map((b) => ({
    bookingId: b.id,
  }));
}

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookingId } = await params;
  return {
    title: `مرکز عملیات رزرو ${bookingId} | داشبورد مدیریت OOHAI`,
    description: `بررسی جامع اسناد، قفل ۴۸ ساعته، صدور پیش‌فاکتور و تایید نهایی پرداخت پرونده ${bookingId}`,
  };
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { bookingId } = await params;
  return <AdminBookingActionCenterView bookingId={bookingId} />;
}
