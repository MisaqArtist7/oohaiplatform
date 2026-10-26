"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import {
  StructureStatus,
  structureFormSchema,
  StructureFormValues,
  useCreateStructureMutation,
  useUpdateStructureMutation,
} from "@/features/structures";
import {
  formatToman,
  mockStructureTypes,
} from "@/lib/mock-data";
import { fetchStructureForEdit } from "../api/media-owner.api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface StructureFormViewProps {
  structureId?: string;
}

export default function StructureFormView({ structureId }: StructureFormViewProps) {
  const router = useRouter();
  const isEditMode = Boolean(structureId);

  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [newImageUrl, setNewImageUrl] = useState("");

  const allAudienceOptions = [
    "رانندگان و مسافران بزرگراهی",
    "قشر تجاری، مدیران و اداری",
    "خانواده‌ها و شهروندان",
    "جوانان و دانشجویان",
    "خریداران خرد و اصناف",
    "مشتریان کالاهای لوکس و طلا",
    "پزشکان و خدمات درمانی",
  ];

  const tehranPresets = [
    { name: "مدرس - میرداماد", lat: 35.7584, lng: 51.4192, district: "منطقه ۳ تهران" },
    { name: "همت - ستاری", lat: 35.7485, lng: 51.3112, district: "منطقه ۵ تهران" },
    { name: "پل صدر - پاسداران", lat: 35.7762, lng: 51.4589, district: "منطقه ۱ تهران" },
    { name: "ولیعصر - پارک ملت", lat: 35.7725, lng: 51.4125, district: "منطقه ۳ تهران" },
    { name: "اندرزگو - قیطریه", lat: 35.7952, lng: 51.4468, district: "منطقه ۱ تهران" },
    { name: "حکیم - اشرفی اصفهانی", lat: 35.7365, lng: 51.3289, district: "منطقه ۲ تهران" },
  ];

  const createMutation = useCreateStructureMutation();
  const updateMutation = useUpdateStructureMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StructureFormValues>({
    resolver: zodResolver(structureFormSchema),
    defaultValues: {
      code: "",
      title: "",
      typeId: "billboard",
      categoryId: "highway",
      location: {
        province: "تهران",
        district: "منطقه ۳ تهران",
        address: "",
        lat: 35.7538,
        lng: 51.4172,
      },
      dimensions: {
        width: 15,
        height: 5,
        area: 75,
        label: "۱۵ × ۵ متر",
      },
      pricing: {
        dailyRate: 8300000,
        monthlyRate: 250000000,
        discountPercent: 5,
      },
      specs: {
        lighting: "پروژکتور SMD کم‌مصرف اختصاصی",
        facesCount: 1,
        minDurationDays: 15,
        dailyTraffic: 240000,
        targetAudience: "رانندگان و مسافران بزرگراهی",
      },
      images: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      ],
      isAvailable: true,
    },
  });

  const width = watch("dimensions.width") || 15;
  const height = watch("dimensions.height") || 5;
  const area = width * height;
  const galleryImages = watch("images") || [];
  const dailyRate = watch("pricing.dailyRate") || 0;
  const monthlyRate = dailyRate * 30;

  useEffect(() => {
    setValue("dimensions.area", area);
    setValue("dimensions.label", `${width} × ${height} متر`);
  }, [width, height, area, setValue]);

  // بارگذاری داده اولیه در حالت ادیت
  useEffect(() => {
    if (!structureId) return;

    let ignore = false;
    async function loadData() {
      try {
        setLoadingInitial(true);
        const data = await fetchStructureForEdit(structureId!);
        if (!ignore && data) {
          reset({
            code: data.code,
            title: data.title,
            typeId: data.type?.id || data.type?.slug || "billboard",
            categoryId: data.category?.id || data.category?.slug || "highway",
            location: {
              province: data.location?.province || data.location?.city || "تهران",
              district: data.location?.district || "منطقه ۳ تهران",
              address: data.location?.address || "",
              lat: data.location?.lat || 35.7538,
              lng: data.location?.lng || 51.4172,
            },
            dimensions: {
              width: data.dimensions?.width || 15,
              height: data.dimensions?.height || 5,
              area: (data.dimensions?.width || 15) * (data.dimensions?.height || 5),
              label: data.dimensions?.label || "۱۵ × ۵ متر",
            },
            pricing: {
              dailyRate: data.pricing?.dailyRate || 8300000,
              monthlyRate: data.pricing?.basePriceMonthly || 250000000,
              discountPercent: data.pricing?.discountMonthlyPercent || 5,
            },
            specs: {
              lighting: data.specs?.lighting || "پروژکتور SMD",
              facesCount: data.specs?.isTwoSided ? 2 : 1,
              minDurationDays: data.specs?.minDurationDays || 15,
              dailyTraffic: 250000,
              targetAudience: "عمومی",
            },
            images: [
              data.images?.day,
              data.images?.night,
              ...(data.images?.gallery || []),
            ].filter(Boolean) as string[],
            isAvailable: data.status === "available",
          });
        }
      } catch (err) {
        console.error("Error loading structure for edit:", err);
        toast.error("خطا در بارگذاری اطلاعات سازه برای ویرایش");
      } finally {
        if (!ignore) setLoadingInitial(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [structureId, reset]);

  // اضافه کردن عکس جدید به گالری
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl.trim());
      if (galleryImages.length >= 10) {
        toast.error("حداکثر ۱۰ تصویر برای هر سازه مجاز می‌باشد.");
        return;
      }
      setValue("images", [...galleryImages, newImageUrl.trim()]);
      setNewImageUrl("");
      toast.success("تصویر با موفقیت به گالری افزوده شد.");
    } catch {
      toast.error("لطفاً یک پیوند اینترنتی معتبر وارد فرمایید.");
    }
  };

  const handleRemoveImage = (index: number) => {
    if (galleryImages.length <= 1) {
      toast.error("حداقل یک تصویر برای هر سازه الزامی است.");
      return;
    }
    const updated = galleryImages.filter((_, i) => i !== index);
    setValue("images", updated);
  };

  const onSubmit = async (values: StructureFormValues) => {
    try {
      if (isEditMode && structureId) {
        await updateMutation.mutateAsync({ id: structureId, data: values });
        toast.success("سازه تبلیغاتی با موفقیت ویرایش و بروزرسانی گردید.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("سازه تبلیغاتی با موفقیت ثبت شد و در صف انتشار قرار گرفت.");
      }
      setTimeout(() => {
        router.push("/media-owner/structures");
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطایی در ذخیره سازه رخ داد.";
      toast.error(msg);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">
          در حال بارگذاری اطلاعات پرونده سازه...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      {/* هدر صفحه فرم */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/media-owner/structures"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <span>{isEditMode ? "ویرایش و بروزرسانی مشخصات سازه" : "ثبت و تعریف سازه تبلیغاتی جدید"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
              اطلاعات مکان‌محور، ابعاد، گالری تصاویر و نرخ اکران روزانه بیلبورد را وارد نمایید.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/media-owner/structures"
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            انصراف
          </Link>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="gap-2"
          >
            {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditMode ? "بروزرسانی تغییرات سازه" : "ثبت و انتشار سازه"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ۱. کارت اطلاعات پایه و کدینگ */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span>اطلاعات پایه و شناسه سازه</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                عنوان و نام معرف سازه *
              </label>
              <Input
                placeholder="مثال: بیلبورد اتوبان همت - بعد از تقاطع باکری"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-[11px] text-destructive font-bold mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                کد اختصاصی سازه *
              </label>
              <Input
                dir="ltr"
                placeholder="TH-HEM-109"
                {...register("code")}
                className="font-mono text-left"
              />
              {errors.code && (
                <p className="text-[11px] text-destructive font-bold mt-1">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                نوع سازه تبلیغاتی *
              </label>
              <select
                {...register("typeId")}
                className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {mockStructureTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ۲. کارت ابعاد، مساحت و نورپردازی */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>مشخصات فنی، ابعاد و نورپردازی</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                عرض تابلو (متر) *
              </label>
              <Input
                type="number"
                step="0.5"
                {...register("dimensions.width", { valueAsNumber: true })}
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                ارتفاع تابلو (متر) *
              </label>
              <Input
                type="number"
                step="0.5"
                {...register("dimensions.height", { valueAsNumber: true })}
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                مساحت کل اکران
              </label>
              <div className="flex h-10 items-center justify-between rounded-xl bg-muted px-3.5 text-xs font-bold text-foreground">
                <span>{area} متر مربع</span>
                <span className="text-[10px] text-muted-foreground">خودکار</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                سیستم نورپردازی *
              </label>
              <Input
                placeholder="مثال: پروژکتور SMD کم‌مصرف"
                {...register("specs.lighting")}
              />
            </div>
          </div>
        </Card>

        {/* ۳. کارت تعرفه و قیمت‌گذاری */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Save className="h-4 w-4 text-emerald-600" />
            <span>تعرفه مالی و بازه اکران</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                نرخ اکران روزانه (تومان) *
              </label>
              <Input
                type="number"
                step="100000"
                {...register("pricing.dailyRate", { valueAsNumber: true })}
                className="font-mono"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                معادل ماهانه: {formatToman(monthlyRate)}
              </span>
              {errors.pricing?.dailyRate && (
                <p className="text-[11px] text-destructive font-bold mt-1">
                  {errors.pricing.dailyRate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                حداقل روزهای سفارش *
              </label>
              <Input
                type="number"
                {...register("specs.minDurationDays", { valueAsNumber: true })}
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                تخفیف کمپین بلندمدت (درصد)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                {...register("pricing.discountPercent", { valueAsNumber: true })}
                className="font-mono"
              />
            </div>
          </div>
        </Card>

        {/* ۴. کارت موقعیت مکانی و آدرس */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>موقعیت جغرافیایی و آدرس دقیق</span>
          </h3>

          {/* نقاط پرتردد پیش‌فرض */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground block mb-2">
              نقاط پرتردد پیش‌فرض تهران (انتخاب سریع مختصات):
            </span>
            <div className="flex flex-wrap gap-2">
              {tehranPresets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => {
                    setValue("location.lat", p.lat);
                    setValue("location.lng", p.lng);
                    setValue("location.district", p.district);
                    toast.info(`مختصات ${p.name} روی فرم ثبت گردید.`);
                  }}
                  className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                منطقه / شهرداری *
              </label>
              <Input {...register("location.district")} />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                عرض جغرافیایی (Latitude) *
              </label>
              <Input
                type="number"
                step="0.0001"
                {...register("location.lat", { valueAsNumber: true })}
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                طول جغرافیایی (Longitude) *
              </label>
              <Input
                type="number"
                step="0.0001"
                {...register("location.lng", { valueAsNumber: true })}
                className="font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-foreground mb-1">
                نشانی دقیق و موقعیت دید ترافیکی *
              </label>
              <Input
                placeholder="بزرگراه شهید همت، ۵۰۰ متر قبل از خروجی ستاری، دید از غرب به شرق"
                {...register("location.address")}
              />
              {errors.location?.address && (
                <p className="text-[11px] text-destructive font-bold mt-1">
                  {errors.location.address.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ۵. گالری تصاویر سازه (تا ۱۰ عکس) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span>گالری تصاویر سازه (تا ۱۰ تصویر با کیفیت)</span>
            </h3>
            <Badge variant="secondary">
              {galleryImages.length} از ۱۰ تصویر
            </Badge>
          </div>

          <div className="flex gap-2">
            <Input
              dir="ltr"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="text-left font-mono text-xs"
            />
            <Button
              type="button"
              onClick={handleAddImage}
              className="shrink-0 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>افزودن عکس</span>
            </Button>
          </div>

          {errors.images && (
            <p className="text-[11px] text-destructive font-bold">
              {errors.images.message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 pt-2">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative aspect-video rounded-xl overflow-hidden border border-border bg-muted"
              >
                <img
                  src={imgUrl}
                  alt={`تصویر سازه ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 left-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  title="حذف تصویر"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    تصویر شاخص
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* دکمه‌های فوتر فرم */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            href="/media-owner/structures"
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            انصراف
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="px-8 h-11 text-sm font-black gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{isEditMode ? "ذخیره نهایی تغییرات سازه" : "ثبت و انتشار سازه تبلیغاتی"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
