"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const features = [
    {
        number: "01",
        title: "مکان‌یابی هوشمند",
        description:
        "مشاهده تمامی بیلبوردها و فضاهای تبلیغاتی روی نقشه تعاملی با اطلاعات دقیق ترافیکی و جمعیتی.",
    },
    {
        number: "02",
        title: "رزرو و مدیریت یکپارچه",
        description:
        "بدون نیاز به نامه‌نگاری‌های پیچیده اداری، کمپین‌های تبلیغاتی خود را مستقیماً از پنل مدیریت رزرو و زمان‌بندی کنید.",
    },
    {
        number: "03",
        title: "گزارش‌گیری سازمانی",
        description:
        "دسترسی به داشبوردهای تحلیلی دقیق برای بررسی میزان بازدید و بازخورد تبلیغات محیطی شما.",
    },
];

// کلمات تایتل همراه با استایل و تنظیمات خط جدید
const titleWords = [
{ text: "سلطه", style: "text-slate-900" },
{ text: "بر", style: "text-slate-900" },
{ text: "نمای", style: "text-slate-900" },
{ text: "شهر؛", style: "text-slate-900", breakLine: true },
{ text: "هوشمندانه‌تر", style: "text-slate-500" },
{ text: "از", style: "text-slate-500" },
{ text: "همیشه.", style: "text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600" },
];

