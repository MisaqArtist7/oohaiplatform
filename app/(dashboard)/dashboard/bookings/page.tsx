import { redirect } from "next/navigation";

export default function LegacyDashboardBookingsPage() {
  redirect("/client/bookings");
}
