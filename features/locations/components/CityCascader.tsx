"use client";

import React, { useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useCities } from "../hooks/useCities";
import { City } from "../types";

export interface CityCascaderProps {
  selectedCityId?: number | null;
  onCitySelect: (city: City | null, province: City | null) => void;
  provinceLabel?: string;
  cityLabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function CityCascader({
  selectedCityId,
  onCitySelect,
  provinceLabel = "استان",
  cityLabel = "شهر",
  className = "",
  disabled = false,
}: CityCascaderProps) {
  const { provinces, getCitiesForProvince, isLoading, isError, allLeafCities } = useCities();

  // استان متناظر با selectedCityId در صورتی که کاربر دستی استان دیگری انتخاب نکرده باشد
  const initialProvinceId = useMemo(() => {
    if (!selectedCityId || provinces.length === 0) return null;

    for (const prov of provinces) {
      if (prov.id === selectedCityId) return prov.id;
      if (prov.children && prov.children.some((c) => c.id === selectedCityId)) {
        return prov.id;
      }
    }
    return null;
  }, [selectedCityId, provinces]);

  const [userProvinceId, setUserProvinceId] = useState<number | null>(null);

  // در صورتی که کاربر استانی دستی انتخاب کرده باشد از آن استفاده می‌کنیم، در غیر این صورت از استان محاسبه‌شده
  const activeProvinceId = userProvinceId ?? initialProvinceId;

  const availableCities = useMemo(() => {
    if (!activeProvinceId) return [];
    return getCitiesForProvince(activeProvinceId);
  }, [activeProvinceId, getCitiesForProvince]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value ? Number(e.target.value) : null;
    setUserProvinceId(pId);

    if (!pId) {
      onCitySelect(null, null);
      return;
    }

    const prov = provinces.find((p) => p.id === pId) || null;
    const cities = getCitiesForProvince(pId);

    if (cities.length === 1) {
      onCitySelect(cities[0], prov);
    } else {
      onCitySelect(null, prov);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value ? Number(e.target.value) : null;
    const prov = provinces.find((p) => p.id === activeProvinceId) || null;

    if (!cId) {
      onCitySelect(null, prov);
      return;
    }

    const city =
      availableCities.find((c) => c.id === cId) ||
      allLeafCities.find((c) => c.id === cId) ||
      null;

    onCitySelect(city, prov);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {/* انتخاب استان */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          {provinceLabel}
        </label>
        <div className="relative">
          <select
            value={activeProvinceId ?? ""}
            onChange={handleProvinceChange}
            disabled={disabled || isLoading}
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-slate-50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="">
              {isLoading ? "در حال دریافت استان‌ها..." : "انتخاب استان..."}
            </option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
          {isLoading && (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* انتخاب شهر */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          {cityLabel}
        </label>
        <div className="relative">
          <select
            value={selectedCityId ?? ""}
            onChange={handleCityChange}
            disabled={disabled || isLoading || !activeProvinceId}
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-slate-50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="">
              {!activeProvinceId
                ? "ابتدا استان را انتخاب کنید"
                : availableCities.length === 0
                ? "شهری یافت نشد"
                : "انتخاب شهر..."}
            </option>
            {availableCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      {isError && (
        <p className="col-span-full text-[11px] text-rose-500">
          خطا در دریافت لیست شهرها از سرور.
        </p>
      )}
    </div>
  );
}

export { CityCascader };
