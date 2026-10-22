import { Structure } from "@/types/structure";
import { getMyStructuresList, structuresStore } from "@/lib/mock-data";

export async function fetchMyStructures(): Promise<Structure[]> {
  try {
    const res = await fetch("/api/v1/my-structures", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch my structures");
    const json = await res.json();
    return json.data || getMyStructuresList();
  } catch (error) {
    console.warn("Fallback to local getMyStructuresList:", error);
    return getMyStructuresList();
  }
}

export async function fetchStructureForEdit(
  id: string
): Promise<Structure | null> {
  try {
    const res = await fetch(`/api/v1/structures/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch structure details");
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.warn("Fallback to local structure by id:", error);
    return (
      structuresStore.find(
        (s) => s.id === id || s.code === id || s.slug === id
      ) || null
    );
  }
}

export async function submitCreateStructure(
  payload: Record<string, unknown> | FormData
): Promise<{ success: boolean; data: Structure; message: string }> {
  let options: RequestInit;

  if (payload instanceof FormData) {
    options = {
      method: "POST",
      body: payload,
    };
  } else {
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
  }

  const res = await fetch("/api/v1/structures", options);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "خطا در ثبت سازه تبلیغاتی");
  }

  return json;
}

export async function submitUpdateStructure(
  structureId: string,
  payload: Record<string, unknown> | FormData
): Promise<{ success: boolean; data: Structure; message: string }> {
  let options: RequestInit;

  if (payload instanceof FormData) {
    options = {
      method: "PUT",
      body: payload,
    };
  } else {
    options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
  }

  const res = await fetch(`/api/v1/structures/${structureId}`, options);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "خطا در ویرایش سازه تبلیغاتی");
  }

  return json;
}
