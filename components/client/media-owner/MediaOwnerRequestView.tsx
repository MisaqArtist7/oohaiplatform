"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { submitMediaOwnerApplication } from "@/lib/client-api";
import { toPersianDigits } from "@/lib/mock-data";

export default function MediaOwnerRequestView() {
  const [companyName, setCompanyName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [structuresCount, setStructuresCount] = useState<number>(5);
  const [province, setProvince] = useState("تهران");
  const [files, setFiles] = useState<File[]>([]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    trackingCode: string;
    message: string;
    submittedAt: string;
  } | null>(null);

  const provinces = [
    "تهران",
    "خراسان رضوی",
    "اصفهان",
    "فارس",
    "آذربایجان شرقی",
    "البرز",
    "مازندران",
    "خوزستان",
    "سایر استان‌ها",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (files.length + newFiles.length > 5) {
      setFormErrors((prev) => ({
        ...prev,
        documents: "حداکثر ۵ فایل می‌توانید بارگذاری فرمایید.",
      }));
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.documents;
      return copy;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!companyName.trim()) {
      errs.companyName = "نام رسمی شرکت یا نام متقاضی الزامی است.";
    }

    const cleanNationalId = nationalId.trim().replace(/[۰-۹]/g, (d) =>
      String(d.charCodeAt(0) - 1776)
    );
    if (!cleanNationalId) {
      errs.nationalId = "شناسه ملی یا کد اقتصادی الزامی است.";
    } else if (cleanNationalId.length > 11 || !/^\d+$/.test(cleanNationalId)) {
      errs.nationalId = "شناسه ملی / کد اقتصادی باید حداکثر ۱۱ رقم عددی باشد.";
    }

    if (!contactPerson.trim()) {
      errs.contactPerson = "نام نماینده یا صاحب امضا الزامی است.";
    }

    const cleanPhone = phone.trim().replace(/[۰-۹]/g, (d) =>
      String(d.charCodeAt(0) - 1776)
    );
    if (!cleanPhone) {
      errs.phone = "شماره تماس همراه یا دفتر الزامی است.";
    } else if (!/^09\d{9}$/.test(cleanPhone) && !/^\d{8,11}$/.test(cleanPhone)) {
      errs.phone = "شماره تماس وارد شده معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).";
    }

    if (!address.trim() || address.trim().length < 10) {
      errs.address = "آدرس دقیق دفتر یا نشانی قانونی را وارد کنید (حداقل ۱۰ کاراکتر).";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const fd = new FormData();
      fd.append("company_name", companyName.trim());
      fd.append("companyName", companyName.trim());
      fd.append("national_id", nationalId.trim());
      fd.append("nationalId", nationalId.trim());
      fd.append("contact_person", contactPerson.trim());
      fd.append("phone", phone.trim());
      fd.append("address", address.trim());
      fd.append("structures_count", String(structuresCount));
      fd.append("province", province);

      files.forEach((f) => {
        fd.append("documents[]", f);
      });

      const res = await submitMediaOwnerApplication(fd);

      setSubmissionSuccess({
        trackingCode: res.trackingCode || `MO-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        message:
          res.message ||
          "درخواست شما با موفقیت ثبت گردید و جهت بررسی حقوقی و اصالت سازه‌ها به واحد امور مالکان ارجاع داده شد.",
        submittedAt: "امروز - هم‌اکنون",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در برقراری ارتباط با سامانه";
      setFormErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionSuccess(null);
    setCompanyName("");
    setNationalId("");
    setContactPerson("");
    setPhone("");
    setAddress("");
    setStructuresCount(5);
    setFiles([]);
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-primary" />
            <span>درخواست ارتقا به مالک رسانه (Media Owner)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            صاحبان بیلبورد، پل‌های هوایی، تلویزیون شهری و کانون‌های تبلیغاتی می‌توانند رسانه‌های خود را در OOHAI عرضه نمایند.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>تضمین تسویه ریالی و قرارداد رسمی</span>
        </div>
      </div>

      {/* حالت پس از ثبت موفق (Success State) */}
      {submissionSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1">
              ثبت موفقیت‌آمیز پرونده
            </span>
            <h3 className="text-lg sm:text-xl font-black text-foreground">
              درخواست همکاری شما با شماره پیگیری زیر ثبت گردید
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {submissionSuccess.message}
            </p>
          </div>

          {/* کارت شماره پیگیری و جزییات */}
          <div className="max-w-md mx-auto rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3 text-right text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-muted-foreground">کد پیگیری پرونده:</span>
              <span className="font-mono text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                {submissionSuccess.trackingCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">نام متقاضی/شرکت:</span>
              <span className="font-bold text-foreground">{companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">وضعیت فعلی:</span>
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>در صف بازبینی مدارک و تایید کارشناس</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">زمان پاسخگویی تخمینی:</span>
              <span className="text-slate-700 font-bold">۲۴ الی ۴۸ ساعت کاری</span>
            </div>
          </div>

          {/* دکمه‌های اقدام */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/client/bookings"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>بازگشت به پنل رزروها</span>
            </Link>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>ثبت درخواست دیگر</span>
            </button>
          </div>
        </div>
      ) : (
        /* فرم ثبت درخواست */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ستون اصلی فرم */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>مشخصات حقوقی شرکت و مشخصات مالکیت رسانه</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                لطفاً اطلاعات هویتی و مدارک مالکیت سازه‌های تبلیغاتی خود را با دقت تکمیل نمایید.
              </p>
            </div>

            {formErrors.form && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* نام رسمی شرکت یا شخص */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    نام رسمی شرکت / شخص حقیقی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="مثال: کانون آگهی و تبلیغات آوای فردا"
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  />
                  {formErrors.companyName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.companyName}</p>
                  )}
                </div>

                {/* شناسه ملی / کد اقتصادی */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    شناسه ملی / کد اقتصادی / شماره ملی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="۱۰ یا ۱۱ رقم (مثلاً: ۱۰۱۰۲۹۳۸۴۷۵)"
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  />
                  {formErrors.nationalId && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.nationalId}</p>
                  )}
                </div>

                {/* نام نماینده تام‌الاختیار */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    نام و نام خانوادگی نماینده / مدیرعامل: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="مثال: مهندس کوروش صادقی"
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  />
                  {formErrors.contactPerson && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.contactPerson}</p>
                  )}
                </div>

                {/* شماره تلفن همراه */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    شماره تماس مستقیم (همراه/دفتر): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full text-right rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* استان و حوزه فعالیت */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    استان و منطقه استقرار سازه‌ها:
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  >
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* تخمین تعداد سازه‌ها */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    تعداد سازه‌های تحت مدیریت/مالکیت:
                  </label>
                  <select
                    value={structuresCount}
                    onChange={(e) => setStructuresCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value={1}>۱ الی ۳ سازه</option>
                    <option value={5}>۴ الی ۱۰ سازه</option>
                    <option value={20}>۱۱ الی ۳۰ سازه</option>
                    <option value={50}>بیش از ۳۰ سازه (شبکه بزرگ)</option>
                  </select>
                </div>
              </div>

              {/* آدرس دفتر مرکزی */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  آدرس دفتر مرکزی یا نشانی قانونی: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ..."
                  className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none transition-colors resize-none leading-relaxed"
                />
                {formErrors.address && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.address}</p>
                )}
              </div>

              {/* بخش بارگذاری اسناد و مدارک (File Upload) */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <span>بارگذاری مدارک هویتی و مجوزهای رسانه (اختیاری اما تسریع‌کننده):</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {toPersianDigits(files.length)} از ۵ فایل مجاز
                  </span>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary/60 bg-slate-50/60 hover:bg-slate-50 transition-colors p-6 text-center space-y-2 cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">
                    برای بارگذاری مدارک کلیک کنید یا فایل‌ها را اینجا رها کنید
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    فرمت‌های مجاز: PDF، JPG، PNG (اساسنامه، روزنامه رسمی، پروانه کسب یا قرارداد شهرداری)
                  </p>
                </div>

                {formErrors.documents && (
                  <p className="text-[11px] text-rose-600">{formErrors.documents}</p>
                )}

                {/* پیش‌نمایش فایل‌های انتخاب‌شده */}
                {files.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 truncate text-[11px]">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-sans">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-muted-foreground hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* دکمه ارسال درخواست */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-xs font-black text-white shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ارسال اطلاعات و مدارک به واحد حقوقی...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>ثبت نهایی درخواست و دریافت کد رهگیری</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ستون چپ: مزایا و توضیحات همکاری */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-primary text-xs">
                <Sparkles className="h-4 w-4" />
                <span>مزایای پیوستن به مالکان رسانه OOHAI:</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>فروش مستقیم به ۵۰۰+ برند معتبر:</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      دسترسی به تقاضای همیشگی شرکت‌های بزرگ بدون نیاز به بازاریابی سنتی.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>تضمین تسویه ریالی و چک صیادی:</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      مبالغ پرداختی توسط پلتفرم تایید و طبق زمان‌بندی قرارداد بدون تاخیر واریز می‌گردد.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>تقویم اکران ضد تداخل:</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      سیستم هوشمند قفل سازه مانع از دوبار رزرو شدن هر فضای تبلیغاتی می‌شود.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* کارت فرایند بررسی */}
            <div className="rounded-2xl border border-border bg-white p-5 space-y-3 text-xs shadow-2xs">
              <div className="font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>روند تایید مدارک در پلتفرم</span>
              </div>
              <ol className="space-y-2 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
                <li>ثبت فرم و دریافت کد پیگیری اختصاصی</li>
                <li>استعلام اصالت مجوز و تطبیق با سازمان زیباسازی (۲۴ ساعت)</li>
                <li>تماس کارشناس پشتیبانی و فعال‌سازی پنل مدیریت سازه‌ها</li>
              </ol>
              <div className="pt-2 border-t border-border flex items-center gap-2 text-muted-foreground text-[11px]">
                <PhoneCall className="h-3.5 w-3.5 text-primary" />
                <span>پشتیبانی مالکان رسانه: ۰۲۱-۸۸۰۰۰۰۰۰</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
