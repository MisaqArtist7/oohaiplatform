import {
  Structure,
  StructureCategory,
  StructureType,
  StructureFilters,
  BookingRequestInput,
  BookingResponse,
} from "@/types/structure";
import {
  mockStructures,
  mockStructureTypes,
  mockStructureCategories,
} from "./mock-data";

export async function fetchStructureTypes(): Promise<StructureType[]> {
  try {
    const res = await fetch("/api/v1/structures/types", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch types");
    const json = await res.json();
    return json.data || mockStructureTypes;
  } catch (error) {
    console.warn("Using fallback mock data for structure types:", error);
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
  } catch (error) {
    console.warn("Using fallback mock data for categories:", error);
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
  } catch (error) {
    console.warn("Using fallback mock data for structures:", error);
    // انجام فیلتر کلاینتی روی mock data
    let items = [...mockStructures];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.location.address.toLowerCase().includes(q)
      );
    }
    if (filters.typeId && filters.typeId !== "all") {
      items = items.filter((i) => i.type.id === filters.typeId || i.type.slug === filters.typeId);
    }
    if (filters.categoryId && filters.categoryId !== "all") {
      items = items.filter(
        (i) => i.category.id === filters.categoryId || i.category.slug === filters.categoryId
      );
    }
    if (filters.status && filters.status !== "all") {
      items = items.filter((i) => i.status === filters.status);
    }
    return { structures: items, total: items.length };
  }
}

export async function fetchStructureById(
  structureId: string
): Promise<{ structure: Structure | null; similar: Structure[] }> {
  try {
    const res = await fetch(`/api/v1/structures/${structureId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch structure detail");
    const json = await res.json();
    return {
      structure: json.data || null,
      similar: json.similar || [],
    };
  } catch (error) {
    console.warn("Using fallback mock data for single structure:", error);
    const found = mockStructures.find(
      (item) =>
        item.id.toLowerCase() === structureId.toLowerCase() ||
        item.code.toLowerCase() === structureId.toLowerCase() ||
        item.slug.toLowerCase() === structureId.toLowerCase()
    );
    const similar = mockStructures.filter((item) => item.id !== found?.id).slice(0, 3);
    return {
      structure: found || null,
      similar,
    };
  }
}

export async function submitBookingRequest(
  bookingInput: BookingRequestInput
): Promise<BookingResponse> {
  const res = await fetch("/api/v1/client/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingInput),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "خطا در ثبت رزرو");
  }
  return json;
}
