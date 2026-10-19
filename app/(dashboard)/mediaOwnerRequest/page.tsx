"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  MapPin,
  LayoutDashboard,
  CalendarCheck,
  Sparkles,
  Handshake,
  AlertCircle,
  FileCheck,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function MediaOwnerRequestPage() {
  const [companyName, setCompanyName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!companyName.trim()) {
      setErrorMessage("لطفاً نام کمپانی را وارد کنید.");
      return;
    }

    if (!nationalId.trim()) {
      setErrorMessage("لطفاً شماره ملی / شناسه ملی را وارد کنید.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("لطفاً فایل اسناد یا مدارک شرکت را بارگذاری کنید.");
      return;
    }

    setIsSubmitting(true);

    // شبیه‌سازی ارسال اطلاعات به بک‌اند
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSubmitted(true);
    } catch {
      setErrorMessage("خطایی در ثبت فرم رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCompanyName("");
    setNationalId("");
    setSelectedFile(null);
    setDescription("");
    setIsSubmitted(false);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 lg:flex">
      {/* ── سایدبار دسکتاپ و موبایل ── */}
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
            href="/mediaOwnerRequest"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
          >
            <Handshake className="h-4 w-4" />
            <span>همکاری مالکان</span>
          </Link>

          <span
            aria-disabled="true"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>رزروهای من</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">به‌زودی</span>
          </span>

          <span
            aria-disabled="true"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
          >
            <Sparkles className="h-4 w-4" />
            <span>پیشنهادهای هوشمند</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">به‌زودی</span>
          </span>
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به داشبورد</span>
          </Link>
        </div>
      </aside>

      {/* ── بخش اصلی محتوا ── */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* بردکرامب و دکمه بازگشت */}
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                داشبورد
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">درخواست همکاری مالکان رسانه</span>
            </nav>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>بازگشت</span>
            </Link>
          </div>

          {/* کارت وضعیت موفقیت آمیز */}
          {isSubmitted ? (
            <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">
                  درخواست همکاری با موفقیت ثبت شد
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                  اطلاعات شرکت <strong className="text-foreground font-semibold">{companyName}</strong> و مدارک ارسالی با موفقیت در سیستم ثبت گردید. کارشناسان ما پس از بررسی اولیه، با شما تماس خواهند گرفت.
                </p>

                <div className="mt-6 w-full rounded-xl border border-border bg-slate-50 p-4 text-right text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نام کمپانی:</span>
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">شماره / شناسه ملی:</span>
                    <span className="font-semibold text-foreground">{nationalId}</span>
                  </div>
                  {selectedFile && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">سند پیوست شده:</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span>بازگشت به پنل داشبورد</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <span>ثبت درخواست جدید</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* کارت فرم */
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              {/* هدر فرم */}
              <div className="border-b border-border bg-slate-50/50 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
                      فرم درخواست همکاری مالکان رسانه
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      اطلاعات کمپانی و مدارک هویتی خود را جهت بررسی و فعال‌سازی پنل مالکان وارد نمایید.
                    </p>
                  </div>
                </div>
              </div>

              {/* بدنه فرم */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ۱. نام کمپانی */}
                <div className="space-y-1.5">
                  <label htmlFor="companyName" className="block text-sm font-semibold text-foreground">
                    نام کمپانی / شرکت <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="مثال: شرکت تبلیغاتی صبا رسانه"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {/* ۲. شماره ملی / شناسه ملی */}
                <div className="space-y-1.5">
                  <label htmlFor="nationalId" className="block text-sm font-semibold text-foreground">
                    شماره ملی / شناسه ملی کمپانی <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      id="nationalId"
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="شناسه ملی ۱۱ رقمی شرکت یا شماره ملی ۱۰ رقمی"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    برای اشخاص حقوقی شناسه ملی ثبت شرکت‌ها و برای اشخاص حقیقی شماره ملی صاحب امتیاز را وارد کنید.
                  </p>
                </div>

                {/* ۳. اینپوت اسناد / داکیومنت */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-foreground">
                    اسناد و مدارک شرکت (داکیومنت) <span className="text-red-500">*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    id="documentsInput"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.zip"
                    className="sr-only"
                  />

                  {!selectedFile ? (
                    <label
                      htmlFor="documentsInput"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-slate-50/60 p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        برای بارگذاری اسناد کلیک کنید یا فایل را بکشید و رها کنید
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        فرمت‌های مجاز: PDF، JPG، PNG یا ZIP (اساسنامه، روزنامه رسمی، پروانه کسب یا مجوز سازه)
                      </p>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 text-right">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} مگابایت
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="حذف فایل"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ۴. توضیحات اختیاری */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="block text-sm font-semibold text-foreground">
                    توضیحات تکمیلی <span className="text-xs font-normal text-muted-foreground">(اختیاری)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute top-3 right-0 flex items-center pr-3.5 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="اگر توضیحاتی در مورد سازه‌ها، شهرها یا نوع همکاری دارید در این بخش بنویسید..."
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* دکمه‌های فرم */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    انصراف
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>در حال ارسال...</span>
                      </>
                    ) : (
                      <>
                        <Handshake className="h-4 w-4" />
                        <span>ثبت درخواست همکاری</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
