import {
  ClientBooking,
  PaymentSubmissionInput,
} from "@/types/client-dashboard";
import { clientBookingsStore } from "@/lib/client-dashboard-data";
import { BookingRequestInput, BookingResponse } from "@/types/structure";

export async function fetchClientBookings(
  status: string = "all",
  search: string = ""
): Promise<{ bookings: ClientBooking[]; counts: Record<string, number> }> {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);

    const res = await fetch(`/api/v1/client/bookings?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch client bookings");
    const json = await res.json();
    return {
      bookings: json.data || clientBookingsStore,
      counts: json.counts || {},
    };
  } catch {
    let items = [...clientBookingsStore];
    if (status && status !== "all") {
      items = items.filter((b) => b.status.value === status);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (b) =>
          b.trackingCode.toLowerCase().includes(q) ||
          b.structure.title.toLowerCase().includes(q) ||
          b.structure.code.toLowerCase().includes(q)
      );
    }
    return {
      bookings: items,
      counts: {
        all: clientBookingsStore.length,
        pending_review: clientBookingsStore.filter((b) => b.status.value === "pending_review").length,
        awaiting_payment: clientBookingsStore.filter((b) => b.status.value === "awaiting_payment").length,
        active: clientBookingsStore.filter((b) => b.status.value === "active").length,
        cancelled: clientBookingsStore.filter((b) => b.status.value === "cancelled").length,
        completed: clientBookingsStore.filter((b) => b.status.value === "completed").length,
      },
    };
  }
}

export async function fetchClientBookingById(
  bookingId: string
): Promise<ClientBooking | null> {
  try {
    const res = await fetch(`/api/v1/client/bookings/${bookingId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch booking details");
    const json = await res.json();
    return json.data;
  } catch {
    return clientBookingsStore.find((b) => b.id === bookingId) || null;
  }
}

export async function createBookingRequestApi(
  data: BookingRequestInput
): Promise<BookingResponse> {
  const res = await fetch("/api/v1/client/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function submitBookingPaymentApi(
  data: PaymentSubmissionInput
): Promise<{ success: boolean; data?: ClientBooking; message?: string }> {
  const res = await fetch(`/api/v1/client/bookings/${data.bookingId}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
