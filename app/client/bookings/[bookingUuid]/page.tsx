import { Metadata } from "next";
import { BookingDetailView } from "@/features/bookings";

interface BookingPageProps {
  params: Promise<{
    bookingUuid: string;
  }>;
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { bookingUuid } = await params;
  return {
    title: `جزئیات پرونده رزرو | بیلبورد مارکت`,
    description: `مشاهده مشخصات پرونده رزرو ${bookingUuid}، بررسی وضعیت پیش‌فاکتور رسمی و پیگیری مراحل قرارداد.`,
  };
}

export default async function ClientBookingDetailPage({
  params,
}: BookingPageProps) {
  const { bookingUuid } = await params;
  return (
    <BookingDetailView
      bookingUuid={bookingUuid}
      backUrl="/client/bookings"
    />
  );
}
