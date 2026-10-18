// app/(public)/page.tsx
import Link from "next/link";
import {
  Search,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  MonitorPlay,
  Layers,
  Navigation,
  ShieldCheck,
  Clock,
  PhoneCall,
  Building,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  // دسته‌بندی انواع سازه طبق صفحه ۲ داکیومنت
  const structureTypes = [
    { title: "بیلبوردهای بزرگراهی", count: "۴۲۰ سازه", icon: Layers },
    { title: "پل‌های عابر پیاده", count: "۱۸۵ سازه", icon: Navigation },
    { title: "استرابوردهای شهری", count: "۳۱۰ سازه", icon: Building },
    { title: "تلویزیون شهری دیجیتال", count: "۶۵ سازه", icon: MonitorPlay },
    { title: "لایت‌باکس‌های مترو و معابر", count: "۵۴۰ سازه", icon: Sparkles },
  ];

  // مناطق هدف طبق صفحه ۲ داکیومنت
  const targetZones = [
    "شاهراه‌ها و اتوبان‌ها",
    "مناطق پرتردد تجاری",
    "محدوده دانشگاه‌ها",
    "مراکز خرید و مال‌ها",
    "مناطق لوکس و شمال شهر",
  ];

  // نمونه سازه‌های ویژه (موک دیتا برای نمایش اولیه)
  const featuredStructures = [
    {
      id: 1,
      title: "بیلبورد اتوبان همت - غرب به شرق (قبل از خروجی چمران)",
      city: "تهران",
      type: "بیلبورد",
      dimensions: "۱۵ × ۵ متر",
      audience: "کارمندان، مدیران و تردد روزانه بالا",
      price: "۱۸۵,۰۰۰,۰۰۰",
      status: "available", // آماده رزرو
    },
    {
      id: 2,
      title: "تلویزیون شهری میدان ولیعصر (دید مستقیم چهارراه)",
      city: "تهران",
      type: "تلویزیون دیجیتال",
      dimensions: "۱۲ × ۶ متر",
      audience: "دانشجویان، جوانان و عابران پیاده",
      price: "۲۴۰,۰۰۰,۰۰۰",
      status: "locked", // قفل ۴۸ ساعته
    },
    {
      id: 3,
      title: "عرشه پل عابر پیاده بلوار اندرزگو",
      city: "تهران",
      type: "پل عابر",
      dimensions: "۲۰ × ۲.۵ متر",
      audience: "مخاطبان لوکس و قدرت خرید بالا",
      price: "۳۱۰,۰۰۰,۰۰۰",
      status: "available",
    },
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
              موقعیت مکانی صدها بیلبورد، استرابورد و تلویزیون شهری را روی نقشه تعاملی بررسی کنید، مخاطبان هدف را تحلیل نمایید و بدون تداخل، سازه دلخواه خود را به صورت آنی رزرو کنید.
            </p>

            {/* باکس جستجوی سریع (Quick Search) */}
            <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-background p-3 shadow-lg">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <select className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none">
                    <option value="">انتخاب شهر (همه شهرها)</option>
                    <option value="tehran">تهران</option>
                    <option value="isfahan">اصفهان</option>
                    <option value="mashhad">مشهد</option>
                    <option value="shiraz">شیراز</option>
                    <option value="tabriz">تبریز</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
                  <Layers className="h-5 w-5 text-muted-foreground shrink-0" />
                  <select className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none">
                    <option value="">نوع سازه تبلیغاتی</option>
                    <option value="billboard">بیلبورد بزرگراهی</option>
                    <option value="straboard">استرابورد</option>
                    <option value="bridge">پل عابر پیاده</option>
                    <option value="tv">تلویزیون شهری دیجیتال</option>
                    <option value="lightbox">لایت‌باکس</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
                  <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  <select className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none">
                    <option value="">منطقه هدف</option>
                    <option value="highway">شاهراه‌ها و اتوبان‌ها</option>
                    <option value="university">مناطق دانشگاهی</option>
                    <option value="luxury">مناطق لوکس</option>
                    <option value="mall">مراکز خرید</option>
                  </select>
                </div>

                <Link
                  href="/structures"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
                >
                  <Search className="h-4 w-4" />
                  جستجو روی نقشه
                </Link>
              </div>
            </div>

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

        {/* ۲. نوار آمار زنده سازه‌ها (Live Stats) */}
        <section className="border-b border-border bg-background py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary">+۱,۵۲۰</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">سازه تبلیغاتی ثبت‌شده</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-success">۸۴۰</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">بیلبورد آماده رزرو فوری (آنی)</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">۲۴ شهر</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">پوشش سراسری روی نقشه GIS</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">۴۸ ساعت</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">قفل اختصاصی سازه جهت قرارداد</p>
              </div>
            </div>
          </div>
        </section>

        {/* ۳. دسته‌بندی‌های محبوب و مناطق هدف */}
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
                      <p className="mt-1 text-xs text-muted-foreground">{item.count}</p>
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

        {/* ۴. ویترین سازه‌های ویژه با وضعیت Real-Time */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-foreground">سازه‌های منتخب آماده اکران</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  وضعیت رزرو تابلوها به صورت زنده (WebSocket) بروزرسانی می‌شود
                </p>
              </div>
              <Link
                href="/structures"
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                همه سازه‌ها
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredStructures.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* جایگاه تصویر سازه + Badge وضعیت */}
                    <div className="relative h-48 w-full bg-muted flex items-center justify-center border-b border-border">
                      <MapPin className="h-10 w-10 text-muted-foreground/40" />
                      <div className="absolute top-3 right-3">
                        {item.status === "available" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success backdrop-blur-sm">
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            آماده رزرو
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/15 px-3 py-1 text-xs font-bold text-danger backdrop-blur-sm">
                            <Clock className="h-3 w-3" />
                            قفل موقت ۴۸ ساعته
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-3 left-3 rounded-lg bg-foreground/80 px-2.5 py-1 text-[11px] font-medium text-background">
                        ابعاد: {item.dimensions}
                      </span>
                    </div>

                    {/* اطلاعات کارت */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-semibold text-primary">{item.type}</span>
                        <span>•</span>
                        <span>{item.city}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        مخاطب هدف: {item.audience}
                      </p>
                    </div>
                  </div>

                  {/* قیمت و دکمه اقدام */}
                  <div className="border-t border-border bg-muted/30 px-5 py-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] text-muted-foreground">تعرفه ماهانه اکران:</span>
                      <span className="text-base font-extrabold text-foreground">
                        {item.price} <span className="text-xs font-normal">تومان</span>
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
              ))}
            </div>
          </div>
        </section>

        {/* ۵. بنر ویزارد دستیار هوش مصنوعی (AI Campaign Advisor) */}
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
                  فقط شهر، سقف بودجه و توضیح کوتاهی از محصول خود (مثلاً: «معرفی نوشیدنی انرژی‌زا ویژه دانشجویان») را وارد کنید تا هوش مصنوعی سامانه با تحلیل معنایی، بهترین سبد سازه‌ها را به همراه دلیل تحلیلی فارسی به شما پیشنهاد دهد.
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

        {/* ۶. فرم تماس سریع و مشاوره سازمانی */}
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-background p-6 sm:p-10 shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  درخواست مشاوره سریع و اکران سازمانی
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  آژانس‌های تبلیغاتی و برندها جهت دریافت پیش‌فاکتور رسمی یا راهنمایی بیشتر می‌توانند مشخصات خود را ثبت کنند.
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

      {/* فوتر ساده */}
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