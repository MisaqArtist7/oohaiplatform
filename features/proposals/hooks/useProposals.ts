"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import {
  createProposal,
  getProposal,
  listProposals,
} from "../api/proposals.api";
import {
  CreateProposalInput,
  Proposal,
  ProposalResult,
} from "../types";
import { Page } from "@/shared/lib/pagination";
import { ApiError } from "@/shared/lib/errors";
import {
  structureQueryKeys,
  fetchStructureById,
  Structure,
} from "@/features/structures";

export const proposalQueryKeys = {
  all: ["proposals"] as const,
  lists: () => [...proposalQueryKeys.all, "list"] as const,
  list: (page: number) => [...proposalQueryKeys.all, "list", page] as const,
  details: () => [...proposalQueryKeys.all, "detail"] as const,
  detail: (ref: string | number) =>
    [...proposalQueryKeys.all, "detail", String(ref)] as const,
};

/**
 * هوک ثبت سناریوی جدید، اینولیدیت کردن لیست، و هدایت به صفحه نتیجه با id
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateProposalInput) => createProposal(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: proposalQueryKeys.lists() });
      if (data?.id) {
        router.push(`/client/proposals/${data.id}`);
      }
    },
  });
}

/**
 * ۱۰ دقیقه به میلی‌ثانیه برای سقف مجاز پولینگ
 */
const MAX_POLLING_DURATION_MS = 10 * 60 * 1000;

/**
 * هوک دریافت نتیجه یک پیشنهاد با مکانیسم هوشمند پولینگ
 * - تا زمان pending بودن، هر ۵ ثانیه درخواست می‌دهد (توقف در تب غیرفعال).
 * - در صورت رسیدن به completed یا هر وضعیت دیگر، پولینگ متوقف می‌شود.
 * - در صورت گذشت ۱۰ دقیقه از زمان ایجاد، پولینگ متوقف می‌گردد.
 * - برای خطاهای ۴۰۴ یا ۴۰۳ تلاش مجدد خودکار ندارد.
 */
export function useProposal(ref: string | number) {
  return useQuery<Proposal>({
    queryKey: proposalQueryKeys.detail(ref),
    queryFn: () => getProposal(ref),
    enabled: Boolean(ref),
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      const proposal = query.state.data;
      if (!proposal) return 5000;

      // توقف در صورت هر وضعیتی غیر از pending
      if (proposal.status !== "pending") {
        return false;
      }

      // توقف پس از گذشت سقف ۱۰ دقیقه از تاریخ ایجاد
      const createdAtMs = new Date(proposal.created_at).getTime();
      if (Number.isFinite(createdAtMs)) {
        const elapsed = Date.now() - createdAtMs;
        if (elapsed > MAX_POLLING_DURATION_MS) {
          return false;
        }
      }

      return 5000;
    },
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 403)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * هوک دریافت تاریخچه پیشنهادات کاربر با صفحه‌بندی (۱۵ آیتم در هر صفحه)
 */
export function useProposals(page = 1) {
  return useQuery<Page<Proposal>>({
    queryKey: proposalQueryKeys.list(page),
    queryFn: () => listProposals({ page, per_page: 15 }),
  });
}

export interface ProposalStructureEntry {
  structure?: Structure | null;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
}

/**
 * هوک دریافت موازی اطلاعات سازه‌های پیشنهادی با useQueries از public API ماژول structures
 * نتیجه به صورت مپ از structure_id به داده‌های سازه و وضعیت بازگردانده می‌شود.
 */
export function useProposalStructures(results?: ProposalResult[]) {
  const uniqueStructureIds = useMemo(() => {
    return Array.from(
      new Set((results || []).map((r) => r.structure_id).filter(Boolean))
    );
  }, [results]);

  const queries = useQueries({
    queries: uniqueStructureIds.map((id) => ({
      queryKey: structureQueryKeys.detail(id),
      queryFn: () => fetchStructureById(id),
      staleTime: 5 * 60 * 1000,
      retry: (failureCount: number, error: unknown) => {
        if (
          error instanceof ApiError &&
          (error.status === 404 || error.status === 403)
        ) {
          return false;
        }
        return failureCount < 2;
      },
    })),
  });

  const structuresMap = useMemo(() => {
    const map = new Map<number, ProposalStructureEntry>();

    uniqueStructureIds.forEach((id, index) => {
      const q = queries[index];
      map.set(id, {
        structure: q?.data,
        isLoading: q?.isLoading ?? false,
        isError: q?.isError ?? false,
        error: q?.error,
      });
    });

    return map;
  }, [uniqueStructureIds, queries]);

  return structuresMap;
}
