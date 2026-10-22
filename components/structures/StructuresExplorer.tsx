"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Structure,
  StructureCategory,
  StructureType,
  StructureFilters,
} from "@/types/structure";
import StructureCard from "./StructureCard";
import InteractiveMap from "./InteractiveMap";
import StructureFiltersBar from "./StructureFilters";
import {
  fetchStructures,
  fetchStructureTypes,
  fetchStructureCategories,
} from "@/lib/api-client";
import {
  Map,
  List,
  Inbox,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toPersianDigits } from "@/lib/mock-data";

interface StructuresExplorerProps {
  initialStructures?: Structure[];
  initialTypes?: StructureType[];
  initialCategories?: StructureCategory[];
}

export default function StructuresExplorer({
  initialStructures = [],
  initialTypes = [],
  initialCategories = [],
}: StructuresExplorerProps) {
  const [structures, setStructures] = useState<Structure[]>(initialStructures);
  const [types, setTypes] = useState<StructureType[]>(initialTypes);
  const [categories, setCategories] = useState<StructureCategory[]>(initialCategories);
  const [loading, setLoading] = useState(initialStructures.length === 0);

  const [filters, setFilters] = useState<StructureFilters>({
    search: "",
    typeId: "all",
    categoryId: "all",
    status: "all",
    sortBy: "recommended",
  });

  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [hoveredStructureId, setHoveredStructureId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");

  // بارگذاری داده‌ها از API با فیلترها
  const loadData = useCallback(async (currentFilters: StructureFilters) => {
    setLoading(true);
    try {
      const res = await fetchStructures(currentFilters);
      setStructures(res.structures);
    } catch (err) {
      console.error("Error loading structures:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // بارگذاری اولیه تایپ‌ها و دسته‌بندی‌ها در صورت عدم پاس از سرور
  useEffect(() => {
    if (types.length === 0 || categories.length === 0) {
      Promise.all([fetchStructureTypes(), fetchStructureCategories()])
        .then(([t, c]) => {
          setTypes(t);
          setCategories(c);
        })
        .catch((e) => console.error("Initial types/categories error:", e));
    }
  }, [types.length, categories.length]);

  // اعمال فیلترها با تاخیر برای جستجو
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(filters);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, loadData]);

  // تغییر فیلتر
  const handleFilterChange = (newFilters: Partial<StructureFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // بازنشانی فیلترها
  const handleResetFilters = () => {
    const defaultFilters: StructureFilters = {
      search: "",
      typeId: "all",
      categoryId: "all",
      status: "all",
      sortBy: "recommended",
    };
    setFilters(defaultFilters);
  };

  // انتخاب سازه روی نقشه یا لیست و اسکرول نرم
  const handleSelectStructure = (id: string) => {
    setSelectedStructureId(id);

    // اگر در نمای موبایل هستیم و کاربر روی پین نقشه کلیک کرد، نقشه پاپ‌آپ دارد
    // اما در دسکتاپ، اسکرول نرم به سمت کارد در ستون راست
    const cardEl = document.getElementById(`structure-card-${id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* نوار بالایی فیلتر و جستجو */}
      <StructureFiltersBar
        types={types}
        categories={categories}
        filters={filters}
        totalResults={structures.length}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* بخش اصلی: چیدمان دو ستونه اسپلیت اسکرین (Airbnb Style) */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ستون راست (در RTL یعنی اولین بخش): فهرست کاردها (Grid List) */}
          <div
            className={`lg:col-span-7 xl:col-span-7 space-y-4 ${
              mobileTab === "map" ? "hidden lg:block" : "block"
            }`}
          >
            {/* نوار سربرگ نتایج */}
            <div className="flex items-center justify-between px-1 py-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>نتایج جستجو:</span>
                <span className="text-primary font-black">
                  {toPersianDigits(structures.length)} سازه آماده بررسی
                </span>
              </div>
              <div className="hidden sm:block text-[11px]">
                روی پین‌های نقشه یا کارت‌ها کلیک کنید تا متصل شوند
              </div>
            </div>

            {/* حالت بارگذاری اسکلتون */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-56 rounded-2xl border border-border bg-white p-4 shadow-2xs flex flex-col sm:flex-row gap-4 animate-pulse"
                  >
                    <div className="h-48 sm:h-auto sm:w-56 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-6 w-3/4 bg-slate-200 rounded" />
                      <div className="h-4 w-1/2 bg-slate-200 rounded" />
                      <div className="h-10 w-full bg-slate-100 rounded-xl mt-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : structures.length === 0 ? (
              /* حالت عدم وجود نتیجه با فیلترهای انتخابی */
              <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-muted-foreground">
                  <Inbox className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    هیچ سازه‌ای با این مشخصات یافت نشد
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    می‌توانید کلمه جستجو شده را کوتاه‌تر کنید، فیلتر نوع سازه را روی «همه» بگذارید یا فیلترها را ریست نمایید.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>پاک کردن تمام فیلترها</span>
                </button>
              </div>
            ) : (
              /* رندر لیست کاردها */
              <div className="space-y-4">
                {structures.map((item) => (
                  <StructureCard
                    key={item.id}
                    structure={item}
                    isSelected={selectedStructureId === item.id}
                    isHovered={hoveredStructureId === item.id}
                    onHover={setHoveredStructureId}
                    onSelect={handleSelectStructure}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ستون چپ (در RTL یعنی بخش سمت چپ): نقشه تعاملی استیکی (Interactive Map) */}
          <div
            className={`lg:col-span-5 xl:col-span-5 lg:sticky lg:top-36 ${
              mobileTab === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <InteractiveMap
              structures={structures}
              selectedId={selectedStructureId}
              hoveredId={hoveredStructureId}
              onSelectStructure={handleSelectStructure}
            />
          </div>

        </div>
      </div>

      {/* دکمه شناور جابجایی نقشه / لیست برای حالت موبایل (Airbnb Mobile Style) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab((t) => (t === "list" ? "map" : "list"))}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl transition-transform active:scale-95 border border-slate-700"
        >
          {mobileTab === "list" ? (
            <>
              <Map className="h-4 w-4 text-primary" />
              <span>مشاهده روی نقشه ({toPersianDigits(structures.length)})</span>
            </>
          ) : (
            <>
              <List className="h-4 w-4 text-primary" />
              <span>مشاهده فهرست ({toPersianDigits(structures.length)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
