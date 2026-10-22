import {
  Structure,
  StructureCategory,
  StructureType,
  StructureFilters,
} from "@/types/structure";
import {
  mockStructures,
  mockStructureTypes,
  mockStructureCategories,
} from "@/lib/mock-data";
import { StructureFormValues } from "../schemas/structure.schema";

export async function fetchStructureTypes(): Promise<StructureType[]> {
  try {
    const res = await fetch("/api/v1/structures/types", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch types");
    const json = await res.json();
    return json.data || mockStructureTypes;
  } catch {
    return mockStructureTypes;
  }
}

export async function fetchStructureCategories(): Promise<StructureCategory[]> {
  try {
    const res = await fetch("/api/v1/structures/categories", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    return json.data || mockStructureCategories;
  } catch {
    return mockStructureCategories;
  }
}

export async function fetchStructures(
  filters: StructureFilters = {}
): Promise<{ structures: Structure[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.typeId) params.append("type", filters.typeId);
    if (filters.categoryId) params.append("category", filters.categoryId);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/v1/structures${queryStr}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch structures");
    const json = await res.json();
    return {
      structures: json.data || mockStructures,
      total: json.total || mockStructures.length,
    };
  } catch {
    return { structures: mockStructures, total: mockStructures.length };
  }
}

export async function fetchStructureById(id: string): Promise<Structure | null> {
  try {
    const res = await fetch(`/api/v1/structures/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch structure details");
    const json = await res.json();
    return json.data;
  } catch {
    return mockStructures.find((s) => s.id === id || s.code === id) || null;
  }
}

export async function createStructureApi(data: StructureFormValues): Promise<{ success: boolean; data?: Structure; message?: string }> {
  const res = await fetch("/api/v1/structures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateStructureApi(
  id: string,
  data: Partial<StructureFormValues>
): Promise<{ success: boolean; data?: Structure; message?: string }> {
  const res = await fetch(`/api/v1/structures/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
