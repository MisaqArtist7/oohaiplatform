import { http, QueryParams } from "@/shared/lib/http";
import { tomanToRial } from "@/shared/lib/money";
import {
  Page,
  fromPaginator,
  LaravelPaginatorResponse,
} from "@/shared/lib/pagination";
import {
  CreateProposalInput,
  Proposal,
  ProposalStatus,
  CreateProposalResponse,
  ProposalDetailResponse,
} from "../types";

/**
 * ثبت سناریوی کمپین برای دریافت پیشنهاد هوشمند (POST /api/v1/proposals)
 * بودجه ورودی به تومان است و در لایه آداپتر با tomanToRial به ریال تبدیل می‌شود.
 */
export async function createProposal(
  input: CreateProposalInput
): Promise<{ id: number; status: ProposalStatus }> {
  const rialBudget = tomanToRial(input.budgetToman);

  const response = await http.post<CreateProposalResponse>("/proposals", {
    budget: rialBudget,
    city_id: input.cityId,
    scenario: input.scenario,
  });

  return {
    id: response.proposal.id,
    status: response.proposal.status,
  };
}

/**
 * دریافت نتیجه پیشنهاد و سازه‌های پیشنهادی (GET /api/v1/proposals/{ref})
 * پاسخ سرور در ساختار { proposal: Proposal } است که در این لایه آن‌رپ می‌شود.
 */
export async function getProposal(ref: string | number): Promise<Proposal> {
  const response = await http.get<ProposalDetailResponse>(
    `/proposals/${encodeURIComponent(String(ref))}`
  );

  return response.proposal;
}

/**
 * دریافت تاریخچه پیشنهادات کاربر (GET /api/v1/proposals)
 * خروجی خام Paginator لاراول به ساختار استاندارد Page<Proposal> تبدیل می‌شود.
 */
export async function listProposals(params?: {
  page?: number;
  per_page?: number;
}): Promise<Page<Proposal>> {
  const query: QueryParams = {
    page: params?.page ?? 1,
    per_page: params?.per_page ?? 15,
  };

  const response = await http.get<LaravelPaginatorResponse<Proposal>>(
    "/proposals",
    { query }
  );

  return fromPaginator(response);
}
