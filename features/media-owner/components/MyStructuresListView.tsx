"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  PlusCircle,
  Edit3,
  Eye,
  Clock,
  CalendarCheck,
  MapPin,
  LayoutGrid,
  List,
  Loader2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import type { Structure } from "@/features/structures/types";
import { useMyStructures } from "@/features/structures/hooks/useStructures";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits } from "@/shared/lib/digits";

export default function MyStructuresListView() {
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // دریافت اطلاعات جلسه کاربر جهت گارد مجوز structure.view-own
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return { authenticated: false, user: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const user = sessionData?.user;
  const permissions: string[] = user?.permissions || [];
  const userRole = user?.role || "client";

  const hasPermission =
    permissions.includes("structure.view-own") ||
    userRole === "media_owner" ||
    userRole === "super_admin";

  const {
    data: pageData,
    isLoading: isStructuresLoading,
    isError,
    error,
    refetch,
  } = useMyStructures(page, perPage);

  const getStatusBadge = (status: Structure["status"], label?: string) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{label || "فعال و آماده اکران"}</span>
          </span>
        );
      case "booked":
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
            <CalendarCheck className="h-3 w-3" />
            <span>{label || "رزرو شده"}</span>
          </span>
        );
      case "locked":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            <Clock className="h-3 w-3" />
            <span>{label || "قفل موقت ۴۸ ساعته"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold">
            <span>{label || status || "نامشخص"}</span>
          </span>
        );
    }
  };

  // گارد مجوز
  if (!isSessionLoading && sessionData?.authenticated && !hasPermission) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-800 max-w-lg mx-auto my-12">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h3 className="text-base font-black mb-1">عدم دسترسی به سازه‌های مالک رسانه</h3>
        <p className="text-xs text-rose-600 mb-4 leading-relaxed">
          حساب کاربری شما دارای مجوز لازم (<code className="font-mono font-bold">structure.view-own</code>)
          برای مشاهده سازه‌های تحت مالکیت نیست. لطفاً با پشتیبانی یا مدیر سیستم تماس حاصل فرمایید.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    );
  }

  const structures = pageData?.items || [];
  const totalCount = pageData?.total ?? structures.length;
  const currentPage = pageData?.page ?? page;
  const lastPage = pageData?.lastPage ?? (pageData?.total ? Math.ceil(pageData.total / perPage) : 1);

  return (
    <div className="space-y-6">
      {/* هدر صفحه و دکمه شاخص ثبت سازه جدید */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-amber-600" />
            <span>مدیریت سازه‌های من (My Structures)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            مشاهده، بررسی وضعیت و ثبت سازه‌های تبلیغاتی جدید تحت مالکیت شما
          </p>
        </div>

        <Link
          href="/media-owner/structures/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-amber-700 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>ثبت سازه جدید</span>
        </Link>
      </div>

      {/* خلاصه تعداد و تغییر نحوه نمایش */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>تعداد کل سازه‌های شما:</span>
          <span className="font-sans text-sm text-amber-600">
            {toPersianDigits(totalCount)}
          </span>
          <span className="text-muted-foreground font-normal">سازه</span>
        </div>

        {/* سوئیچ گرید / جدول */}
        <div className="flex items-center rounded-xl border border-border bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="نمایش کارتی"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="نمایش جدولی"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* نمایش لودینگ */}
      {isStructuresLoading && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <span>در حال دریافت اطلاعات سازه‌های تحت مالکیت از سرور...</span>
        </div>
      )}

      {/* نمایش خطا بدون موک */}
      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-800">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
          <h3 className="font-bold text-sm mb-1">خطا در دریافت لیست سازه‌ها</h3>
          <p className="text-xs text-rose-600 mb-4 max-w-md mx-auto">
            {(error as Error)?.message || "ارتباط با سرور برقرار نشد. لطفاً مجدداً تلاش کنید."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            تلاش مجدد
          </button>
        </div>
      )}

      {/* لیست خالی */}
      {!isStructuresLoading && !isError && structures.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-3">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-bold text-foreground">هنوز هیچ سازه‌ای ثبت نکرده‌اید</h4>
          <p className="text-xs text-muted-foreground">
            برای افزودن بیلبورد، استرابورد یا تلویزیون شهری خود به سامانه، روی دکمه زیر کلیک کنید.
          </p>
          <div className="pt-2">
            <Link
              href="/media-owner/structures/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>ثبت اولین سازه</span>
            </Link>
          </div>
        </div>
      )}

      {/* نمایش داده‌ها */}
      {!isStructuresLoading && !isError && structures.length > 0 && (
        <>
          {viewMode === "grid" ? (
            /* نمایش کارتی (Card Grid) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {structures.map((structure) => {
                const mainImage =
                  (Array.isArray(structure.images) && structure.images.length > 0 && structure.images[0]) ||
                  structure.image ||
                  (typeof structure.images === "object" && (structure.images as { day?: string })?.day) ||
                  null;

                const typeName =
                  typeof structure.type === "object" && structure.type?.name
                    ? structure.type.name
                    : "سازه تبلیغاتی";

                const cityName =
                  typeof structure.city === "string"
                    ? structure.city
                    : (structure.city as { name?: string })?.name || structure.location?.city || "";

                const priceRial = structure.price ?? 0;

                return (
                  <div
                    key={structure.id}
                    className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* تصویر و بج وضعیت */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={structure.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <MapPin className="h-8 w-8 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* بج وضعیت */}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(structure.status, structure.statusLabel)}
                      </div>

                      {/* شناسه و نوع سازه */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                        <span className="font-mono bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold">
                          {structure.code || `#${structure.id}`}
                        </span>
                        <span className="rounded bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold">
                          {typeName}
                        </span>
                      </div>
                    </div>

                    {/* محتوای متنی کارت */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-foreground line-clamp-1">
                          {structure.title}
                        </h3>

                        {(structure.address || cityName) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>
                              {cityName ? `${cityName} - ` : ""}
                              {structure.address || ""}
                            </span>
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-muted-foreground">تعرفه ماهانه اکران:</span>
                          <strong className="text-amber-700 font-sans font-bold">
                            {priceRial > 0 ? formatToman(priceRial) : "تعیین نشده"}
                          </strong>
                        </div>
                      </div>

                      {/* دکمه‌های اقدام سریع */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                        <Link
                          href={`/structures/${structure.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-foreground p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>پیش‌نمایش</span>
                        </Link>

                        <Link
                          href={`/media-owner/structures/${structure.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>ویرایش سازه</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* نمایش جدولی (Table View) */
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-border text-slate-600 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">سازه تبلیغاتی</th>
                      <th className="py-3.5 px-4">نوع</th>
                      <th className="py-3.5 px-4">تعرفه ماهانه (تومان)</th>
                      <th className="py-3.5 px-4">وضعیت</th>
                      <th className="py-3.5 px-4 text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-slate-700">
                    {structures.map((structure) => {
                      const mainImage =
                        (Array.isArray(structure.images) && structure.images.length > 0 && structure.images[0]) ||
                        structure.image ||
                        null;

                      const typeName =
                        typeof structure.type === "object" && structure.type?.name
                          ? structure.type.name
                          : "سازه تبلیغاتی";

                      const priceRial = structure.price ?? 0;

                      return (
                        <tr key={structure.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {mainImage ? (
                                  <Image
                                    src={mainImage}
                                    alt={structure.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-foreground line-clamp-1">
                                  {structure.title}
                                </div>
                                <div className="font-mono text-[11px] text-muted-foreground">
                                  {structure.code || `#${structure.id}`} • {structure.address || "آدرس ثبت نشده"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold">{typeName}</td>

                          <td className="py-3.5 px-4 font-black font-sans text-amber-700">
                            {priceRial > 0 ? formatToman(priceRial) : "تعیین نشده"}
                          </td>

                          <td className="py-3.5 px-4">
                            {getStatusBadge(structure.status, structure.statusLabel)}
                          </td>

                          <td className="py-3.5 px-4 text-left">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/structures/${structure.id}`}
                                target="_blank"
                                className="p-1.5 text-slate-500 hover:text-foreground rounded-lg hover:bg-slate-100"
                                title="مشاهده پیش‌نمایش"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/media-owner/structures/${structure.id}/edit`}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>ویرایش</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* کنترل صفحه‌بندی سروری */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                صفحه {toPersianDigits(currentPage)} از {toPersianDigits(lastPage)} (مجموع{" "}
                {toPersianDigits(totalCount)} سازه)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>صفحه قبل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                  disabled={currentPage >= lastPage}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>صفحه بعد</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
