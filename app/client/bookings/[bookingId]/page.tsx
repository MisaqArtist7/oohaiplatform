import { Metadata } from "next";
import { BookingDetailView } from "@/features/bookings";
import { initialClientBookings } from "@/lib/client-dashboard-data";

interface BookingPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export function generateStaticParams() {
  return initialClientBookings.map((b) => ({
    bookingId: b.id,
  }));
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { bookingId } = await params;
  return {
    title: `جزئیات رزرو ${bookingId} | بیلبورد مارکت`,
    description: "گردش کار، وضعیت پیش‌فاکتور رسمی، اسناد اکران و ثبت فیش واریزی.",
  };
}

export default async function ClientBookingDetailPage({
  params,
}: BookingPageProps) {
  const { bookingId } = await params;
  return <BookingDetailView bookingId={bookingId} backUrl="/client/bookings" />;
}
