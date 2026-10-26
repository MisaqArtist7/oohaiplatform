import { ProposalItem } from "../types";
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
