// components/common/Footer.tsx
import Link from "next/link";
import {
MapPin,
Sparkles,
Phone,
Mail,
ShieldCheck,
Clock,
Building2,
ArrowUpLeft,
CheckCircle2,
} from "lucide-react";

export default function Footer() {
return (
    <footer className="border-t border-border bg-background text-foreground">
    {/* بخش بالایی فوتر: مزایای کلیدی پلتفرم */}
    <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-foreground">تضمین عدم تداخل رزروها</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                همگام‌سازی لحظه‌ای وضعیت بیلبوردها با وب‌سوکت
                </p>
            </div>
            </div>

            <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-foreground">طراحی کمپین با هوش مصنوعی</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                پیشنهاد بهینه‌ترین سبد رسانه بر اساس بودجه و مخاطب هدف
                </p>
            </div>
            </div>

            <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
                <Clock className="h-6 w-6" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-foreground">قفل اختصاصی ۴۸ ساعته</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                صدور آنلاین پیش‌فاکتور رسمی و مهلت تسویه امن سازمانی
                </p>
            </div>
            </div>
        </div>
        </div>
    </div>

    {/* بخش میانی: ستون‌های لینک و اطلاعات */}
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
        
        {/* ستون ۱: معرفی برند (۴ ستون از ۱۲) */}
        <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <MapPin className="h-5 w-5" />
            </div>
            <div>
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                بیلبورد<span className="text-primary">مارکت</span>
                </span>
                <span className="block text-[10px] text-muted-foreground">
                اتوماسیون هوشمند تبلیغات محیطی
                </span>
            </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-4">
            اولین پلتفرم هوشمند اتوماسیون فروش، تحلیل داده‌محور و رزرواسیون آنلاین تبلیغات محیطی (OOH) در ایران. ما واسطه‌ای امن، شفاف و لحظه‌ای میان برندها، آژانس‌های تبلیغاتی و مالکان رسانه هستیم.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                قراردادهای رسمی حقوقی
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                نقشه تعاملی GIS
            </span>
            </div>
        </div>

        {/* ستون ۲: دسترسی سریع (۲ ستون از ۱۲) */}
        <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-foreground">دسترسی سریع</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            <li>
                <Link href="/structures" className="hover:text-primary transition-colors">
                کاوشگر نقشه تعاملی
                </Link>
            </li>
            <li>
                <Link href="/structures" className="hover:text-primary transition-colors">
                کاتالوگ تمام سازه‌ها
                </Link>
            </li>
            <li>
                <Link
                href="/ai-advisor"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                مشاور هوشمند کمپین
                <Sparkles className="h-3.5 w-3.5" />
                </Link>
            </li>
            <li>
                <Link href="/client" className="hover:text-primary transition-colors">
                پنل مشتریان و برندها
                </Link>
            </li>
            <li>
                <Link href="/media-owner" className="hover:text-primary transition-colors">
                پنل مالکان رسانه
                </Link>
            </li>
            </ul>
        </div>

        {/* ستون ۳: دسته‌بندی رسانه‌ها (۳ ستون از ۱۲) */}
        <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-bold text-foreground">انواع سازه‌های تبلیغاتی</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            <li>
                <Link href="/structures?type=billboard" className="hover:text-primary transition-colors">
                اجاره بیلبوردهای بزرگراهی و شهری
                </Link>
            </li>
            <li>
                <Link href="/structures?type=bridge" className="hover:text-primary transition-colors">
                عرشه پل‌های عابر پیاده
                </Link>
            </li>
            <li>
                <Link href="/structures?type=straboard" className="hover:text-primary transition-colors">
                استرابوردهای معابر پرتردد
                </Link>
            </li>
            <li>
                <Link href="/structures?type=tv" className="hover:text-primary transition-colors">
                تلویزیون‌های شهری دیجیتال (LED)
                </Link>
            </li>
            <li>
                <Link href="/structures?type=lightbox" className="hover:text-primary transition-colors">
                لایت‌باکس‌های تجاری و مترو
                </Link>
            </li>
            </ul>
        </div>

        {/* ستون ۴: اطلاعات تماس و همکاری مالکان (۳ ستون از ۱۲) */}
        <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground">ارتباط با واحد فروش و پشتیبانی</h3>
            
            <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            <a
                href="tel:02188000000"
                className="flex items-center gap-2 hover:text-primary transition-colors"
            >
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span dir="ltr" className="font-semibold text-foreground">021 - 88 00 00 00</span>
            </a>
            <a
                href="mailto:info@billboardmarket.ir"
                className="flex items-center gap-2 hover:text-primary transition-colors"
            >
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>info@billboardmarket.ir</span>
            </a>
            <div className="flex items-start gap-2 pt-1">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                تهران، بلوار آفریقا (جردن)، برج فناوری، طبقه ۴، واحد ۴۰۲
                </span>
            </div>
            </div>

            {/* باکس دعوت از مالکان رسانه */}
            <div className="rounded-xl border border-border bg-muted/60 p-3.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">مالک سازه یا کانون هستید؟</span>
                </div>
                <Link
                href="/media-owner"
                className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary hover:underline"
                >
                ثبت رسانه
                <ArrowUpLeft className="h-3.5 w-3.5" />
                </Link>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
                سازه‌های خود را ثبت کنید و موجودی آن‌ها را زنده مدیریت نمایید.
            </p>
            </div>
        </div>

        </div>
    </div>

    {/* بخش پایینی: کپی‌رایت */}
    <div className="border-t border-border bg-muted/20 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>
            © پلتفرم هوشمند اتوماسیون فروش و رزرواسیون تبلیغات محیطی (OOH). تمامی حقوق محفوظ است.
        </p>
        <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">
            قوانین و مقررات اکران
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
            حریم خصوصی
            </Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">
            سوالات متداول
            </Link>
        </div>
        </div>
    </div>
    </footer>
);
}