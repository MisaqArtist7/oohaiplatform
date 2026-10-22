"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  PlusCircle,
  Search,
  Edit3,
  Eye,
  Clock,
  CalendarCheck,
  MapPin,
  LayoutGrid,
  List,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Structure } from "@/types/structure";
import { fetchMyStructures } from "@/lib/media-owner-api";
import { formatToman, toPersianDigits, getMyStructuresList } from "@/lib/mock-data";

export default function MyStructuresListView() {
  const [structures, setStructures] = useState<Structure[]>(getMyStructuresList());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        setLoading(true);
        const data = await fetchMyStructures();
        if (!ignore && data.length > 0) {
          setStructures(data);
        }
      } catch (err) {
        console.error("Failed to load my structures:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // فیلتر کردن سازه‌ها
  const filteredStructures = structures.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType =
      typeFilter === "all" ||
      item.type.id === typeFilter ||
      item.type.slug === typeFilter;

    const matchStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  // محاسبه آمارها
  const totalCount = structures.length;
  const availableCount = structures.filter((s) => s.status === "available").length;
  const bookedCount = structures.filter((s) => s.status === "booked").length;
  const pendingCount = structures.filter(
    (s) => s.status === "pending_review" || s.status === "reserved"
  ).length;

  const getStatusBadge = (status: Structure["status"], label: string) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{label || "فعال و آماده اکران"}</span>
          </span>
        );
      case "booked":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
            <CalendarCheck className="h-3 w-3" />
            <span>{label || "در حال اکران / رزرو"}</span>
          </span>
        );
      case "pending_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            <Clock className="h-3 w-3" />
            <span>{label || "در انتظار تایید"}</span>
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
            <span>{label || "قفل موقت مشتری"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold">
            <span>{label || status}</span>
          </span>
        );
    }
  };

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
            مشاهده، ویرایش وضعیت، تنظیم قیمت‌های پایه و ثبت سازه‌های تبلیغاتی جدید تحت مالکیت شما
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

      {/* کارت‌های خلاصه وضعیت و شاخص‌های آماری (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs space-y-1">
          <div className="text-xs text-muted-foreground font-bold">کل سازه‌ها</div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-sans">
            {toPersianDigits(totalCount)} <span className="text-xs font-normal text-muted-foreground">سازه</span>
          </div>
          <div className="text-[11px] text-slate-500">تحت مدیریت کانون آوای رسانه</div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs space-y-1">
          <div className="text-xs text-emerald-800 font-bold">فعال و آماده اکران</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-sans">
            {toPersianDigits(availableCount)} <span className="text-xs font-normal text-emerald-600">سازه</span>
          </div>
          <div className="text-[11px] text-emerald-700">قابل رزرو مستقیم در پلتفرم</div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-2xs space-y-1">
          <div className="text-xs text-indigo-800 font-bold">در حال اکران (رزرو شده)</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 font-sans">
            {toPersianDigits(bookedCount)} <span className="text-xs font-normal text-indigo-600">سازه</span>
          </div>
          <div className="text-[11px] text-indigo-700">دارای قرارداد رسمی معتبر</div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-2xs space-y-1">
          <div className="text-xs text-amber-800 font-bold">در انتظار بازبینی / قفل</div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-sans">
            {toPersianDigits(pendingCount)} <span className="text-xs font-normal text-amber-600">سازه</span>
          </div>
          <div className="text-[11px] text-amber-700">استعلام مدارک یا پیش‌فاکتور</div>
        </div>
      </div>

      {/* نوار جستجو، فیلترها و تغییر حالت نمایش */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* اینپوت جستجو */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام سازه، کد، بزرگراه یا منطقه..."
            className="w-full rounded-xl border border-border bg-slate-50 pr-9.5 pl-3.5 py-2 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* فیلتر نوع و وضعیت سازه */}
        <div className="flex flex-wrap items-center gap-2">
          {/* فیلتر نوع */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
          >
            <option value="all">همه انواع سازه‌ها</option>
            <option value="billboard">بیلبورد</option>
            <option value="bridge">عرشه پل</option>
            <option value="straboard">استرابورد</option>
            <option value="urban_tv">تلویزیون شهری</option>
            <option value="lamppost">لمپوست</option>
          </select>

          {/* فیلتر وضعیت */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="available">فعال و آماده اکران</option>
            <option value="booked">در حال اکران (رزرو شده)</option>
            <option value="pending_review">در انتظار تایید</option>
          </select>

          {/* سوئیچ گرید / جدول */}
          <div className="hidden sm:flex items-center rounded-xl border border-border bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
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
              className={`p-1.5 rounded-lg text-xs transition-colors ${
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
      </div>

      {/* نمایش لیست یا گرید سازه‌ها */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <span>در حال دریافت اطلاعات سازه‌های تحت مالکیت...</span>
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-3">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-bold text-foreground">سازه‌ای با این فیلترها یافت نشد</h4>
          <p className="text-xs text-muted-foreground">
            می‌توانید فیلترها را ریست کنید یا سازه جدیدی در سامانه ثبت نمایید.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              پاک کردن فیلترها
            </button>
            <Link
              href="/media-owner/structures/new"
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              ثبت اولین سازه
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* نمایش کارتی (Card Grid) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStructures.map((structure) => (
            <div
              key={structure.id}
              className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* تصویر و بج وضعیت */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={structure.images.day || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"}
                  alt={structure.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                {/* بج وضعیت */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(structure.status, structure.statusLabel)}
                </div>

                {/* کد و نوع سازه */}
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                  <span className="font-mono bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold">
                    {structure.code}
                  </span>
                  <span className="rounded bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold">
                    {structure.type.name}
                  </span>
                </div>
              </div>

              {/* محتوای متنی کارت */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">
                    {structure.title}
                  </h3>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{structure.location.district} - {structure.location.address}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">ابعاد و مساحت:</span>
                      <strong className="text-slate-800">{structure.dimensions.label}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">تعرفه ماهانه:</span>
                      <strong className="text-amber-700 font-sans">
                        {formatToman(structure.pricing.basePriceMonthly)}
                      </strong>
                    </div>
                  </div>

                  {structure.targetAudience && structure.targetAudience.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {structure.targetAudience.slice(0, 2).map((aud, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px]"
                        >
                          {aud}
                        </span>
                      ))}
                      {structure.targetAudience.length > 2 && (
                        <span className="rounded-md bg-slate-100 text-slate-500 px-1.5 py-0.5 text-[10px]">
                          +{toPersianDigits(structure.targetAudience.length - 2)}
                        </span>
                      )}
                    </div>
                  )}
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
          ))}
        </div>
      ) : (
        /* نمایش جدولی (Table View) */
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-border text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-4">سازه تبلیغاتی</th>
                  <th className="py-3.5 px-4">نوع و دسته‌بندی</th>
                  <th className="py-3.5 px-4">ابعاد</th>
                  <th className="py-3.5 px-4">قیمت پایه ماهانه</th>
                  <th className="py-3.5 px-4">وضعیت جاری</th>
                  <th className="py-3.5 px-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-slate-700">
                {filteredStructures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <Image
                            src={structure.images.day || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"}
                            alt={structure.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-foreground line-clamp-1">
                            {structure.title}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {structure.code} • {structure.location.district}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <div>{structure.type.name}</div>
                      <div className="text-[11px] text-muted-foreground font-normal">
                        {structure.category.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium">
                      {structure.dimensions.label}
                    </td>

                    <td className="py-3.5 px-4 font-black font-sans text-amber-700">
                      {formatToman(structure.pricing.basePriceMonthly)}
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
                          title="مشاهده در کاوشگر نقشه"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
