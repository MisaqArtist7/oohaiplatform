import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  MonitorPlay,
  Layers,
  Navigation,
  ShieldCheck,
  PhoneCall,
  Building,
} from "lucide-react";
import LandingQuickSearch from "@/features/structures/components/LandingQuickSearch";
import LandingShowcase from "@/features/structures/components/LandingShowcase";

export default function HomePage() {
  // دسته‌بندی انواع سازه
  const structureTypes = [
    { title: "بیلبوردهای بزرگراهی", icon: Layers },
    { title: "پل‌های عابر پیاده", icon: Navigation },
    { title: "استرابوردهای شهری", icon: Building },
    { title: "تلویزیون شهری دیجیتال", icon: MonitorPlay },
    { title: "لایت‌باکس‌های معابر", icon: Sparkles },
  ];

  // مناطق هدف
  const targetZones = [
    "شاهراه‌ها و اتوبان‌ها",
    "مناطق پرتردد تجاری",
    "محدوده دانشگاه‌ها",
    "مراکز خرید و مال‌ها",
    "مناطق لوکس و شمال شهر",
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        {/* ۱. بخش Hero و جستجوی سریع */}
        <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-muted/60 to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-primary shadow-sm mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>اولین سامانه هوشمند رزرواسیون آنی و تحلیل داده‌محور تبلیغات محیطی</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:leading-tight">
              رزرو آنلاین بیلبورد و سازه‌های تبلیغاتی با{" "}
              <span className="text-primary">مشاوره هوش مصنوعی</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              موقعیت مکانی صدها بیلبورد، استرابورد و تلویزیون شهری را روی نقشه تعاملی بررسی کنید،
              مخاطبان هدف را تحلیل نمایید و بدون تداخل، سازه دلخواه خود را رزرو کنید.
            </p>

            {/* باکس جستجوی سریع واقعی (Quick Search متصل به API شهرها و انواع سازه) */}
            <LandingQuickSearch />

            {/* دکمه‌های دسترسی سریع زیر سرچ */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/ai-advisor"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                طراحی هوشمند کمپین با AI بر اساس بودجه شما
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ۲. دسته‌بندی‌های سازه‌ها و مناطق هدف */}
        <section className="py-16 bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">دسته‌بندی سازه‌ها و مناطق هدف</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  بر اساس نوع رسانه محیطی یا تیپ مخاطبان منطقه، سازه مناسب خود را بیابید
                </p>
              </div>
              <Link
                href="/structures"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                مشاهده کاوشگر تمام‌صفحه نقشه
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            {/* کارت‌های نوع سازه */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {structureTypes.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={idx}
                    href="/structures"
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-background p-5 transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="mt-6">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">مشاهده در کاتالوگ</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* تگ‌های مناطق هدف */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold text-muted-foreground ml-2">
                فیلتر سریع مناطق پرمتقاضی:
              </span>
              {targetZones.map((zone, idx) => (
                <Link
                  key={idx}
                  href="/structures"
                  className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {zone}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ۳. ویترین سازه‌های منتخب (متصل به useStructures واقعی) */}
        <LandingShowcase />

        {/* ۴. بنر ویزارد دستیار هوش مصنوعی (AI Campaign Advisor) */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 shadow-xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3.5 py-1 text-xs font-semibold">
                  <Sparkles className="h-4 w-4" />
                  ویزارد هوشمند مشاور کمپین (AI Campaign Advisor)
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                  نمی‌دانید کدام بیلبوردها برای محصول شما بیشترین بازدهی را دارند؟
                </h2>
                <p className="text-sm sm:text-base text-primary-foreground/85 leading-relaxed max-w-2xl">
                  فقط شهر، سقف بودجه و توضیح کوتاهی از محصول خود را وارد کنید تا هوش مصنوعی سامانه با
                  تحلیل معنایی، بهترین سبد سازه‌ها را به همراه دلیل تحلیلی فارسی به شما پیشنهاد دهد.
                </p>
                <div className="pt-2 flex flex-wrap gap-6 text-xs sm:text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> ۱. تعیین شهر و بودجه
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> ۲. شرح سناریو و مخاطب هدف
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> ۳. دریافت چیدمان بهینه بیلبوردها
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex lg:justify-end">
                <Link
                  href="/ai-advisor"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-background px-7 py-4 text-sm font-extrabold text-foreground shadow-lg hover:bg-muted transition-colors"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  شروع طراحی هوشمند کمپین
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ۵. فرم تماس سریع و مشاوره سازمانی */}
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-background p-6 sm:p-10 shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  درخواست مشاوره سریع و اکران سازمانی
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  آژانس‌های تبلیغاتی و برندها جهت دریافت پیش‌فاکتور رسمی یا راهنمایی بیشتر می‌توانند
                  مشخصات خود را ثبت کنند.
                </p>
              </div>

              <form className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی / نام برند"
                  className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="شماره موبایل (مثال: ۰۹۱۲۰۰۰۰۰۰۰)"
                  className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <PhoneCall className="h-4 w-4" />
                  ثبت درخواست تماس
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ۶. فوتر */}
      <footer className="border-t border-border bg-background py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© ۱۴۰۳ پلتفرم هوشمند اتوماسیون و رزرواسیون تبلیغات محیطی. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-success" />
              تضمین عدم تداخل رزروها
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}