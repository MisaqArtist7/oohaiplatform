import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StructureFilters } from "@/types/structure";
import {
  fetchStructures,
  fetchStructureById,
  fetchStructureTypes,
  fetchStructureCategories,
  createStructureApi,
  updateStructureApi,
} from "../api/structures.api";
import { StructureFormValues } from "../schemas/structure.schema";

export const structureQueryKeys = {
  all: ["structures"] as const,
  list: (filters: StructureFilters) => ["structures", "list", filters] as const,
  detail: (id: string) => ["structures", "detail", id] as const,
  types: ["structures", "types"] as const,
  categories: ["structures", "categories"] as const,
};

export function useStructuresQuery(filters: StructureFilters = {}) {
  return useQuery({
    queryKey: structureQueryKeys.list(filters),
    queryFn: () => fetchStructures(filters),
  });
}

export function useStructureDetailQuery(id: string) {
  return useQuery({
    queryKey: structureQueryKeys.detail(id),
    queryFn: () => fetchStructureById(id),
    enabled: !!id,
  });
}

export function useStructureTypesQuery() {
  return useQuery({
    queryKey: structureQueryKeys.types,
    queryFn: fetchStructureTypes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStructureCategoriesQuery() {
  return useQuery({
    queryKey: structureQueryKeys.categories,
    queryFn: fetchStructureCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StructureFormValues) => createStructureApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: structureQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["my-structures"] });
    },
  });
}

export function useUpdateStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StructureFormValues> }) =>
      updateStructureApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: structureQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: structureQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["my-structures"] });
    },
  });
}
