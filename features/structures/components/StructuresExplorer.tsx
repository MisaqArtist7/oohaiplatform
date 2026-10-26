"use client";

import React, { useState } from "react";
import {
  Map as MapIcon,
  List as ListIcon,
  Inbox,
  RotateCcw,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import StructureCard from "./StructureCard";
import InteractiveMap from "./InteractiveMap";
import StructureFilters from "./StructureFilters";
import {
  useStructures,
  useStructureTypes,
  useStructureCategories,
} from "../hooks/useStructures";
import { toPersianDigits } from "@/shared/lib/digits";

export default function StructuresExplorer() {
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [hoveredStructureId, setHoveredStructureId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");

  // دریافت انواع و دسته‌بندی‌ها از API
  const { data: types = [] } = useStructureTypes();
  const { data: categories = [] } = useStructureCategories();

  // دریافت سازه‌ها از API واقعی بر اساس پارامترهای مجاز
  const {
    data: pageData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useStructures({
    page,
    per_page: perPage,
    structure_type_id: selectedTypeId ?? undefined,
    category_ids: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
  });

  const structures = pageData?.items ?? [];
  const total = pageData?.total ?? 0;
  const lastPage = pageData?.lastPage ?? 1;

  const handleTypeChange = (typeId: number | null) => {
    setSelectedTypeId(typeId);
    setPage(1);
  };

  const handleCategoryToggle = (catId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedTypeId(null);
    setSelectedCategoryIds([]);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* نوار فیلترهای استاندارد متصل به API */}
      <StructureFilters
        types={types}
        categories={categories}
        selectedTypeId={selectedTypeId}
        selectedCategoryIds={selectedCategoryIds}
        totalResults={total}
        onTypeChange={handleTypeChange}
        onCategoryToggle={handleCategoryToggle}
        onReset={handleResetFilters}
      />

      {/* سوییچر تب برای موبایل (لیست / نقشه) */}
      <div className="lg:hidden border-b border-border bg-white p-2">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
              mobileTab === "list"
                ? "bg-white text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            <span>فهرست سازه‌ها ({toPersianDigits(structures.length)})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("map")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
              mobileTab === "map"
                ? "bg-white text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapIcon className="h-4 w-4" />
            <span>نقشه تعاملی</span>
          </button>
        </div>
      </div>

      {/* بخش اصلی: ستون لیست و ستون نقشه */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ستون راست (در حالت RTL): لیست سازه‌ها */}
        <section
          aria-label="فهرست سازه‌های تبلیغاتی"
          className={`w-full lg:w-[52%] xl:w-[48%] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 ${
            mobileTab === "map" ? "hidden lg:block" : "block"
          }`}
        >
          {/* هدر وضعیت بارگذاری و نتایج */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
            <span>
              نمایش {toPersianDigits(structures.length)} از مجموع {toPersianDigits(total)} سازه
            </span>
            {isFetching && (
              <span className="flex items-center gap-1.5 text-primary font-bold">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>در حال به‌روزرسانی...</span>
              </span>
            )}
          </div>

          {/* حالت خطای دریافت از سرور */}
          {isError && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-3"
            >
              <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
              <h3 className="text-base font-bold text-rose-950">
                خطا در برقراری ارتباط با سرور سازه‌ها
              </h3>
              <p className="text-xs text-rose-800 max-w-md mx-auto">
                {error instanceof Error ? error.message : "امکان بارگذاری اطلاعات سازه‌ها وجود ندارد."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>تلاش مجدد</span>
              </button>
            </div>
          )}

          {/* اسکلتون لودینگ */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl border border-border bg-white p-4 animate-pulse flex flex-col sm:flex-row gap-4"
                >
                  <div className="h-36 w-full sm:w-56 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    <div className="h-4 w-1/3 bg-slate-200 rounded mt-4" />
                    <div className="h-8 w-2/5 bg-slate-200 rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* حالت خالی بدون نتیجه */}
          {!isLoading && !isError && structures.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-muted-foreground">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  هیچ سازه‌ای با این مشخصات یافت نشد
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  فیلترهای انتخابی نوع یا دسته‌بندی را تغییر دهید تا نتایج دیگر نمایش داده شوند.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>پاک‌کردن فیلترها</span>
              </button>
            </div>
          )}

          {/* لیست کارت‌ها */}
          {!isLoading && !isError && structures.length > 0 && (
            <div className="space-y-4">
              {structures.map((structure) => (
                <StructureCard
                  key={structure.id}
                  structure={structure}
                  isSelected={String(selectedStructureId) === String(structure.id)}
                  isHovered={String(hoveredStructureId) === String(structure.id)}
                  onHover={(id) => setHoveredStructureId(id)}
                  onSelect={(id) => setSelectedStructureId(id)}
                />
              ))}

              {/* کنترل صفحه‌بندی (Pagination) */}
              {lastPage > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/80 text-xs">
                  <button
                    type="button"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>صفحه قبل</span>
                  </button>

                  <span className="font-bold text-slate-600">
                    صفحه {toPersianDigits(page)} از {toPersianDigits(lastPage)}
                  </span>

                  <button
                    type="button"
                    disabled={page >= lastPage || isLoading}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <span>صفحه بعد</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ستون چپ: نقشه تعاملی */}
        <section
          aria-label="نقشه تعاملی بیلبوردها"
          className={`flex-1 h-[60vh] lg:h-auto sticky top-32 ${
            mobileTab === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <InteractiveMap
            structures={structures}
            selectedId={selectedStructureId}
            hoveredId={hoveredStructureId}
            onSelectStructure={(id) => setSelectedStructureId(id)}
            className="h-full w-full"
          />
        </section>
      </div>
    </div>
  );
}
