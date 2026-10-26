"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  MapPin,
  ExternalLink,
  Info,
  X,
  Compass,
} from "lucide-react";
import { Structure } from "../types";
import { formatShortToman, formatToman } from "@/shared/lib/money";

interface InteractiveMapProps {
  structures: Structure[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelectStructure: (id: string) => void;
  className?: string;
}

// محدوده جغرافیایی تهران تحت پوشش سازه‌ها
const BOUNDS = {
  minLat: 35.700,
  maxLat: 35.815,
  minLng: 51.300,
  maxLng: 51.485,
};

export default function InteractiveMap({
  structures,
  selectedId,
  hoveredId,
  onSelectStructure,
  className = "",
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapStyle, setMapStyle] = useState<"standard" | "dark" | "satellite">("standard");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePopupId, setActivePopupId] = useState<string | null>(null);

  // تبدیل مختصات جغرافیایی به درصد روی صفحه
  const projectCoords = useMemo(() => {
    return (lat: number, lng: number) => {
      const latRange = BOUNDS.maxLat - BOUNDS.minLat;
      const lngRange = BOUNDS.maxLng - BOUNDS.minLng;

      // محاسبه با درصد نرمالایز شده و حاشیه امن
      const xPercent = ((lng - BOUNDS.minLng) / lngRange) * 82 + 9;
      const yPercent = 100 - (((lat - BOUNDS.minLat) / latRange) * 82 + 9);

      return {
        x: Math.max(5, Math.min(95, xPercent)),
        y: Math.max(5, Math.min(95, yPercent)),
      };
    };
  }, []);

