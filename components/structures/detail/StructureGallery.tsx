"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sun, Moon, Maximize2, X } from "lucide-react";
import { StructureImages } from "@/types/structure";

interface StructureGalleryProps {
  images: StructureImages;
  title: string;
}

export default function StructureGallery({ images, title }: StructureGalleryProps) {
  const [activeTab, setActiveTab] = useState<"day" | "night">("day");
  const [selectedImage, setSelectedImage] = useState<string>(images.day);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allImages = images.gallery && images.gallery.length > 0
    ? images.gallery
    : [images.day, images.night];

  const handleTabChange = (mode: "day" | "night") => {
    setActiveTab(mode);
    setSelectedImage(mode === "day" ? images.day : images.night);
  };

  return (
    <div className="space-y-3">
      {/* تصویر اصلی بزرگ با قابلیت تغییر دید روز/شب */}
      <div className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* دکمه‌های جابجایی دید روز و شب */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-xl bg-black/60 p-1 backdrop-blur-md border border-white/20">
          <button
            type="button"
            onClick={() => handleTabChange("day")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "day"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>دید در روز</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("night")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "night"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>نورپردازی شب</span>
          </button>
        </div>

        {/* دکمه بزرگ‌نمایی تمام‌صفحه */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          title="مشاهده در اندازه بزرگ"
          className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
          <span className="hidden sm:inline">مشاهده گالری</span>
        </button>

        {/* عنوان زیر تصویر */}
        <div className="absolute bottom-4 right-4 z-10 max-w-md pointer-events-none">
          <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md mb-1">
            تصویر واقعی محل اکران سازه
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white drop-shadow-md truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* نوار تصاویر بندانگشتی (Thumbnails) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allImages.map((img, idx) => {
          const isCurrent = selectedImage === img;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative h-18 w-24 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/30 scale-95"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} - تصویر ${idx + 1}`}
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* مودال لایت‌باکس بزرگ‌نمایی */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 left-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-[70vh] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt={title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
