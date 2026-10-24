import {
  ClientBooking,
  ProposalItem,
  PaymentSubmissionInput,
} from "@/types/client-dashboard";
import {
  clientBookingsStore,
  proposalsStore,
} from "./client-dashboard-data";

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
  } catch (error) {
    console.warn("Fallback to local clientBookingsStore:", error);
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
    if (!res.ok) throw new Error("Failed to fetch booking");
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.warn("Fallback to local booking lookup:", error);
    const found = clientBookingsStore.find(
      (b) =>
        b.id.toLowerCase() === bookingId.toLowerCase() ||
        b.trackingCode.toLowerCase() === bookingId.toLowerCase()
    );
    return found || null;
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

export async function fetchProposals(): Promise<ProposalItem[]> {
  try {
    const res = await fetch("/api/v1/proposals", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch proposals");
    const json = await res.json();
    return json.data || proposalsStore;
  } catch (error) {
    console.warn("Fallback to local proposalsStore:", error);
    return proposalsStore;
  }
}

export async function fetchProposalById(
  id: string
): Promise<ProposalItem | null> {
  try {
    const res = await fetch(`/api/v1/proposals/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch proposal details");
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.warn("Fallback to local proposal by id:", error);
    return proposalsStore.find((p) => p.id === id || p.trackingNumber === id) || null;
  }
}

export async function submitNewProposal(input: {
  title?: string;
  budget: number;
  city_id: number;
  cityName: string;
  scenario: string;
}): Promise<ProposalItem> {
  const res = await fetch("/api/v1/proposals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "خطا در ثبت پیشنهاد هوشمند کمپین");
  }
  return json.data;
}

export async function submitMediaOwnerApplication(
  formData: FormData
): Promise<{ success: boolean; trackingCode: string; message: string }> {
  const res = await fetch("/api/v1/media-owner-requests", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "خطا در ثبت درخواست ارتقا به مالک رسانه");
  }
  return json;
}

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

