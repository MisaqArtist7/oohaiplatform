"use client";

import React from "react";
import {
  Layers,
  MapPin,
  Building2,
  FileText,
  Users,
} from "lucide-react";
import { Structure } from "../types";

interface StructureSpecsProps {
  structure: Structure;
}

export default function StructureSpecs({ structure }: StructureSpecsProps) {
  const typeName =
    typeof structure.type === "object" && structure.type?.name
      ? structure.type.name
      : "سازه محیطی";

  const cityName =
    typeof structure.city === "string"
      ? structure.city
      : (structure.city as { name?: string })?.name || structure.location?.city || "";

  const address = structure.address || structure.location?.address || "";
  const categories = structure.categories || (structure.category ? [structure.category] : []);

  return (
    <div className="space-y-6">
      {/* کارت مشخصات اصلی سازه مطابق داده‌های موجود در API */}
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border/70">
          <Layers className="h-5 w-5 text-primary" />
          <span>مشخصات سازه تبلیغاتی</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* نوع رسانه */}
          <div className="rounded-xl border border-border bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <span>نوع رسانه محیطی</span>
            </div>
            <div className="text-sm font-bold text-foreground">{typeName}</div>
          </div>

          {/* شهر و استان */}
          {cityName && (
            <div className="rounded-xl border border-border bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span>موقعیت شهری</span>
              </div>
              <div className="text-sm font-bold text-foreground">{cityName}</div>
            </div>
          )}

          {/* تیپ مخاطبان عبوری (در صورت وجود در پاسخ API) */}
          {structure.audience_type && (
            <div className="rounded-xl border border-border bg-slate-50/60 p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>تیپ مخاطبان عبوری</span>
              </div>
              <div className="text-sm font-bold text-foreground">
                {structure.audience_type}
              </div>
            </div>
          )}

          {/* دسته‌بندی‌های محیطی */}
          {categories.length > 0 && (
            <div className="rounded-xl border border-border bg-slate-50/60 p-4 sm:col-span-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                دسته‌بندی‌های محیطی سازه:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="rounded-lg bg-white border border-border px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* آدرس دقیق محل استقرار */}
        {address && (
          <div className="pt-2">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="font-semibold text-foreground leading-relaxed">
                نشانی دقیق: {address}
              </span>
            </div>
          </div>
        )}

        {/* توضیحات تکمیلی سازه (در صورت وجود) */}
        {structure.description && (
          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>توضیحات و ویژگی‌های مکانی:</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-border/50">
              {structure.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
