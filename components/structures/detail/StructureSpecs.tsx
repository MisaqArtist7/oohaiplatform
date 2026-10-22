"use client";

import React from "react";
import {
  Maximize2,
  Eye,
  SunMedium,
  Layers,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Star,
} from "lucide-react";
import { Structure } from "@/types/structure";
import { toPersianDigits } from "@/lib/mock-data";

interface StructureSpecsProps {
  structure: Structure;
}

export default function StructureSpecs({ structure }: StructureSpecsProps) {
  const specs = structure.specs;

  return (
    <div className="space-y-8">
      {/* جدول کارت‌های مشخصات فنی (Technical Specifications Grid) */}
      <div>
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <span>مشخصات فنی و استانداردهای سازه</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* ابعاد و مساحت */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-medium mb-1.5">
              <Maximize2 className="h-4 w-4 text-primary" />
              <span>ابعاد و متراژ مفید سطح اکران</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {structure.dimensions.label}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              عرض: {toPersianDigits(structure.dimensions.width)} متر | ارتفاع: {toPersianDigits(structure.dimensions.height)} متر
            </div>
          </div>

          {/* زاویه دید رانندگان */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-medium mb-1.5">
              <Eye className="h-4 w-4 text-primary" />
              <span>زاویه دید و فاصله رویت</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {structure.location.viewingAngle}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              تسلط بدون مانع بصری، درختی یا تابلوهای مجاور
            </div>
          </div>

          {/* سیستم نورپردازی شبانه */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-medium mb-1.5">
              <SunMedium className="h-4 w-4 text-amber-500" />
              <span>سیستم نورپردازی در شب</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {specs.lighting}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              روشنایی یکپارچه با تایمر فتوسل اتوماتیک
            </div>
          </div>

          {/* نوع متریال و چاپ */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-medium mb-1.5">
              <Layers className="h-4 w-4 text-primary" />
              <span>جنس سازه و متریال اکران</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {specs.mediaType}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              مقاوم در برابر باد، آفتاب، رطوبت و باران اسیدی
            </div>
          </div>

          {/* جهت تردد و زاویه استقرار */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-medium mb-1.5">
              <Compass className="h-4 w-4 text-blue-500" />
              <span>جهت حرکت و خطوط تردد</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {specs.orientation}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {specs.isTwoSided ? "سازه دو وجهی" : "سازه تک وجهی مسلط"}
            </div>
          </div>

          {/* ساعات اوج ترافیک */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-medium mb-1.5">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>پیک تردد و توقف ترافیک</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {specs.rushHourPeak || "۷:۰۰ الی ۲۲:۰۰ پیوسته"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              بیشترین مدت ماندگاری نگاه رانندگان در ترافیک
            </div>
          </div>
        </div>
      </div>

      {/* بنر امتیاز دید و تحلیل مخاطبان (Visibility Score Banner) */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>شاخص هوشمند بازدهی تبلیغات (OOH Score)</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">
              شاخص ماندگاری پیام: {toPersianDigits(specs.visibilityScore)} از ۱۰۰
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              محاسبه‌شده با الگوریتم‌های هوش مصنوعی بر پایه حجم تردد روزانه خودروها ({structure.location.trafficFlow})، ارتفاع از سطح زمین، انحنای خیابان و فاصله دید موثر راننده.
            </p>
          </div>

          {/* عدد بزرگ امتیاز */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md text-3xl font-black font-sans">
            {toPersianDigits(specs.visibilityScore)}٪
          </div>
        </div>

        {/* نوار پیشرفت بصری */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000"
            style={{ width: `${specs.visibilityScore}%` }}
          />
        </div>
      </div>

      {/* توضیحات مشروح درباره سازه و کارشناسی موقعیت */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground">
          درباره موقعیت استراتژیک سازه و مخاطبان هدف
        </h3>
        <p className="text-sm leading-relaxed text-slate-700 bg-white p-5 rounded-2xl border border-border">
          {structure.description}
        </p>
      </div>

      {/* لیست مزایا و ضمانت‌های سازه */}
      <div>
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>تضمین‌ها و خدمات جانبی این سازه</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {structure.features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-3 text-xs font-semibold text-slate-800 shadow-2xs"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* اطلاعات مالک رسانه / کانون معتبر */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">
                {structure.owner.name}
              </h4>
              {structure.owner.verified && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  <CheckCircle2 className="h-3 w-3" />
                  کانون تایید شده
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-bold mr-1 text-slate-800">
                  {toPersianDigits(structure.owner.rating)}
                </span>
              </div>
              <span>•</span>
              <span>دارای مجوز رسمی از وزارت فرهنگ و ارشاد اسلامی</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
          امکان استعلام زنده قرارداد و صدور فاکتور رسمی
        </div>
      </div>
    </div>
  );
}
