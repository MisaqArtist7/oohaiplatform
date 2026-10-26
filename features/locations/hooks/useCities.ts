"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCities } from "../api/locations.api";
import { City } from "../types";

export const citiesQueryKey = ["cities"] as const;

export function useCities() {
  const query = useQuery<City[]>({
    queryKey: citiesQueryKey,
    queryFn: fetchCities,
    staleTime: 10 * 60 * 1000,
  });

  const rawCities = query.data ?? [];

  // استان‌ها: آیتم‌هایی که parent_id ندارند
  const provinces = rawCities.filter((c) => !c.parent_id);

  // تابع هلپر برای استخراج شهرهای زیرمجموعه یک استان بر اساس ID یا نام استان
  const getCitiesForProvince = (provinceIdOrName?: number | string | null): City[] => {
    if (!provinceIdOrName) return [];

    let targetProvince: City | undefined;
    if (typeof provinceIdOrName === "number") {
      targetProvince = provinces.find((p) => p.id === provinceIdOrName);
    } else {
      const num = Number(provinceIdOrName);
      if (!Number.isNaN(num) && num > 0) {
        targetProvince = provinces.find((p) => p.id === num);
      } else {
        targetProvince = provinces.find(
          (p) => p.name.trim() === String(provinceIdOrName).trim()
        );
      }
    }

    if (!targetProvince) return [];
    if (Array.isArray(targetProvince.children) && targetProvince.children.length > 0) {
      return targetProvince.children;
    }
    // اگر استان خود فاقد children صریح باشد، خودش را به عنوان تنها شهر بازمی‌گردانیم
    return [targetProvince];
  };

  // تمام شهرها به صورت فلت برای جستجو و یافتن سریع
  const allLeafCities: City[] = [];
  provinces.forEach((prov) => {
    if (Array.isArray(prov.children) && prov.children.length > 0) {
      prov.children.forEach((child) => allLeafCities.push(child));
    } else {
      allLeafCities.push(prov);
    }
  });

  return {
    ...query,
    cities: rawCities,
    provinces,
    allLeafCities,
    getCitiesForProvince,
  };
}
