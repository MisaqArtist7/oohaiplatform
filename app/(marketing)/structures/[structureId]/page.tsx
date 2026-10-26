import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  StructureGallery,
  StructureSpecs,
  MiniMapLocation,
  fetchStructureById,
} from "@/features/structures";
import { BookingSidebar } from "@/features/bookings";
import { formatToman } from "@/shared/lib/money";

interface StructureDetailPageProps {
  params: Promise<{
    structureId: string;
  }>;
}

export async function generateMetadata({
  params,
}: StructureDetailPageProps): Promise<Metadata> {
  const { structureId } = await params;
  try {
    const structure = await fetchStructureById(structureId);
    if (!structure) {
      return {
        title: "سازه تبلیغاتی یافت نشد | بیلبورد مارکت",
      };
    }

    const mainImage =
      structure.image ||
      (Array.isArray(structure.images)
        ? structure.images[0]
        : structure.images?.day) ||
      "";

    return {
      title: `${structure.title} (${structure.code || structure.id}) | بیلبورد مارکت`,
      description: structure.description?.slice(0, 160) || structure.title,
      openGraph: {
        title: structure.title,
        description: structure.description,
        images: mainImage ? [mainImage] : [],
      },
    };
  } catch {
    return {
      title: "سازه تبلیغاتی | بیلبورد مارکت",
    };
  }
}

export default async function StructureDetailPage({
  params,
}: StructureDetailPageProps) {
  const { structureId } = await params;

  let structure;
  try {
    structure = await fetchStructureById(structureId);
  } catch {
    // در صورت قطعی بک‌اند یا خطای شبکه
    structure = null;
  }

  if (!structure) {
    notFound();
  }

  const isAvailable = structure.status === "available";
  const isLocked = structure.status === "locked";
  const priceRial = structure.price ?? structure.pricing?.basePriceMonthly ?? 0;

  const typeName =
    typeof structure.type === "object" && structure.type?.name
      ? structure.type.name
      : "سازه محیطی";

  const cityName =
    typeof structure.city === "string"
      ? structure.city
      : structure.city && typeof structure.city === "object" && "name" in structure.city
        ? String((structure.city as { name: string }).name)
        : structure.location?.city || "";

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
            <span className="text-foreground font-medium truncate max-w-xs">
              {structure.title}
            </span>
          </nav>

          <Link
            href="/structures"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-primary transition-colors font-medium"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>بازگشت به نقشه و کاوشگر</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* سربرگ عنوان، کد، وضعیت و موقعیت سازه */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {typeName}
              </span>

              {/* نشان وضعیت زنده */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                  isAvailable
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : isLocked
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {isAvailable && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                {isLocked && <Clock className="h-3 w-3 text-amber-600" />}
                <span>{structure.statusLabel || "آماده بررسی"}</span>
              </span>

              {/* کد سازه */}
              <span className="font-mono text-xs font-semibold text-muted-foreground bg-slate-100 px-2.5 py-0.5 rounded-md">
                شناسه: {structure.code || String(structure.id)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {structure.title}
            </h1>

            {/* موقعیت مکانی مختصر */}
            {(cityName || structure.address) && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {cityName ? `${cityName} - ` : ""}
                  {structure.address || structure.location?.address || ""}
                </span>
              </div>
            )}
          </div>

          {/* تعرفه برجسته */}
          <div className="flex flex-col items-start md:items-end justify-center rounded-2xl bg-white border border-border p-4 shadow-2xs">
            <span className="text-xs text-muted-foreground font-medium">
              تعرفه پایه ماهانه (با احتساب تخفیف)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-sans mt-0.5">
              {priceRial > 0 ? formatToman(priceRial) : "استعلام تماس"}
            </div>
          </div>
        </div>

        {/* بدنه دو ستونه: گالری و مشخصات در راست، باکس رزرو در چپ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ستون اصلی راست (گالری، مشخصات، نقشه) */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* ۱. گالری تصاویر */}
            <StructureGallery images={structure.images} title={structure.title} />

            {/* ۲. مشخصات و استانداردهای سازه بر اساس فیلدهای واقعی API */}
            <StructureSpecs structure={structure} />

            {/* ۳. نقشه موقعیت مکانی و راه‌های دسترسی */}
            <MiniMapLocation location={structure.location} title={structure.title} />
          </div>

          {/* ستون چپ: سایدبار رزرو و محاسبه‌گر قیمت */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <BookingSidebar structure={structure} />
          </aside>
        </div>
      </div>
    </div>
  );
}
