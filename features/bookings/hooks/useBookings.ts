import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientBookings,
  fetchClientBookingById,
  createBookingRequestApi,
  submitBookingPaymentApi,
} from "../api/bookings.api";
import { BookingRequestInput } from "@/types/structure";
import { PaymentSubmissionInput } from "@/types/client-dashboard";

export const bookingQueryKeys = {
  all: ["client-bookings"] as const,
  list: (status: string, search: string) =>
    ["client-bookings", "list", { status, search }] as const,
  detail: (id: string) => ["client-bookings", "detail", id] as const,
};

export function useClientBookingsQuery(status: string = "all", search: string = "") {
  return useQuery({
    queryKey: bookingQueryKeys.list(status, search),
    queryFn: () => fetchClientBookings(status, search),
  });
}

export function useClientBookingDetailQuery(id: string) {
  return useQuery({
    queryKey: bookingQueryKeys.detail(id),
    queryFn: () => fetchClientBookingById(id),
    enabled: !!id,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingRequestInput) => createBookingRequestApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}

export function useSubmitPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentSubmissionInput) => submitBookingPaymentApi(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.detail(variables.bookingId),
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}
