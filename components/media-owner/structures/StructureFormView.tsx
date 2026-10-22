"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  ArrowRight,
  MapPin,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
  Info,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { StructureStatus } from "@/types/structure";
import {
  fetchStructureForEdit,
  submitCreateStructure,
  submitUpdateStructure,
} from "@/lib/media-owner-api";
import {
  formatToman,
  toPersianDigits,
  mockStructureTypes,
  mockStructureCategories,
} from "@/lib/mock-data";

interface StructureFormViewProps {
  structureId?: string; // اگر ارسال شود حالت ویرایش است
}

export default function StructureFormView({
  structureId,
}: StructureFormViewProps) {
  const router = useRouter();
  const isEditMode = Boolean(structureId);

  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // فیلدهای فرم
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [typeId, setTypeId] = useState("billboard");
  const [categoryId, setCategoryId] = useState("highway");
  const [status, setStatus] = useState<StructureStatus>("available");

  // ابعاد و مساحت
  const [width, setWidth] = useState<number>(15);
  const [height, setHeight] = useState<number>(5);

  // قیمت پایه
  const [basePrice, setBasePrice] = useState<number>(250000000);

  // موقعیت مکانی
  const [district, setDistrict] = useState("منطقه ۳ تهران");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number>(35.7538);
  const [lng, setLng] = useState<number>(51.4172);

  // نوع مخاطبان
  const allAudienceOptions = [
    "رانندگان و مسافران بزرگراهی",
    "قشر تجاری، مدیران و اداری",
    "خانواده‌ها و شهروندان",
    "جوانان و دانشجویان",
    "خریداران خرد و اصناف",
    "مشتریان کالاهای لوکس و طلا",
    "پزشکان و خدمات درمانی",
  ];
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([
    "رانندگان و مسافران بزرگراهی",
    "قشر تجاری، مدیران و اداری",
  ]);

  // گالری تصاویر (تا ۱۰ عکس)
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // توضیحات
  const [description, setDescription] = useState("");

  // نقاط پرتردد پیش‌فرض جهت انتخاب سریع روی نقشه
  const tehranPresets = [
    { name: "مدرس - میرداماد", lat: 35.7584, lng: 51.4192, district: "منطقه ۳ تهران" },
    { name: "همت - ستاری", lat: 35.7485, lng: 51.3112, district: "منطقه ۵ تهران" },
    { name: "پل صدر - پاسداران", lat: 35.7762, lng: 51.4589, district: "منطقه ۱ تهران" },
    { name: "ولیعصر - پارک ملت", lat: 35.7725, lng: 51.4125, district: "منطقه ۳ تهران" },
    { name: "اندرزگو - قیطریه", lat: 35.7952, lng: 51.4468, district: "منطقه ۱ تهران" },
    { name: "حکیم - اشرفی اصفهانی", lat: 35.7365, lng: 51.3289, district: "منطقه ۲ تهران" },
  ];

  // لود اطلاعات اولیه در حالت ادیت
  useEffect(() => {
    if (!structureId) return;

    let ignore = false;
    async function loadData() {
      try {
        setLoadingInitial(true);
        const data = await fetchStructureForEdit(structureId!);
        if (!ignore && data) {
          setTitle(data.title);
          setCode(data.code);
          setTypeId(data.type?.id || data.type?.slug || "billboard");
          setCategoryId(data.category?.id || data.category?.slug || "highway");
          setStatus(data.status || "available");
          setWidth(data.dimensions.width);
          setHeight(data.dimensions.height);
          setBasePrice(data.pricing.basePriceMonthly);
          setDistrict(data.location.district);
          setAddress(data.location.address);
          setLat(data.location.lat);
          setLng(data.location.lng);
          setDescription(data.description || "");

          if (data.targetAudience && data.targetAudience.length > 0) {
            setSelectedAudiences(data.targetAudience);
          }

          if (data.images.gallery && data.images.gallery.length > 0) {
            setGalleryImages(data.images.gallery);
          }
        }
      } catch (err) {
        console.error("Failed to load structure for edit:", err);
      } finally {
        if (!ignore) setLoadingInitial(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [structureId]);

  // تاگل انتخاب مخاطب
  const toggleAudience = (aud: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(aud) ? prev.filter((a) => a !== aud) : [...prev, aud]
    );
  };

  // افزودن تصویر از لینک
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (galleryImages.length >= 10) {
      setFormErrors((prev) => ({
        ...prev,
        images: "حداکثر ۱۰ تصویر می‌توانید بارگذاری نمایید.",
      }));
      return;
    }
    setGalleryImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  // حذف عکس از گالری
  const removeImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // افزودن تصاویر نمونه پیش‌فرض جهت تست سریع
  const handleAddSampleImages = () => {
    const samples = [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    ];
    setGalleryImages(samples);
  };

  // کلیک روی نقشه تعاملی
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // نگاشت پیکسل‌ها به مختصات تقریبی تهران (Lat: 35.68 to 35.80, Lng: 51.30 to 51.50)
    const normX = x / rect.width;
    const normY = y / rect.height;

    const newLng = Number((51.28 + normX * 0.24).toFixed(4));
    const newLat = Number((35.82 - normY * 0.16).toFixed(4));

    setLat(newLat);
    setLng(newLng);
  };

  // اعتبارسنجی فرم
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 5) {
      errs.title = "عنوان سازه باید حداقل ۵ کاراکتر باشد.";
    }

    if (!width || width <= 0) {
      errs.width = "عرض سازه باید بزرگتر از صفر باشد.";
    }

    if (!height || height <= 0) {
      errs.height = "ارتفاع سازه باید بزرگتر از صفر باشد.";
    }

    if (!basePrice || basePrice < 10000000) {
      errs.basePrice = "تعرفه ماهانه باید حداقل ۱۰ میلیون تومان باشد.";
    }

    if (!address.trim() || address.trim().length < 8) {
      errs.address = "آدرس دقیق سازه را وارد نمایید (حداقل ۸ کاراکتر).";
    }

    if (galleryImages.length === 0) {
      errs.images = "حداقل یک تصویر برای معرفی سازه لازم است.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ذخیره فرم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormErrors({});

    const payload = {
      title: title.trim(),
      code: code.trim() || undefined,
      typeId,
      categoryId,
      status,
      basePrice,
      width,
      height,
      lat,
      lng,
      address: address.trim(),
      district: district.trim(),
      description: description.trim(),
      targetAudience: selectedAudiences,
      galleryImages,
    };

    try {
      if (isEditMode && structureId) {
        await submitUpdateStructure(structureId, payload);
        setSuccessMessage("تغییرات سازه تبلیغاتی با موفقیت ذخیره شد.");
      } else {
        await submitCreateStructure(payload);
        setSuccessMessage("سازه تبلیغاتی جدید با موفقیت ایجاد و منتشر گردید.");
      }

      setTimeout(() => {
        router.push("/media-owner/structures");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور";
      setFormErrors({ form: msg });
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="rounded-2xl border border-border bg-white p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
        <span>در حال فراخوانی مشخصات سازه...</span>
      </div>
    );
  }

  const calculatedArea = width * height;

  return (
    <div className="space-y-6">
      {/* هدر فرم و بازگشت */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/media-owner/structures"
              className="hover:text-foreground flex items-center gap-1 font-bold"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>بازگشت به سازه‌های من</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-bold">
              {isEditMode ? "ویرایش سازه" : "ثبت سازه جدید"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-amber-600" />
            <span>
              {isEditMode
                ? `ویرایش سازه: ${title || code || structureId}`
                : "ثبت سازه تبلیغاتی جدید در سامانه"}
            </span>
          </h2>
        </div>

        {code && (
          <span className="self-start sm:self-auto font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            کد: {code}
          </span>
        )}
      </div>

      {/* پیام موفقیت */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in duration-200 font-bold">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage} (در حال انتقال به لیست سازه‌ها...)</span>
        </div>
      )}

      {/* پیام خطای عمومی فرم */}
      {formErrors.form && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{formErrors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ستون اصلی: مشخصات عمومی و فنی سازه */}
          <div className="lg:col-span-8 space-y-6">
            {/* ۱. اطلاعات پایه و شناسنامه سازه */}
            <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-slate-100">
                <Info className="h-4 w-4 text-amber-600" />
                <span>مشخصات پایه و شناسنامه سازه</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* عنوان سازه */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    عنوان کامل و نام تجاری سازه: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: بیلبورد اتوبان همت - بعد از تقاطع باکری به سمت غرب"
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none transition-colors"
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* کد اختصاصی سازه */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    کد شناسایی تابلو (اختیاری):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="مثال: TH-HEM-109"
                    className="w-full text-right font-mono rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                {/* نوع سازه */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    نوع فیزیکی سازه:
                  </label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none transition-colors"
                  >
                    {mockStructureTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* دسته‌بندی معبر */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    دسته‌بندی محیطی / معبر:
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none transition-colors"
                  >
                    {mockStructureCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* وضعیت اکران */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    وضعیت دسترسی در سامانه:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StructureStatus)}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="available">فعال و آماده اکران (Available)</option>
                    <option value="booked">در حال اکران / رزرو شده (Booked)</option>
                    <option value="pending_review">در انتظار تایید مدارک (Pending)</option>
                  </select>
                </div>
              </div>

              {/* ابعاد و مساحت خودکار */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-foreground mb-2">
                  ابعاد فیزیکی بنر / سازه:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">عرض (متر):</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs font-bold text-foreground focus:border-amber-600 focus:bg-white focus:outline-none font-mono"
                    />
                    {formErrors.width && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.width}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">ارتفاع (متر):</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs font-bold text-foreground focus:border-amber-600 focus:bg-white focus:outline-none font-mono"
                    />
                    {formErrors.height && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.height}</p>
                    )}
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-center">
                    <span className="text-[11px] text-amber-800 block">مساحت تابلو:</span>
                    <span className="text-sm font-black text-amber-900 font-mono">
                      {toPersianDigits(calculatedArea)} متر مربع
                    </span>
                  </div>
                </div>
              </div>

              {/* قیمت پایه ماهانه */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-foreground">
                    تعرفه پایه ماهانه اکران (تومان): <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-black text-amber-700 font-sans">
                    {formatToman(basePrice)}
                  </span>
                </div>
                <input
                  type="number"
                  step="5000000"
                  min="10000000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none font-mono"
                />
                {formErrors.basePrice && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.basePrice}</p>
                )}
              </div>
            </div>

            {/* ۲. بخش موقعیت مکانی و نقشه تعاملی (Interactive Map Picker) */}
            <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <span>موقعیت مکانی و پین هوشمند روی نقشه</span>
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  برای تغییر پین، روی نقشه کلیک نمایید
                </span>
              </div>

              {/* دکمه‌های پیش‌فرض مناطق پرتردد تهران */}
              <div>
                <span className="text-[11px] text-muted-foreground block mb-1.5">
                  انتخاب سریع از شاهراه‌های کلیدی تهران:
                </span>
                <div className="flex flex-wrap gap-2">
                  {tehranPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setLat(preset.lat);
                        setLng(preset.lng);
                        setDistrict(preset.district);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                        lat === preset.lat && lng === preset.lng
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* نقشه تعاملی با قابلیت کلیک جهت تعیین دقیق مختصات */}
              <div
                onClick={handleMapClick}
                className="relative h-64 w-full rounded-2xl border border-slate-300 bg-slate-900 overflow-hidden cursor-crosshair group shadow-inner select-none"
                title="برای جابجایی پین روی نقشه کلیک کنید"
              >
                {/* پس‌زمینه شبکه و بزرگراه‌های فرضی نقشه تهران */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]" />

                {/* خطوط بزرگراه‌ها روی نقشه شبیه‌سازی‌شده */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <line x1="0" y1="120" x2="100%" y2="120" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="0" y1="190" x2="100%" y2="190" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="320" y1="0" x2="320" y2="100%" stroke="#10b981" strokeWidth="4" />
                  <line x1="160" y1="0" x2="160" y2="100%" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="320" cy="120" r="10" fill="#f59e0b" fillOpacity="0.5" />
                </svg>

                {/* برچسب‌های راهنما روی نقشه */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-bold pointer-events-none">
                  نقشه تعاملی انتخاب لوکیشن سازه
                </div>

                <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none">
                  Lat: {lat.toFixed(4)} | Lng: {lng.toFixed(4)}
                </div>

                {/* پین متحرک بر اساس مختصات */}
                {(() => {
                  // تبدیل مختصات به درصد صفحه
                  const leftPercent = Math.max(
                    5,
                    Math.min(95, ((lng - 51.28) / 0.24) * 100)
                  );
                  const topPercent = Math.max(
                    5,
                    Math.min(95, ((35.82 - lat) / 0.16) * 100)
                  );

                  return (
                    <div
                      style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                      className="absolute -translate-x-1/2 -translate-y-full transition-all duration-200 pointer-events-none flex flex-col items-center"
                    >
                      <div className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap mb-1">
                        {title || "موقعیت سازه شما"}
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-600 text-white shadow-xl ring-4 ring-amber-400/40 animate-bounce">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    </div>
                  );
                })()}

                {/* هینت پایین نقشه */}
                <div className="absolute bottom-2 right-3 left-3 text-center text-[10px] text-white/70 bg-black/60 py-1 rounded-lg pointer-events-none">
                  روی هر نقطه از نقشه کلیک کنید تا پین و مختصات طول و عرض جغرافیایی بروزرسانی شود
                </div>
              </div>

              {/* اینپوت‌های مختصات و آدرس */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    عرض جغرافیایی (Latitude):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    طول جغرافیایی (Longitude):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    منطقه شهری یا شهرداری:
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: منطقه ۲ تهران"
                    className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    آدرس متنی و توصیفی دقیق موقعیت: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: بزرگراه همت غرب، ۳۰۰ متر مانده به تقاطع بزرگراه ستاری، روبه‌روی بوستان جوانمردان"
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                  {formErrors.address && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ۳. انتخاب جامعه مخاطبان هدف (Target Audience Selector) */}
            <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>نوع مخاطبان هدف سازه (Target Audience)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                مشخص کنید مخاطبان اصلی معبر و ترافیک مقابل این سازه چه کسانی هستند (کمک به پیشنهاد هوش مصنوعی کمپین‌ها):
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {allAudienceOptions.map((aud) => {
                  const isSelected = selectedAudiences.includes(aud);
                  return (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => toggleAudience(aud)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>{aud}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ۴. توضیحات تکمیلی و مزایای سازه */}
            <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-3">
              <label className="block text-xs font-bold text-foreground mb-1">
                توضیحات و ویژگی‌های دید سازه:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحاتی درباره زاویه تابش خورشید، عدم انسداد دید توسط درختان، وضعیت روشنایی شبانه و ساعات اوج تردد..."
                className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* ستون کناری: آپلودر چندگانه تصاویر و ثبت نهایی */}
          <div className="lg:col-span-4 space-y-6">
            {/* آپلودر تصاویر (تا ۱۰ عکس) */}
            <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-600" />
                  <span>تصاویر سازه (تا ۱۰ عکس)</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-700 font-sans">
                  {toPersianDigits(galleryImages.length)} از ۱۰
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground">
                تصاویر روز، شب و زاویه دید از فاصله دور به جذب سریع‌تر تبلیغ‌دهندگان کمک شایانی می‌کند.
              </p>

              {/* اینپوت درج سریع آدرس تصویر */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    dir="ltr"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... تصویر بنر"
                    className="flex-1 rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-foreground focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={galleryImages.length >= 10 || !newImageUrl.trim()}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    افزودن
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddSampleImages}
                  className="w-full text-center text-[11px] font-bold text-amber-700 hover:underline pt-1"
                >
                  افزودن نمونه تصاویر باکیفیت استاندارد OOHAI
                </button>
              </div>

              {formErrors.images && (
                <p className="text-[11px] text-rose-600">{formErrors.images}</p>
              )}

              {/* گالری تصاویر انتخاب‌شده */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-28"
                  >
                    <Image
                      src={img}
                      alt={`تصویر شماره ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                        title="حذف این تصویر"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="absolute bottom-1 right-1 rounded bg-black/60 text-white text-[9px] px-1.5 py-0.2">
                      عکس {toPersianDigits(idx + 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* کارت اقدام ذخیره سازه */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-2xs space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">
                  {isEditMode ? "بروزرسانی سازه" : "انتشار سازه در پلتفرم"}
                </h4>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  پس از ذخیره، سازه شما در کاوشگر نقشه و پیشنهادهای هوش مصنوعی OOHAI قرار خواهد گرفت.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-xs font-black text-white shadow-md hover:bg-amber-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ذخیره و ثبت اطلاعات سازه...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditMode ? "ذخیره تغییرات سازه" : "ذخیره و انتشار سازه"}</span>
                  </>
                )}
              </button>

              <Link
                href="/media-owner/structures"
                className="block text-center text-xs text-muted-foreground hover:underline"
              >
                انصراف و بازگشت
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
