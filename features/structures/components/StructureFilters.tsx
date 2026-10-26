"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  Check,
  Layers,
  Filter,
} from "lucide-react";
import { StructureTypeItem, StructureCategoryItem } from "../types";
import { toPersianDigits } from "@/shared/lib/digits";

export interface StructureFiltersProps {
  types: StructureTypeItem[];
  categories: StructureCategoryItem[];
  selectedTypeId?: number | string | null;
  selectedCategoryIds?: number[];
  totalResults: number;
  onTypeChange: (typeId: number | null) => void;
  onCategoryToggle: (categoryId: number) => void;
  onReset: () => void;
}

export default function StructureFilters({
  types,
  categories,
  selectedTypeId,
  selectedCategoryIds = [],
  totalResults,
  onTypeChange,
  onCategoryToggle,
  onReset,
}: StructureFiltersProps) {
  const [showCategories, setShowCategories] = useState(false);

  const activeTypeIdNum = selectedTypeId ? Number(selectedTypeId) : null;
  const hasActiveFilters = Boolean(activeTypeIdNum || selectedCategoryIds.length > 0);

  return (
    <div className="bg-white border-b border-border/80 sticky top-16 z-30 shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 space-y-3">
        {/* نوار اصلی: چیپ‌های انواع سازه (پشتیبانی‌شده در GET /structures?structure_type_id=X) */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs flex-1">
            <button
              type="button"
              onClick={() => onTypeChange(null)}
              className={`shrink-0 rounded-full px-4 py-2 font-medium transition-all ${
                !activeTypeIdNum
                  ? "bg-foreground text-background font-bold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              همه انواع سازه ({toPersianDigits(totalResults)})
            </button>

            {types.map((type) => {
              const isSelected = activeTypeIdNum === Number(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onTypeChange(isSelected ? null : Number(type.id))}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>

          {/* دکمه‌های کنترلی: دسته‌بندی‌ها و بازنشانی */}
          <div className="flex items-center gap-2 shrink-0">
            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCategories(!showCategories)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  showCategories || selectedCategoryIds.length > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>دسته‌بندی‌ها</span>
                {selectedCategoryIds.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {toPersianDigits(selectedCategoryIds.length)}
                  </span>
                )}
              </button>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                title="پاک کردن تمام فیلترها"
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>بازنشانی</span>
              </button>
            )}
          </div>
        </div>

        {/* پنل فیلتر دسته‌بندی‌ها (پشتیبانی‌شده در GET /structures?category_ids[]=X) */}
        {showCategories && categories.length > 0 && (
          <div className="rounded-xl border border-border bg-slate-50/60 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-bold text-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>فیلتر بر اساس دسته‌بندی محیطی (API):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isCatSelected = selectedCategoryIds.includes(Number(cat.id));
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryToggle(Number(cat.id))}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isCatSelected
                        ? "bg-primary text-white shadow-xs font-bold"
                        : "bg-white border border-border text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isCatSelected && <Check className="h-3 w-3" />}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