export default function HomePage() {
const [visibleWords, setVisibleWords] = useState(0);

useEffect(() => {
    // تایمر برای نمایش کلمات (۸۰۰ میلی‌ثانیه برای تجربه کاربری بهتر در نظر گرفته شده، می‌توانید به 1000 تغییر دهید)
    if (visibleWords < titleWords.length) {
    const timer = setTimeout(() => {
        setVisibleWords((prev) => prev + 1);
    }, 369); 
    return () => clearTimeout(timer);
    }
}, [visibleWords]);

return (
    <main
    dir="rtl"
    className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans"
    >
    {/* Navigation */}
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-lg font-bold text-white shadow-md">
            O
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
            Ooha<span className="text-amber-500">.</span>
            </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            امکانات پنل
            </Link>
            <Link href="#about" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            خدمات سازمانی
            </Link>
            <Link href="#start" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            تعرفه‌ها
            </Link>
        </div>

        <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 md:block">
            ورود همکاران
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 shadow-md active:scale-[0.98]">
            پورتال مشتریان
            <span className="mr-2" aria-hidden="true">←</span>
            </Link>
        </div>
        </nav>
    </header>

    {/* Hero Section */}
    <section className="relative overflow-hidden bg-white">
        <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
            backgroundImage: "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
        }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 md:py-28 lg:grid-cols-2 lg:px-8">
        
        {/* Hero content */}
        <div className="max-w-2xl z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            سیستم جامع مدیریت تبلیغات محیطی
            </div>

            {/* Typewriter Effect Title */}
            <h1 className="text-4xl font-extrabold leading-[1.5] tracking-tight sm:text-5xl lg:text-6xl min-h-[100px] sm:min-h-[140px]">
            {titleWords.map((word, index) => (
                <span key={index}>
                <span
                    className={`inline-block ml-2 transition-all duration-500 ${word.style} ${
                    index < visibleWords
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                >
                    {word.text}
                </span>
                {word.breakLine && <br className="hidden sm:block" />}
                </span>
            ))}
            </h1>

            <p className={`mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg transition-all duration-1000 delay-300 ${visibleWords === titleWords.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            اوها (Ooha) پلتفرم یکپارچه سازمانی برای کشف، رزرو و مدیریت بیلبوردهای شهری است. جایگاه برند خود را روی نقشه مشخص کنید و تمام فرآیندها را به سادگی مدیریت نمایید.
            </p>

            {/* Hero actions */}
            <div className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all duration-1000 delay-500 ${visibleWords === titleWords.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/register" className="inline-flex items-center justify-center gap-3 rounded-lg bg-slate-900 px-8 py-4 font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800">
                شروع کمپین جدید
                <span aria-hidden="true">←</span>
            </Link>

            <Link href="#features" className="inline-flex items-center justify-center rounded-lg border-2 border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                مشاهده نقشه بیلبوردها
            </Link>
            </div>
        </div>

        {/* Hero Visual: Map & Billboard */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none aspect-square lg:aspect-[4/3] perspective-1000">
            <div className="relative w-full h-full rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl overflow-hidden group transform-gpu transition-transform duration-700 hover:rotate-0 rotate-x-12 rotate-y-[-10deg] rotate-z-[5deg]">
            
            {/* Fake Isometric Map Background */}
            <div className="absolute inset-0 bg-[#e2e8f0]">
                <div className="absolute top-1/3 left-0 w-full h-24 bg-slate-700 -skew-y-12 flex items-center justify-center border-y-4 border-slate-600">
                <div className="w-full h-1 border-t-2 border-dashed border-slate-400"></div>
                </div>
                <div className="absolute left-1/3 top-0 w-24 h-full bg-slate-700 skew-x-12 flex flex-col items-center justify-center border-x-4 border-slate-600 z-0">
                <div className="h-full w-1 border-l-2 border-dashed border-slate-400"></div>
                </div>
                
                <div className="absolute top-10 left-10 w-20 h-20 bg-slate-300 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] rounded-sm"></div>
                <div className="absolute bottom-20 right-10 w-32 h-24 bg-slate-300 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] rounded-sm"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-slate-300 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] rounded-sm"></div>
            </div>

            {/* Map Pins */}
            <div className="absolute top-1/4 left-1/4 animate-bounce z-10 text-amber-500 drop-shadow-md">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div className="absolute bottom-1/3 right-1/4 text-slate-500 drop-shadow-md opacity-75">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>

            {/* The 3D Billboard */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="absolute left-1/2 top-full w-4 h-24 bg-slate-800 -translate-x-1/2 shadow-lg"></div>
                
                <div className="relative w-72 h-40 bg-slate-900 rounded-lg p-2 shadow-2xl border-b-4 border-slate-950 transform group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
                    
                    <span className="text-4xl font-serif font-bold text-amber-500 mb-1 tracking-wider">Ooha.</span>
                    <span className="text-sm text-slate-300 font-medium">پلتفرم بیلبورد سازمانی</span>
                </div>
                
                <div className="absolute -top-3 left-1/4 w-3 h-4 bg-slate-700 rounded-t-sm shadow-[0_4px_10px_rgba(251,191,36,0.5)]"></div>
                <div className="absolute -top-3 right-1/4 w-3 h-4 bg-slate-700 rounded-t-sm shadow-[0_4px_10px_rgba(251,191,36,0.5)]"></div>
                </div>
            </div>
            </div>

            <div className="absolute -bottom-6 -left-6 z-30 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900">وضعیت شبکه</p>
                <p className="text-xs text-slate-500">۳۴۲ بیلبورد فعال</p>
            </div>
            </div>
        </div>
        </div>
    </section>

    {/* Features */}
    <section id="features" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold tracking-wider text-amber-600 uppercase">مزایای پلتفرم</span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">استاندارد جدید در تبلیغات محیطی</h2>
            <p className="mt-4 text-lg text-slate-600">داده‌های دقیق، مدیریت آسان و شفافیت مالی؛ تمام آنچه برای یک کمپین موفق نیاز دارید.</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
            <article key={feature.number} className="group relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-lg hover:ring-slate-300">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-lg font-bold text-white">{feature.number}</div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-4 text-slate-600 leading-relaxed">{feature.description}</p>
            </article>
            ))}
        </div>
        </div>
    </section>

    {/* About */}
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 rounded-3xl bg-slate-900 px-8 py-16 md:grid-cols-2 lg:px-16">
        <div>
            <span className="text-sm font-bold text-amber-500">چرا اوها؟</span>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl leading-tight">مدیریت تبلیغات، <br />در سطح کلان.</h2>
        </div>
        <div>
            <p className="text-lg text-slate-300 leading-relaxed">ما در اوها با ایجاد یک زیرساخت شفاف و داده‌محور، فاصله بین صاحبان رسانه و برندها را از بین برده‌ایم. تصمیم‌گیری‌های مبتنی بر داده، جایگزین روش‌های سنتی شده است.</p>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 font-bold text-amber-500 transition-colors hover:text-amber-400">
            درخواست دمو سازمانی
            <span aria-hidden="true">←</span>
            </Link>
        </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link href="/" className="text-xl font-black text-slate-900">
            Ooha<span className="text-amber-500">.</span>
        </Link>
        <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} پلتفرم سازمانی اوها. تمامی حقوق محفوظ است.
        </p>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/login" className="transition-colors hover:text-slate-900">ورود همکاران</Link>
            <Link href="/terms" className="transition-colors hover:text-slate-900">قوانین و مقررات</Link>
        </div>
        </div>
    </footer>
    </main>
);
}