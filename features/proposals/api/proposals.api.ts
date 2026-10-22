import { ProposalItem } from "@/types/client-dashboard";
import { proposalsStore } from "@/lib/client-dashboard-data";
import { ProposalFormValues } from "../schemas/proposal.schema";

export async function fetchProposals(): Promise<ProposalItem[]> {
  try {
    const res = await fetch("/api/v1/proposals", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch proposals");
    const json = await res.json();
    return json.data || proposalsStore;
  } catch {
    return proposalsStore;
  }
}

export async function createProposalApi(
  data: ProposalFormValues
): Promise<{ success: boolean; data?: ProposalItem; message?: string }> {
  const res = await fetch("/api/v1/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