  // هندلرهای درگ نقشه
  const handleMouseDown = (e: React.MouseEvent) => {
    // جلوگیری از درگ هنگام کلیک روی پین‌ها
    if ((e.target as HTMLElement).closest(".map-pin-btn")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const activeStructure = useMemo(() => {
    const idToLook = activePopupId || selectedId;
    return structures.find((s) => s.id === idToLook) || null;
  }, [structures, activePopupId, selectedId]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border select-none shadow-sm transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none bg-background"
          : "h-[calc(100vh-140px)] min-h-[500px] w-full"
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* زمینه نقشه با شبکه معابر و بزرگراه‌های اصلی تهران */}
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* تصویر/طرح نقشه شهری برداری */}
        <div
          className={`absolute inset-0 ${
            mapStyle === "dark"
              ? "bg-slate-950 text-slate-400"
              : mapStyle === "satellite"
              ? "bg-[#192734] text-slate-300"
              : "bg-[#e5eef7] text-slate-600"
          }`}
        >
          {/* گرادینت پس‌زمینه شهری */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* خطوط بزرگراه‌ها به صورت SVG تعاملی */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-80" viewBox="0 0 1000 700" preserveAspectRatio="none">
            <defs>
              <linearGradient id="highwayGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* مناطق شهری و پهنه‌ها */}
            <rect x="50" y="50" width="900" height="600" rx="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />

            {/* بزرگراه‌های شرقی-غربی (صدر، همت، حکیم، رسالت) */}
            {/* بزرگراه صدر / نیایش */}
            <path d="M 120 160 C 350 150, 600 170, 880 180" fill="none" stroke="#cbd5e1" strokeWidth="18" strokeLinecap="round" />
            <path d="M 120 160 C 350 150, 600 170, 880 180" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
            
            {/* بزرگراه همت */}
            <path d="M 80 280 C 300 270, 650 280, 920 295" fill="none" stroke="#cbd5e1" strokeWidth="22" strokeLinecap="round" />
            <path d="M 80 280 C 300 270, 650 280, 920 295" fill="none" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" />

            {/* بزرگراه حکیم */}
            <path d="M 100 370 C 350 360, 650 370, 900 380" fill="none" stroke="#cbd5e1" strokeWidth="18" strokeLinecap="round" />
            <path d="M 100 370 C 350 360, 650 370, 900 380" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />

            {/* بزرگراه رسالت / سلیمانی */}
            <path d="M 400 380 C 550 390, 750 410, 950 420" fill="none" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
            <path d="M 400 380 C 550 390, 750 410, 950 420" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />

            {/* بزرگراه‌های شمالی-جنوبی (یادگار، چمران، مدرس، صیاد شیرازی، ولیعصر) */}
            {/* بزرگراه یادگار امام */}
            <path d="M 220 110 C 240 220, 200 340, 260 520" fill="none" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
            <path d="M 220 110 C 240 220, 200 340, 260 520" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />

            {/* بزرگراه چمران */}
            <path d="M 410 130 C 420 230, 400 360, 410 540" fill="none" stroke="#cbd5e1" strokeWidth="18" strokeLinecap="round" />
            <path d="M 410 130 C 420 230, 400 360, 410 540" fill="none" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />

            {/* خیابان ولیعصر */}
            <path d="M 520 100 C 510 240, 520 400, 530 620" fill="none" stroke="#93c5fd" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
            <path d="M 520 100 C 510 240, 520 400, 530 620" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />

            {/* بزرگراه مدرس */}
            <path d="M 600 140 C 590 230, 570 330, 580 460" fill="none" stroke="#cbd5e1" strokeWidth="18" strokeLinecap="round" />
            <path d="M 600 140 C 590 230, 570 330, 580 460" fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round" />

            {/* بزرگراه صیاد شیرازی */}
            <path d="M 750 150 C 760 250, 770 370, 780 550" fill="none" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
            <path d="M 750 150 C 760 250, 770 370, 780 550" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
          </svg>

          {/* برچسب‌های شاخص نام معابر روی نقشه */}
          <div className="absolute top-[22%] right-[16%] text-[11px] font-bold tracking-tight text-slate-500 bg-white/70 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
            پل طبقاتی صدر
          </div>
          <div className="absolute top-[38%] right-[25%] text-[11px] font-bold tracking-tight text-slate-500 bg-white/70 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
            بزرگراه شهید همت
          </div>
          <div className="absolute top-[51%] right-[32%] text-[11px] font-bold tracking-tight text-slate-500 bg-white/70 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
            بزرگراه شهید حکیم
          </div>
          <div className="absolute top-[28%] right-[55%] text-[11px] font-bold tracking-tight text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
            محور ولیعصر - ونک
          </div>
          <div className="absolute top-[18%] left-[22%] text-[11px] font-bold tracking-tight text-slate-500 bg-white/70 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
            سعادت‌آباد و شهرک غرب
          </div>
        </div>

        {/* پین‌های سازه‌ها روی نقشه (Airbnb Style) */}
        {structures.map((structure) => {
          const lat = structure.latitude ?? structure.location?.lat ?? 35.75;
          const lng = structure.longitude ?? structure.location?.lng ?? 51.41;
          const coords = projectCoords(lat, lng);
          const isSelected = String(selectedId) === String(structure.id) || String(activePopupId) === String(structure.id);
          const isHovered = String(hoveredId) === String(structure.id);
          const isAvailable = structure.status === "available";
          const priceRial = structure.price ?? structure.pricing?.basePriceMonthly ?? 0;

          return (
            <div
              key={structure.id}
              className="absolute transition-all duration-300"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isSelected ? 40 : isHovered ? 30 : 10,
              }}
            >
              {/* نشانگر قیمت Airbnb-style */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStructure(String(structure.id));
                  setActivePopupId(String(structure.id));
                }}
                className={`map-pin-btn group flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black shadow-md transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white ring-4 ring-primary/40 scale-110 shadow-xl"
                    : isHovered
                    ? "bg-primary text-white scale-110 shadow-lg ring-2 ring-primary/30"
                    : isAvailable
                    ? "bg-white text-slate-900 hover:bg-slate-900 hover:text-white border border-slate-200 hover:scale-105"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                <span className="flex h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="whitespace-nowrap font-sans">
                  {formatShortToman(priceRial)}
                </span>
              </button>

              {/* نقطه متصل به زمین (Pin Tip) */}
              <div
                className={`mx-auto h-1.5 w-1.5 -translate-y-0.5 rotate-45 rounded-xs transition-colors ${
                  isSelected
                    ? "bg-slate-900"
                    : isHovered
                    ? "bg-primary"
                    : "bg-white border-r border-b border-slate-200"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* کارد پاپ‌آپ پیش‌نمایش سازه انتخاب‌شده روی نقشه */}
      {activeStructure && (
        <div
          className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 z-40 bg-white rounded-2xl p-3 shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-3 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex gap-3">
            {/* تصویر بندانگشتی */}
            <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden bg-muted">
              <Image
                src={
                  activeStructure.image ||
                  (Array.isArray(activeStructure.images)
                    ? activeStructure.images[0]
                    : activeStructure.images?.day) ||
                  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
                }
                alt={activeStructure.title}
                fill
                sizes="96px"
                className="object-cover"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                {typeof activeStructure.type === "object" && activeStructure.type?.name
                  ? activeStructure.type.name
                  : "سازه"}
              </span>
            </div>

            {/* اطلاعات متنی */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                    {activeStructure.code || String(activeStructure.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopupId(null)}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-foreground truncate mt-1">
                  {activeStructure.title}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                  <span className="truncate">
                    {activeStructure.address ||
                      activeStructure.location?.address ||
                      activeStructure.location?.district ||
                      ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                <span className="text-xs font-black text-foreground">
                  {formatToman(activeStructure.price ?? activeStructure.pricing?.basePriceMonthly ?? 0)}
                </span>
                <Link
                  href={`/structures/${activeStructure.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <span>مشاهده</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ابزارهای کنترلی گوشه بالا چپ نقشه (Zoom, Recenter, Style, Fullscreen) */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        {/* زوم این / زوم اوت */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-md">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            title="بزرگ‌نمایی"
            className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
            title="کوچک‌نمایی"
            className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* بازنشانی کادر به مرکز تهران */}
        <button
          type="button"
          onClick={handleResetView}
          title="بازگشت به نمای اولیه تهران"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-700 shadow-md hover:bg-slate-100 transition-colors"
        >
          <Navigation className="h-4 w-4 text-primary" />
        </button>

        {/* تغییر استایل نقشه */}
        <button
          type="button"
          onClick={() => {
            setMapStyle((s) =>
              s === "standard" ? "dark" : s === "dark" ? "satellite" : "standard"
            );
          }}
          title="تغییر تم نقشه (روشن / تاریک / شریانی)"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-700 shadow-md hover:bg-slate-100 transition-colors"
        >
          <Layers className="h-4 w-4 text-slate-600" />
        </button>

        {/* تمام صفحه */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "خروج از تمام‌صفحه" : "مشاهده تمام‌صفحه"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-700 shadow-md hover:bg-slate-100 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* نشانگر راهنمای نقشه و جهت شمال (گوشه بالا راست) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-white/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-xs">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>نقشه تعاملی بزرگراه‌های تهران</span>
        </div>
      </div>

      {/* راهنمای وضعیت پین‌ها (گوشه پایین راست) */}
      <div className="absolute bottom-4 right-4 z-30 hidden sm:flex items-center gap-3 rounded-xl border border-border bg-white/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>آماده اکران</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span>رزرو شده</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Info className="h-3 w-3" />
          <span>کلیک روی پین برای مشاهده</span>
        </div>
      </div>
    </div>
  );
}
