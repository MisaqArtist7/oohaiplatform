import { Structure } from "@/features/structures/types";
import {
  fetchMyStructures as apiFetchMyStructures,
  fetchStructureById,
  createStructureApi,
  updateStructureApi,
} from "@/features/structures/api/structures.api";
import { MediaOwnerRequestFormValues } from "../schemas/media-owner.schema";

/**
 * دریافت سازه‌های مالک رسانه از API واقعی
 */
export async function fetchMyStructures(): Promise<Structure[]> {
  const page = await apiFetchMyStructures({ page: 1, per_page: 50 });
  return page.items;
}

/**
 * دریافت جزئیات سازه برای ویرایش از API واقعی
 */
export async function fetchStructureForEdit(id: string): Promise<Structure | null> {
  return fetchStructureById(id);
}

/**
 * ثبت سازه جدید با FormData
 */
export async function submitCreateStructure(
  payload: FormData
): Promise<{ message?: string; data?: unknown }> {
  return createStructureApi(payload);
}

/**
 * ویرایش سازه با JSON
 */
export async function submitUpdateStructure(
  structureId: string | number,
  payload: Record<string, unknown>
): Promise<{ message?: string; data?: unknown }> {
  return updateStructureApi(structureId, payload);
}

/**
 * ثبت درخواست مالک رسانه
 */
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

export async function submitMediaOwnerApplication(
  formData: FormData
): Promise<{ success: boolean; trackingCode: string; message: string }> {
  const res = await fetch("/api/v1/media-owner-requests", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "خطا در ثبت درخواست ارتقا به مالک رسانه");
  }
  return json;
}
