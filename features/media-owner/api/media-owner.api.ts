import { Structure } from "@/types/structure";
import { getMyStructuresList } from "@/lib/mock-data";
import { MediaOwnerRequestFormValues } from "../schemas/media-owner.schema";

export async function fetchMyStructures(): Promise<Structure[]> {
  try {
    const res = await fetch("/api/v1/my-structures", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch media owner structures");
    const json = await res.json();
    return json.data || getMyStructuresList();
  } catch {
    return getMyStructuresList();
  }
}

export async function submitMediaOwnerRequestApi(
  data: MediaOwnerRequestFormValues
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  const res = await fetch("/api/v1/media-owner-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
