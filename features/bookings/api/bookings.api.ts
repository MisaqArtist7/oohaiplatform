import {
  ClientBooking,
  PaymentSubmissionInput,
} from "../types";
import { clientBookingsStore } from "@/lib/client-dashboard-data";
import { BookingRequestInput, BookingResponse } from "@/features/structures/types";

export interface LocationCity {
  id: number;
  name: string;
  province?: string;
  slug?: string;
}

export async function fetchLocations(): Promise<LocationCity[]> {
  try {
    const res = await fetch("/api/v1/locations", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch locations");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn("Failed to fetch locations:", error);
    return [];
  }
}

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
    return (
      clientBookingsStore.find(
        (b) =>
          b.id.toLowerCase() === bookingId.toLowerCase() ||
          b.trackingCode.toLowerCase() === bookingId.toLowerCase()
      ) || null
    );
  }
}

export async function fetchProformaDownloadToken(
  documentId: string
): Promise<{
  success: boolean;
  downloadUrl: string;
  secureToken: string;
  expiresAt: string;
  expiresInSeconds: number;
}> {
  try {
    const res = await fetch(`/api/v1/client/bookings/documents/${documentId}/download`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to generate download link");
    return await res.json();
  } catch (error) {
    console.warn("Fallback to simulated download token:", error);
    const token = `sec_tok_${Math.random().toString(36).substring(2, 10)}`;
    return {
      success: true,
      downloadUrl: `/api/v1/client/bookings/documents/${documentId}/download?format=file&token=${token}`,
      secureToken: token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      expiresInSeconds: 900,
    };
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

export async function submitBookingPayment(
  paymentData: PaymentSubmissionInput
): Promise<{ success: boolean; message: string; data?: ClientBooking }> {
  const res = await fetch(`/api/v1/client/bookings/${paymentData.bookingId}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "خطا در ثبت پرداخت");
  }
  return json;
}
