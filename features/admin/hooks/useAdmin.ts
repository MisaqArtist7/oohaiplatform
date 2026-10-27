import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminBookings,
  getAdminBooking,
  getAdminBookingLogs,
  lockBooking,
  issueProforma,
  approvePayment,
  rejectBooking,
  completeBooking,
  listAdminUsers,
  getAdminUser,
  getUserRoles,
  assignRole,
  removeRole,
  getAdminMediaOwnerRequests,
  approveMediaOwnerRequest,
  rejectMediaOwnerRequest,
} from "../api/admin.api";
import type {
  AdminBookingFilters,
  AdminUserFilters,
  UserRoleValue,
} from "../types";

export const adminQueryKeys = {
  all: ["admin"] as const,
  bookingsList: (filters?: AdminBookingFilters) =>
    ["admin", "bookings", "list", filters] as const,
  bookingDetail: (id: number | string) =>
    ["admin", "bookings", "detail", String(id)] as const,
  bookingLogs: (id: number | string) =>
    ["admin", "bookings", "logs", String(id)] as const,
  usersList: (params?: AdminUserFilters) =>
    ["admin", "users", "list", params] as const,
  userDetail: (uuid: string) =>
    ["admin", "users", "detail", uuid] as const,
  userRoles: (uuid: string) =>
    ["admin", "users", "roles", uuid] as const,
  mediaOwnerRequests: ["admin", "media-owner-requests"] as const,
};

// ==========================================
// ۱. هوک‌های کوئری و موتیشن رزروها (Bookings)
// ==========================================

export function useAdminBookingsQuery(filters?: AdminBookingFilters) {
  return useQuery({
    queryKey: adminQueryKeys.bookingsList(filters),
    queryFn: () => listAdminBookings(filters),
  });
}

export function useAdminBookingDetailQuery(id: number | string) {
  return useQuery({
    queryKey: adminQueryKeys.bookingDetail(id),
    queryFn: () => getAdminBooking(id),
    enabled: !!id,
  });
}

export function useAdminBookingLogsQuery(id: number | string) {
  return useQuery({
    queryKey: adminQueryKeys.bookingLogs(id),
    queryFn: () => getAdminBookingLogs(id),
    enabled: !!id,
  });
}

/**
 * تابع کمکی برای اعمال قانون الزامی:
 * هر mutation رزرو هم پس از موفقیت و هم پس از خطا، جزئیات پرونده را مجدداً واکشی (refetch) می‌کند
 * تا allowed_actions و وضعیت پرونده بلادرنگ هماهنگ گردد، و لیست رزروها را اینولیدیت می‌نماید.
 */
function handleBookingMutationSettled(
  queryClient: ReturnType<typeof useQueryClient>,
  bookingId: number | string
) {
  // اینولیدیت کردن لیست کل
  queryClient.invalidateQueries({ queryKey: ["admin", "bookings", "list"] });
  // refetch فوری جزییات و لاگ‌های همان رزرو
  queryClient.refetchQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
  queryClient.refetchQueries({ queryKey: adminQueryKeys.bookingLogs(bookingId) });
}

export function useLockBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number | string; note?: string }) =>
      lockBooking(id, note),
    onSettled: (_, __, { id }) => {
      handleBookingMutationSettled(queryClient, id);
    },
  });
}

export function useIssueProformaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      file,
      note,
    }: {
      id: number | string;
      file: File;
      note?: string;
    }) => issueProforma(id, file, note),
    onSettled: (_, __, { id }) => {
      handleBookingMutationSettled(queryClient, id);
    },
  });
}

export function useApprovePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number | string; note?: string }) =>
      approvePayment(id, note),
    onSettled: (_, __, { id }) => {
      handleBookingMutationSettled(queryClient, id);
    },
  });
}

export function useRejectBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      rejectBooking(id, reason),
    onSettled: (_, __, { id }) => {
      handleBookingMutationSettled(queryClient, id);
    },
  });
}

export function useCompleteBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number | string; note?: string }) =>
      completeBooking(id, note),
    onSettled: (_, __, { id }) => {
      handleBookingMutationSettled(queryClient, id);
    },
  });
}

// ==========================================
// ۲. هوک‌های کوئری و موتیشن کاربران و نقش‌ها (Users & Roles)
// ==========================================

export function useAdminUsersQuery(params?: AdminUserFilters) {
  return useQuery({
    queryKey: adminQueryKeys.usersList(params),
    queryFn: () => listAdminUsers(params),
  });
}

export function useAdminUserDetailQuery(uuid: string) {
  return useQuery({
    queryKey: adminQueryKeys.userDetail(uuid),
    queryFn: () => getAdminUser(uuid),
    enabled: !!uuid,
  });
}

export function useUserRolesQuery(uuid: string) {
  return useQuery({
    queryKey: adminQueryKeys.userRoles(uuid),
    queryFn: () => getUserRoles(uuid),
    enabled: !!uuid,
  });
}

export function useAssignRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, role }: { uuid: string; role: UserRoleValue }) =>
      assignRole(uuid, role),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userDetail(uuid) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userRoles(uuid) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "list"] });
    },
  });
}

export function useRemoveRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, role }: { uuid: string; role: UserRoleValue }) =>
      removeRole(uuid, role),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userDetail(uuid) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userRoles(uuid) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "list"] });
    },
  });
}

// ==========================================
// ۳. هوک‌های درخواست‌های مالکان رسانه (مربوط به تسک ۱۰)
// ==========================================

export function useAdminMediaOwnerRequestsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.mediaOwnerRequests,
    queryFn: getAdminMediaOwnerRequests,
  });
}

export function useApproveMediaOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string | number) => approveMediaOwnerRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.mediaOwnerRequests });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRejectMediaOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string | number; reason: string }) =>
      rejectMediaOwnerRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.mediaOwnerRequests });
    },
  });
}
