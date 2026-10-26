"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Maximize2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { Structure } from "../types";
import { formatToman } from "@/shared/lib/money";

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

  const code = structure.code || String(structure.id);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAvailable = structure.status === "available";
  const isLocked = structure.status === "locked";

  const mainImage =
    structure.image ||
    (Array.isArray(structure.images)
      ? structure.images[0]
      : structure.images?.day) ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";

  const typeName =
    typeof structure.type === "object" && structure.type?.name
      ? structure.type.name
      : "سازه تبلیغاتی";

  const cityName =
    typeof structure.city === "string"
      ? structure.city
      : (structure.city as { name?: string })?.name || structure.location?.city || "";

  const address = structure.address || structure.location?.address || "";

  const priceRial = structure.price ?? structure.pricing?.basePriceMonthly ?? 0;

  return (
    <article
      id={`structure-card-${structure.id}`}
      onMouseEnter={() => onHover?.(String(structure.id))}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(String(structure.id))}
      className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : isHovered
          ? "border-primary/50 shadow-md"
          : "border-border hover:border-border/80"
      }`}
    >
      {/* ستون راست (در حالت دسکتاپ): عکس سازه */}
      <div className="relative h-48 w-full sm:h-auto sm:w-56 shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={mainImage}
          alt={structure.title}
          fill
          sizes="(max-width: 640px) 100vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* وضعیت اکران روی تصویر */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
              <CheckCircle2 className="h-3 w-3" />
              <span>آماده رزرو</span>
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
              <Clock className="h-3 w-3" />
              <span>قفل موقت</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
              <span>{structure.statusLabel || "در حال اکران"}</span>
            </span>
          )}
        </div>

        {/* نوع سازه پایین عکس */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
          {typeName}
        </div>
      </div>

      {/* ستون چپ: مشخصات و اطلاعات */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* هدر بالایی کارت: کد سازه و شهر */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {cityName || typeName}
            </span>

            <button
              type="button"
              onClick={handleCopyCode}
              title="کپی شناسه سازه"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md"
            >
              <span>{code}</span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* عنوان سازه */}
          <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/structures/${structure.id}`}>
              {structure.title}
            </Link>
          </h3>

          {/* آدرس دقیق */}
          {address && (
            <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
              <span>{address}</span>
            </p>
          )}

          {/* ابعاد در صورت وجود */}
          {structure.dimensions?.label && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
                <Maximize2 className="h-3 w-3 text-slate-500" />
                {structure.dimensions.label}
              </span>
            </div>
          )}
        </div>

        {/* بخش قیمت و دکمه مشاهده */}
        <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              تعرفه پایه اکران ماهانه
            </div>
            <div className="text-base sm:text-lg font-extrabold text-foreground">
              {priceRial > 0 ? formatToman(priceRial) : "تماس بگیرید"}
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
