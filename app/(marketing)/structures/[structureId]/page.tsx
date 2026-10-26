import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Clock,
  Share2,
  Bookmark,
  Layers,
  ArrowRight,
} from "lucide-react";
import { mockStructures } from "@/lib/mock-data";
import {
  StructureGallery,
  StructureSpecs,
  MiniMapLocation,
  StructureCard,
} from "@/features/structures";
import { BookingSidebar } from "@/features/bookings";

interface StructureDetailPageProps {
  params: Promise<{
    structureId: string;
  }>;
}



export function generateStaticParams() {
  return mockStructures.map((s) => ({
    structureId: s.id,
  }));
}

export async function generateMetadata({
  params,
}: StructureDetailPageProps): Promise<Metadata> {
  const { structureId } = await params;
  const structure = mockStructures.find(
    (s) =>
      s.id.toLowerCase() === structureId.toLowerCase() ||
      s.code.toLowerCase() === structureId.toLowerCase() ||
      s.slug.toLowerCase() === structureId.toLowerCase()
  );

  if (!structure) {
    return {
      title: "سازه تبلیغاتی یافت نشد | بیلبورد مارکت",
    };
  }

  return {
    title: `${structure.title} (${structure.code})`,
    description: structure.description.slice(0, 160),
    openGraph: {
      title: structure.title,
      description: structure.description,
      images: [structure.images.day],
    },
  };
}

export default async function StructureDetailPage({
  params,
}: StructureDetailPageProps) {
  const { structureId } = await params;

  // جستجو در سازه‌ها بر اساس ID یا Code یا Slug
  const structure = mockStructures.find(
    (s) =>
      s.id.toLowerCase() === structureId.toLowerCase() ||
      s.code.toLowerCase() === structureId.toLowerCase() ||
      s.slug.toLowerCase() === structureId.toLowerCase()
  );

  if (!structure) {
    notFound();
  }

  // سازه‌های مشابه برای پیشنهاد به کاربر
  const similarStructures = mockStructures
    .filter((s) => s.id !== structure.id && s.category.id === structure.category.id)
    .slice(0, 2);

  const isAvailable = structure.status === "available";
  const isReserved = structure.status === "reserved";

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* نوار بردکرامب (Breadcrumbs) و اقدامات سریع بالای صفحه */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* بردکرامب */}
          <nav className="flex items-center gap-1.5 text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              صفحه اصلی
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link href="/structures" className="hover:text-primary transition-colors">
              کاوشگر سازه‌ها
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground max-w-xs sm:max-w-md truncate">
              {structure.title}
            </span>
          </nav>

          {/* بازگشت به کاوشگر */}
          <div className="flex items-center gap-3">
            <Link
              href="/structures"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>بازگشت به نقشه و فهرست</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* هدر شناسنامه سازه: عنوان، کد، وضعیت، دسته‌بندی و لوکیشن */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* کد سازه */}
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                {structure.code}
              </span>

              {/* نوع سازه */}
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                <Layers className="h-3.5 w-3.5" />
                <span>{structure.type.name}</span>
              </span>

              {/* دسته‌بندی */}
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {structure.category.name}
              </span>

              {/* نشان وضعیت */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                  isAvailable
                    ? "bg-emerald-100 text-emerald-800"
                    : isReserved
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isAvailable ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                <span>{structure.statusLabel}</span>
              </span>
            </div>

            {/* عنوان اصلی */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {structure.title}
            </h1>

            {/* نشانی کامل و منطقه */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>
                {structure.location.city}، {structure.location.district} — {structure.location.address}
              </span>
            </div>
          </div>

          {/* ابزارهای اشتراک‌گذاری و نشان‌کردن */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="اشتراک‌گذاری اطلاعات سازه"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span>اشتراک‌گذاری</span>
            </button>
            <button
              type="button"
              title="ذخیره در نشان‌شده‌ها"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <span>نشان کردن</span>
            </button>
          </div>
        </div>

        {/* گالری تصاویر (دید روز و شب) */}
        <StructureGallery images={structure.images} title={structure.title} />

        {/* چیدمان دو ستونه RTL: ستون راست (اطلاعات و مشخصات) و ستون چپ (سایدبار استیکی رزرو) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ستون راست (در RTL یعنی اولین بخش): مشخصات فنی، توضیحات و مینی‌مپ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* مشخصات فنی و استانداردهای اکران */}
            <StructureSpecs structure={structure} />

            {/* مینی‌مپ و اطلاعات مسیریابی */}
            <MiniMapLocation location={structure.location} title={structure.title} />
          </div>

          {/* ستون چپ (در RTL یعنی سمت چپ): فرم استیکی ثبت درخواست رزرو اولیه */}
          <div className="lg:col-span-5 xl:col-span-4">
            <BookingSidebar structure={structure} />
          </div>

        </div>

        {/* بخش سازه‌های مشابه و پیشنهادی در همین محور */}
        {similarStructures.length > 0 && (
          <div className="pt-8 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  سازه‌های تبلیغاتی مشابه در همین دسته‌بندی
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  سایر بیلبوردهای پربازده در محورهای بزرگراهی متصل
                </p>
              </div>
              <Link
                href="/structures"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>مشاهده همه سازه‌ها</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarStructures.map((sim) => (
                <StructureCard key={sim.id} structure={sim} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
