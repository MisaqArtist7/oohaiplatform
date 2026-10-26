"use client";

import React from "react";
import {
  MapPin,
  Navigation2,
  ExternalLink,
  Compass,
} from "lucide-react";
import { StructureLocation } from "../types";
import { toPersianDigits } from "@/lib/mock-data";

interface MiniMapLocationProps {
  location: StructureLocation;
  title: string;
}

export default function MiniMapLocation({ location, title }: MiniMapLocationProps) {
  const { lat, lng, address, district, trafficFlow } = location;

  // لینک‌های مسیریابی مستقیم
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const neshanUrl = `https://neshan.org/maps/@${lat},${lng},16z`;
  const baladUrl = `https://balad.ir/location?latitude=${lat}&longitude=${lng}`;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>موقعیت مکانی دقیق روی نقشه</span>
        </h3>
        <span className="text-xs font-mono text-muted-foreground bg-slate-100 px-2.5 py-1 rounded-lg">
          {toPersianDigits(lat.toFixed(4))}° N, {toPersianDigits(lng.toFixed(4))}° E
        </span>
      </div>

      {/* نقشه شماتیک و لوکیشن پین شده با انیمیشن رادار */}
      <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-[#e2eaf2]">
        {/* پس‌زمینه گرافیکی نقشه با معابر فرضی */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#64748b_1.2px,transparent_1.2px)] [background-size:20px_20px]" />
        
        {/* خطوط معابر اطراف سازه */}
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 240">
          <path d="M 0 120 Q 200 110, 400 130" stroke="#cbd5e1" strokeWidth="20" fill="none" />
          <path d="M 0 120 Q 200 110, 400 130" stroke="#fbbf24" strokeWidth="8" fill="none" />
          <path d="M 180 0 L 220 240" stroke="#cbd5e1" strokeWidth="16" fill="none" />
          <path d="M 180 0 L 220 240" stroke="#ffffff" strokeWidth="6" fill="none" />
        </svg>

        {/* پین پالس‌زن در مرکز نقشه */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* حلقه پالس‌زن انیمیشنی */}
            <span className="absolute h-14 w-14 rounded-full bg-primary/25 animate-ping" />
            <span className="absolute h-9 w-9 rounded-full bg-primary/30" />
            
            {/* آیکون پین اصلی */}
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-4 ring-white">
              <MapPin className="h-5 w-5 fill-current" />
            </div>
          </div>

          <div
            className="mt-1.5 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md whitespace-nowrap"
            title={title}
          >
            محل دقیق نصب {title}
          </div>
        </div>

        {/* برچسب قطب‌نما */}
        <div className="absolute top-3 right-3 rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs flex items-center gap-1">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>منطقه تحت پوشش</span>
        </div>
      </div>

      {/* اطلاعات آدرس و ترافیک */}
      <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="font-semibold text-foreground leading-relaxed">
            {district} - {address}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-slate-200/60">
          <Navigation2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>جریان ترافیک: {trafficFlow}</span>
        </div>
      </div>

      {/* دکمه‌های مسیریابی سریع با اپلیکیشن‌ها */}
      <div>
        <div className="text-xs font-bold text-foreground mb-2">
          مسیریابی مستقیم جهت بازدید حضوری از سازه:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href={neshanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-primary/50 transition-all shadow-2xs"
          >
            <span>نشان</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
          <a
            href={baladUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-primary/50 transition-all shadow-2xs"
          >
            <span>بلد</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-primary/50 transition-all shadow-2xs"
          >
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-primary/50 transition-all shadow-2xs"
          >
            <span>Waze</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
}
