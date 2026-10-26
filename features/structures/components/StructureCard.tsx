"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Maximize2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { Structure } from "../types";
import { formatToman, toPersianDigits } from "@/lib/mock-data";

interface StructureCardProps {
  structure: Structure;
  isSelected?: boolean;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
}

export default function StructureCard({
  structure,
  isSelected = false,
  isHovered = false,
  onHover,
  onSelect,
}: StructureCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(structure.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAvailable = structure.status === "available";
  const isReserved = structure.status === "reserved";

  return (
    <article
      id={`structure-card-${structure.id}`}
      onMouseEnter={() => onHover?.(structure.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(structure.id)}
      className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : isHovered
          ? "border-primary/50 shadow-md"
          : "border-border hover:border-border/80"
      }`}
    >
      {/* ستون تصویر */}
      <div className="relative h-52 sm:h-auto sm:w-56 md:w-64 shrink-0 overflow-hidden bg-muted">
        <Image
          src={structure.images.day}
          alt={structure.title}
          fill
          sizes="(max-width: 640px) 100vw, 256px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* وضعیت دسترسی روی تصویر */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-md shadow-xs ${
              isAvailable
                ? "bg-emerald-600/90 text-white"
                : isReserved
                ? "bg-amber-600/90 text-white"
                : "bg-slate-700/90 text-slate-200"
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {structure.statusLabel}
          </span>
        </div>

        {/* نوع سازه روی تصویر */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <span className="rounded-lg bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {structure.type.name}
          </span>
          <span className="rounded-lg bg-black/60 px-2 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
            {structure.category.name}
          </span>
        </div>

        {/* امتیاز دید */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-800 shadow-xs backdrop-blur-md">
          <Eye className="h-3 w-3 text-primary" />
          <span>دید {toPersianDigits(structure.specs.visibilityScore)}٪</span>
        </div>
      </div>

      {/* ستون محتوا و جزئیات */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* کد سازه و کپی */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <span className="font-mono font-semibold tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {structure.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="کپی کد سازه"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </span>
            <span className="text-[11px] text-muted-foreground">
              {structure.location.district}
            </span>
          </div>

          {/* عنوان */}
          <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary leading-snug">
            <Link href={`/structures/${structure.id}`}>
              {structure.title}
            </Link>
          </h3>

          {/* آدرس دقیق */}
          <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
            <span>{structure.location.address}</span>
          </p>

          {/* مشخصات ابعاد و ویژگی‌ها */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
              <Maximize2 className="h-3 w-3 text-slate-500" />
              {structure.dimensions.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              {structure.specs.orientation}
            </span>
          </div>
        </div>

        {/* بخش قیمت و دکمه مشاهده */}
        <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              تعرفه پایه اکران ماهانه
            </div>
            <div className="text-base sm:text-lg font-extrabold text-foreground">
              {formatToman(structure.pricing.basePriceMonthly)}
            </div>
          </div>

          <Link
            href={`/structures/${structure.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:gap-2 active:scale-95"
          >
            <span>مشاهده جزئیات</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
