"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { useStructures } from "../hooks/useStructures";
import { formatToman } from "@/shared/lib/money";

export default function LandingShowcase() {
  const { data, isLoading, isError, refetch } = useStructures({ per_page: 6 });

  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">سازه‌های منتخب آماده اکران</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              سریع‌ترین دسترسی به پرمخاطب‌ترین تابلوها و سازه‌های تبلیغاتی سراسر کشور
            </p>
          </div>
          <Link
            href="/structures"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5"
          >
            <span>همه سازه‌ها</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* حالت لودینگ */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-background overflow-hidden animate-pulse shadow-sm"
              >
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded-md w-1/3" />
                  <div className="h-5 bg-muted rounded-md w-3/4" />
                  <div className="h-4 bg-muted rounded-md w-1/2" />
                </div>
                <div className="border-t border-border p-4 flex justify-between items-center">
                  <div className="h-5 bg-muted rounded-md w-1/3" />
                  <div className="h-8 bg-muted rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* حالت خطا (بدون هرگونه فال‌بک موک) */}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-800">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
            <h3 className="font-bold text-base mb-1">خطا در بارگذاری سازه‌های منتخب</h3>
            <p className="text-sm text-rose-600 mb-4 max-w-md mx-auto">
              امکان ارتباط با سرور سازه‌ها برقرار نشد. لطفاً از اتصال سرور اطمینان حاصل فرمایید.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              تلاش مجدد
            </button>
          </div>
        )}

        {/* لیست سازه‌ها */}
        {!isLoading && !isError && data?.items && (
          <>
            {data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <MapPin className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm">هیچ سازه‌ای برای نمایش یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((item) => {
                  const mainImage =
                    (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) ||
                    item.image ||
                    null;

                  const typeName =
                    typeof item.type === "object" && item.type?.name
                      ? item.type.name
                      : "سازه تبلیغاتی";

                  const cityName =
                    typeof item.city === "string"
                      ? item.city
                      : (item.city as { name?: string })?.name || item.location?.city || "";

                  const priceRial = item.price ?? 0;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div>
                        {/* جایگاه تصویر سازه */}
                        <div className="relative h-48 w-full bg-muted flex items-center justify-center border-b border-border overflow-hidden">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <MapPin className="h-10 w-10 text-muted-foreground/30" />
                          )}

                          <div className="absolute top-3 right-3">
                            {item.status === "available" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                آماده رزرو
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                                <Clock className="h-3 w-3" />
                                {item.statusLabel || "در حال اکران"}
                              </span>
                            )}
                          </div>

                          <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
                            {typeName}
                          </span>
                        </div>

                        {/* اطلاعات کارت */}
                        <div className="p-5">
                          {cityName && (
                            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{cityName}</span>
                            </div>
                          )}
                          <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            <Link href={`/structures/${item.id}`}>{item.title}</Link>
                          </h3>
                          {item.address && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                              {item.address}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* قیمت و دکمه اقدام */}
                      <div className="border-t border-border bg-muted/30 px-5 py-4 flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] text-muted-foreground">تعرفه ماهانه اکران:</span>
                          <span className="text-base font-extrabold text-foreground">
                            {priceRial > 0 ? (
                              formatToman(priceRial)
                            ) : (
                              "تماس بگیرید"
                            )}
                          </span>
                        </div>
                        <Link
                          href={`/structures/${item.id}`}
                          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          مشاهده و رزرو
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
