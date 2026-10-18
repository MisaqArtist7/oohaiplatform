"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Sparkles, LayoutGrid, User, Menu, X, Building2 } from "lucide-react";

export default function Header() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* لوگو و نام پلتفرم */}
        <div className="flex items-center gap-8">
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

        {/* منوی ناوبری دسکتاپ */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
            href="/structures"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
            <MapPin className="h-4 w-4" />
            کاوشگر نقشه
            </Link>
            <Link
            href="/structures"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
            <LayoutGrid className="h-4 w-4" />
            کاتالوگ سازه‌ها
            </Link>
            <Link
            href="/ai-advisor"
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary transition-all hover:bg-primary/20"
            >
            <Sparkles className="h-4 w-4" />
            مشاور هوشمند کمپین (AI)
            </Link>
            <Link
            href="/media-owner"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
            <Building2 className="h-4 w-4" />
            ثبت رسانه (مالکان)
            </Link>
        </nav>
        </div>

        {/* دکمه‌های سمت چپ (ورود / پنل کاربری) */}
        <div className="hidden md:flex items-center gap-3">
        <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
        >
            <User className="h-4 w-4" />
            ورود | ثبت‌نام
        </Link>
        </div>

        {/* دکمه همبرگری موبایل */}
        <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex md:hidden items-center justify-center rounded-lg border border-border p-2 text-foreground hover:bg-muted"
        aria-label="منو"
        >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
    </div>

    {/* منوی کشویی موبایل */}
    {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-3 pb-5 space-y-3">
        <Link
            href="/structures"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
            <MapPin className="h-4 w-4 text-primary" />
            کاوشگر نقشه
        </Link>
        <Link
            href="/structures"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
            <LayoutGrid className="h-4 w-4 text-primary" />
            کاتالوگ سازه‌ها
        </Link>
        <Link
            href="/ai-advisor"
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
        >
            <Sparkles className="h-4 w-4" />
            مشاور هوشمند کمپین (AI)
        </Link>
        <Link
            href="/media-owner"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
            <Building2 className="h-4 w-4 text-primary" />
            پنل مالکان رسانه
        </Link>
        <div className="pt-2 border-t border-border">
            <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
            <User className="h-4 w-4" />
            ورود | ثبت‌نام با شماره موبایل
            </Link>
        </div>
        </div>
    )}
    </header>
);
}