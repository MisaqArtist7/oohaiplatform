import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBookings,
  getAdminBookingById,
  lockBookingSlot,
  issueProformaInvoice,
  approvePaymentAndBroadcast,
  rejectBookingRequest,
  transitionBookingState,
  getBookingAuditLogs,
  getAdminMediaOwnerRequests,
  approveMediaOwnerRequest,
  rejectMediaOwnerRequest,
  getAdminUsers,
  assignRoleToUserApi,
  removeRoleFromUserApi,
} from "../api/admin.api";
import { AdminBookingFilterParams } from "../types";

export const adminQueryKeys = {
  all: ["admin"] as const,
  bookings: (filters?: AdminBookingFilterParams) =>
    ["admin", "bookings", filters] as const,
  bookingDetail: (id: string) => ["admin", "bookings", "detail", id] as const,
  bookingLogs: (id: string) => ["admin", "bookings", "logs", id] as const,
  mediaOwnerRequests: ["admin", "media-owner-requests"] as const,
  users: (search?: string) => ["admin", "users", search] as const,
};

export function useAdminBookingsQuery(filters?: AdminBookingFilterParams) {
  return useQuery({
    queryKey: adminQueryKeys.bookings(filters),
    queryFn: () => getAdminBookings(filters),
  });
}

export function useAdminBookingDetailQuery(bookingId: string) {
  return useQuery({
    queryKey: adminQueryKeys.bookingDetail(bookingId),
    queryFn: () => getAdminBookingById(bookingId),
    enabled: !!bookingId,
  });
}

export function useAdminBookingLogsQuery(bookingId: string) {
  return useQuery({
    queryKey: adminQueryKeys.bookingLogs(bookingId),
    queryFn: () => getBookingAuditLogs(bookingId),
    enabled: !!bookingId,
  });
}

export function useLockBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => lockBookingSlot(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingLogs(bookingId) });
    },
  });
}

export function useIssueProformaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: { invoiceNumber: string; amount: number; fileUrl?: string };
    }) => issueProformaInvoice(bookingId, payload),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingLogs(bookingId) });
    },
  });
}

export function useApprovePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      approvalNote,
    }: {
      bookingId: string;
      approvalNote?: string;
    }) => approvePaymentAndBroadcast(bookingId, approvalNote),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingLogs(bookingId) });
    },
  });
}

export function useRejectBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      rejectBookingRequest(bookingId, reason),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingLogs(bookingId) });
    },
  });
}

export function useTransitionBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      status,
      statusLabel,
      note,
    }: {
      bookingId: string;
      status: string;
      statusLabel?: string;
      note?: string;
    }) => transitionBookingState(bookingId, status, statusLabel, note),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingLogs(bookingId) });
    },
  });
}

export function useAdminMediaOwnerRequestsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.mediaOwnerRequests,
    queryFn: getAdminMediaOwnerRequests,
  });
}

export function useApproveMediaOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => approveMediaOwnerRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.mediaOwnerRequests });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRejectMediaOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectMediaOwnerRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.mediaOwnerRequests });
    },
  });
}

export function useAdminUsersQuery(search?: string) {
  return useQuery({
    queryKey: adminQueryKeys.users(search),
    queryFn: () => getAdminUsers(search),
  });
}

export function useAssignRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleSlug }: { userId: string; roleSlug: string }) =>
      assignRoleToUserApi(userId, roleSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRemoveRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleSlug }: { userId: string; roleSlug: string }) =>
      removeRoleFromUserApi(userId, roleSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
