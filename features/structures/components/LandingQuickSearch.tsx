"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Layers } from "lucide-react";
import { useCities } from "@/features/locations/hooks/useCities";
import { useStructureTypes } from "@/features/structures/hooks/useStructures";

export default function LandingQuickSearch() {
  const router = useRouter();
  const { provinces, getCitiesForProvince, isLoading: isCitiesLoading } = useCities();
  const { data: types = [], isLoading: isTypesLoading } = useStructureTypes();

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const availableCities = selectedProvinceId ? getCitiesForProvince(selectedProvinceId) : [];

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setSelectedProvinceId(val);
    setSelectedCityId(null);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setSelectedCityId(val);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setSelectedTypeId(val);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedTypeId) {
      params.set("type", String(selectedTypeId));
    }
    // city_id is not yet supported by /structures backend endpoint, documented in BACKEND_GAPS.md
    const queryString = params.toString();
    router.push(queryString ? `/structures?${queryString}` : "/structures");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-background p-3 shadow-lg"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {/* انتخاب استان */}
        <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
          <select
            value={selectedProvinceId ?? ""}
            onChange={handleProvinceChange}
            disabled={isCitiesLoading}
            className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="">{isCitiesLoading ? "در حال بارگذاری..." : "همه استان‌ها"}</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* انتخاب شهر آبشاری */}
        <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
          <select
            value={selectedCityId ?? ""}
            onChange={handleCityChange}
            disabled={!selectedProvinceId || availableCities.length === 0}
            className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none disabled:opacity-50"
          >
            <option value="">
              {!selectedProvinceId
                ? "ابتدا استان را انتخاب کنید"
                : availableCities.length === 0
                ? "شهری یافت نشد"
                : "همه شهرهای استان"}
            </option>
            {availableCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* نوع سازه از API */}
        <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
          <Layers className="h-5 w-5 text-muted-foreground shrink-0" />
          <select
            value={selectedTypeId ?? ""}
            onChange={handleTypeChange}
            disabled={isTypesLoading}
            className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="">{isTypesLoading ? "در حال دریافت انواع..." : "همه انواع سازه"}</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* دکمه جستجو */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          جستجو روی نقشه
        </button>
      </div>
    </form>
  );
}
