"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Page } from "@/shared/lib/pagination";
import {
  Structure,
  StructureTypeItem,
  StructureCategoryItem,
  StructureQueryFilters,
} from "../types";
import {
  fetchStructures,
  fetchStructureById,
  fetchStructureTypes,
  fetchStructureCategories,
  fetchMyStructures,
  createStructureApi,
  updateStructureApi,
} from "../api/structures.api";

export const structureQueryKeys = {
  all: ["structures"] as const,
  list: (filters: StructureQueryFilters) => ["structures", "list", filters] as const,
  detail: (id: string | number) => ["structures", "detail", String(id)] as const,
  types: ["structures", "types"] as const,
  categories: ["structures", "categories"] as const,
  myStructures: (page?: number, perPage?: number) =>
    ["structures", "my-structures", page ?? 1, perPage ?? 15] as const,
};

/**
 * دریافت انواع سازه با queryKey ثابت ['structures', 'types']
 */
export function useStructureTypes() {
  return useQuery<StructureTypeItem[]>({
    queryKey: structureQueryKeys.types,
    queryFn: fetchStructureTypes,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * نام مستعار برای سازگاری کامل
 */
export const useStructureTypesQuery = useStructureTypes;

/**
 * دریافت دسته‌بندی‌های سازه با queryKey ثابت ['structures', 'categories']
 */
export function useStructureCategories() {
  return useQuery<StructureCategoryItem[]>({
    queryKey: structureQueryKeys.categories,
    queryFn: fetchStructureCategories,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * نام مستعار برای سازگاری کامل
 */
export const useStructureCategoriesQuery = useStructureCategories;

/**
 * دریافت لیست سازه‌ها با فیلترها و صفحه‌بندی با queryKey ثابت ['structures', 'list', filters]
 */
export function useStructures(filters: StructureQueryFilters = {}) {
  return useQuery<Page<Structure>>({
    queryKey: structureQueryKeys.list(filters),
    queryFn: () => fetchStructures(filters),
  });
}

/**
 * نام مستعار برای سازگاری کامل
 */
export const useStructuresQuery = useStructures;

/**
 * دریافت جزییات یک سازه با queryKey ثابت ['structures', 'detail', id]
 */
export function useStructure(id: string | number) {
  return useQuery<Structure | null>({
    queryKey: structureQueryKeys.detail(id),
    queryFn: () => fetchStructureById(id),
    enabled: Boolean(id),
  });
}

/**
 * نام مستعار برای سازگاری کامل
 */
export const useStructureDetailQuery = useStructure;

/**
 * دریافت سازه‌های مالک رسانه جاری با queryKey ثابت ['structures', 'my-structures', page, perPage]
 */
export function useMyStructures(page: number = 1, perPage: number = 15) {
  return useQuery<Page<Structure>>({
    queryKey: structureQueryKeys.myStructures(page, perPage),
    queryFn: () => fetchMyStructures({ page, per_page: perPage }),
  });
}

/**
 * هوک ثبت سازه جدید با FormData
 */
export function useCreateStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createStructureApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: structureQueryKeys.all });
    },
  });
}

/**
 * هوک ویرایش مشخصات سازه با JSON
 */
export function useUpdateStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Record<string, unknown>;
    }) => updateStructureApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: structureQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: structureQueryKeys.detail(variables.id) });
    },
  });
}
