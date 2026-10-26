import { redirect } from "next/navigation";

interface DashboardBookingDetailPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function DashboardBookingDetailPage({
  params,
}: DashboardBookingDetailPageProps) {
  const { bookingId } = await params;
  redirect(`/client/bookings/${bookingId}`);
}
