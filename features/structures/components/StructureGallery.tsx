"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { StructureImagesObj } from "../types";

interface StructureGalleryProps {
  images?: string[] | StructureImagesObj;
  title: string;
}

export default function StructureGallery({ images, title }: StructureGalleryProps) {
  const imageList: string[] = Array.isArray(images)
    ? images
    : typeof images === "object" && images?.gallery && images.gallery.length > 0
    ? images.gallery
    : typeof images === "object" && images?.day
    ? [images.day]
    : [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      ];

  const [selectedImage, setSelectedImage] = useState<string>(imageList[0] || "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* تصویر اصلی بزرگ */}
      <div className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
        <Image
          src={selectedImage || imageList[0]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* دکمه بزرگنمایی تمام‌صفحه */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/20 transition-all hover:bg-black/80 cursor-pointer"
        >
          <Maximize2 className="h-4 w-4" />
          <span>مشاهده ابعاد کامل</span>
        </button>
      </div>

      {/* تصاویر بندانگشتی (Thumbnails) */}
      {imageList.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {imageList.map((imgUrl, index) => {
            const isSelected = selectedImage === imgUrl;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative h-20 w-full overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 scale-95 shadow-sm"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${title} - تصویر ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* مودال لایت‌باکس بزرگنمایی */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage || imageList[0]}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
