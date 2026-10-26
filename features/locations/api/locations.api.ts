import { http } from "@/shared/lib/http";
import { City } from "../types";

export interface CitiesResponse {
  data?: City[];
}

/**
 * دریافت لیست استان‌ها و شهرهای کشور از بک‌اند واقعی (GET /api/v1/cities)
 * به صورت سلسله‌مراتبی و درختی (شامل parent_id و children[])
 */
export async function fetchCities(): Promise<City[]> {
  const res = await http<CitiesResponse | City[]>("/cities");
  if (Array.isArray(res)) {
    return res;
  }
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}
