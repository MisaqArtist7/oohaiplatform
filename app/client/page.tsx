import { redirect } from "next/navigation";

export default function ClientRootPage() {
  redirect("/client/bookings");
}
