"use client";

import React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { StructureCategory, StructureType, StructureFilters } from "@/types/structure";
import { toPersianDigits } from "@/lib/mock-data";

interface StructureFiltersProps {
  types: StructureType[];
  categories: StructureCategory[];
  filters: StructureFilters;
  totalResults: number;
  onFilterChange: (newFilters: Partial<StructureFilters>) => void;
  onResetFilters: () => void;
}

export default function StructureFiltersBar({
  types,
  categories,
  filters,
  totalResults,
  onFilterChange,
  onResetFilters,
}: StructureFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.typeId && filters.typeId !== "all") ||
      (filters.categoryId && filters.categoryId !== "all") ||
      (filters.status && filters.status !== "all") ||
      (filters.sortBy && filters.sortBy !== "recommended")
  );

  return (
    <div className="bg-white border-b border-border/80 sticky top-16 z-30 shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 space-y-3">
        {/* ردیف اول: نوار جستجو، چیپ‌های نوع سازه، و دکمه‌های کنترلی */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* نوار جستجوی متنی */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="جستجوی نام سازه، بزرگراه یا منطقه (مثلاً: همت، صدر، ولیعصر)..."
              className="w-full rounded-xl border border-border bg-slate-50/70 pr-10 pl-9 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ search: "" })}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ابزارهای سمت چپ: سورت و فیلترهای پیشرفته */}
          <div className="flex items-center gap-2">
            {/* انتخاب مرتب‌سازی */}
            <div className="relative inline-flex items-center">
              <ArrowUpDown className="absolute right-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={filters.sortBy || "recommended"}
                onChange={(e) =>
                  onFilterChange({
                    sortBy: e.target.value as StructureFilters["sortBy"],
                  })
                }
                className="appearance-none rounded-xl border border-border bg-white pr-8 pl-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-slate-50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="recommended">مرتب‌سازی: پیشنهادی</option>
                <option value="visibility">بیشترین امتیاز دید</option>
                <option value="price_asc">ارزان‌ترین تعرفه</option>
                <option value="price_desc">گران‌ترین تعرفه</option>
                <option value="newest">جدیدترین سازه‌ها</option>
              </select>
            </div>

            {/* دکمه باز و بسته کردن فیلترهای تکمیلی */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                showAdvanced || hasActiveFilters
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>فیلترها</span>
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  ✓
                </span>
              )}
            </button>

            {/* بازنشانی */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                title="پاک کردن تمام فیلترها"
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">بازنشانی</span>
              </button>
            )}
          </div>
        </div>

        {/* ردیف دوم: چیپ‌های افقی نوع سازه (Types) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => onFilterChange({ typeId: "all" })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-medium transition-all ${
              !filters.typeId || filters.typeId === "all"
                ? "bg-foreground text-background font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            همه انواع سازه ({toPersianDigits(totalResults)})
          </button>
          {types.map((type) => {
            const isSelected = filters.typeId === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  onFilterChange({ typeId: isSelected ? "all" : type.id })
                }
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{type.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-white text-slate-500"
                  }`}
                >
                  {toPersianDigits(type.count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* پنل فیلترهای تکمیلی (Categories & Status) */}
        {showAdvanced && (
          <div className="rounded-xl border border-border bg-slate-50/60 p-3 pt-3.5 space-y-3 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            {/* فیلتر دسته‌بندی‌ها */}
            <div>
              <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>دسته‌بندی محیطی و جغرافیایی:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onFilterChange({ categoryId: "all" })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    !filters.categoryId || filters.categoryId === "all"
                      ? "bg-primary text-white"
                      : "bg-white border border-border text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  تمام دسته‌ها
                </button>
                {categories.map((cat) => {
                  const isCatSelected = filters.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        onFilterChange({
                          categoryId: isCatSelected ? "all" : cat.id,
                        })
                      }
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        isCatSelected
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white border border-border text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {isCatSelected && <Check className="h-3 w-3" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* فیلتر وضعیت اکران */}
            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">وضعیت اکران:</span>
                <div className="inline-flex rounded-lg border border-border bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ status: "all" })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      !filters.status || filters.status === "all"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-foreground"
                    }`}
                  >
                    همه
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ status: "available" })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      filters.status === "available"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:text-foreground"
                    }`}
                  >
                    فقط آماده اکران فوری
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ status: "booked" })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      filters.status === "booked"
                        ? "bg-slate-700 text-white"
                        : "text-slate-600 hover:text-foreground"
                    }`}
                  >
                    رزرو شده
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground font-medium">
                نمایش {toPersianDigits(totalResults)} سازه معتبر در نقشه تهران
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
