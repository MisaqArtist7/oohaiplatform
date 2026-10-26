import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  LayoutDashboard,
  CalendarCheck,
  Sparkles,
  Handshake,
  ArrowRight,
  Building2,
  Loader2,
} from "lucide-react";
import { BookingDetailView } from "@/features/bookings";
import { initialClientBookings } from "@/lib/client-dashboard-data";
import { LogoutButton } from "@/shared/components";

interface DashboardBookingDetailPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export function generateStaticParams() {
  return initialClientBookings.map((b) => ({
    bookingId: b.id,
  }));
}

export async function generateMetadata({
  params,
}: DashboardBookingDetailPageProps): Promise<Metadata> {
  const { bookingId } = await params;
  return {
    title: `جزئیات رزرو ${bookingId} | داشبورد مشتریان`,
    description: "پیگیری وضعیت قرارداد، گردش کار، پرداخت و صدور پیش‌فاکتور سازه تبلیغاتی.",
  };
}

async function BookingDetailContent({ params }: DashboardBookingDetailPageProps) {
  const { bookingId } = await params;
  return <BookingDetailView bookingId={bookingId} />;
}

function DetailFallback() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>در حال بارگذاری جزئیات رزرو...</span>
      </div>
    </div>
  );
}

export default function DashboardBookingDetailPage({
  params,
}: DashboardBookingDetailPageProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 lg:flex">
      {/* ── سایدبار ناوبری داشبورد ── */}
      <aside className="flex flex-col border-b border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between p-4 lg:p-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-foreground">
              بیلبورد<span className="text-primary">مارکت</span>
            </span>
          </Link>
          <div className="lg:hidden">
            <LogoutButton variant="icon" />
          </div>
        </div>

        <nav aria-label="منوی داشبورد" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>نمای کلی</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary"
          >
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span>رزروهای من</span>
          </Link>

          <Link
            href="/dashboard/proposals"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>پیشنهادهای هوشمند</span>
          </Link>

          <Link
            href="/mediaOwnerRequest"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Handshake className="h-4 w-4 text-primary" />
            <span>همکاری مالکان</span>
          </Link>
        </nav>

        <div className="border-t border-border p-4 space-y-2">
          <Link
            href="/structures"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
          >
            <Building2 className="h-4 w-4" />
            <span>کاوشگر سازه‌ها روی نقشه</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به فهرست رزروها</span>
          </Link>

          <div className="pt-2 border-t border-border/60">
            <LogoutButton className="w-full justify-center" />
          </div>
        </div>
      </aside>

      {/* ── بخش محتوای جزئیات رزرو ── */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Suspense fallback={<DetailFallback />}>
            <BookingDetailContent params={params} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
