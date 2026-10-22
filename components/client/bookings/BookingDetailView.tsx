"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Upload,
  Loader2,
  ChevronLeft,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import {
  ClientBooking,
  PaymentSubmissionInput,
} from "@/types/client-dashboard";
import {
  fetchClientBookingById,
  fetchProformaDownloadToken,
  submitBookingPayment,
} from "@/lib/client-api";
import { formatToman, toPersianDigits } from "@/lib/mock-data";

interface BookingDetailViewProps {
  bookingId: string;
}

export default function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const [booking, setBooking] = useState<ClientBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // وضعیت دانلود امن با توکن ۱۵ دقیقه‌ای
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [secureTokenData, setSecureTokenData] = useState<{
    docId: string;
    token: string;
    expiresAt: string;
    downloadUrl: string;
    secondsLeft: number;
  } | null>(null);

  // فرم ثبت پرداخت
  const [paymentMethod, setPaymentMethod] = useState<"satna" | "sayad_check">("satna");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [bankName, setBankName] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [checkSerial, setCheckSerial] = useState("");
  const [checkSayadId, setCheckSayadId] = useState("");
  const [dueDate, setDueDate] = useState("۱۴۰۳/۰۲/۱۵");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // بارگذاری اطلاعات رزرو
  useEffect(() => {
    let isMounted = true;

    fetchClientBookingById(bookingId)
      .then((data) => {
        if (isMounted && data) {
          setBooking(data);
          setPaymentAmount(data.totalPrice);
        }
      })
      .catch((err) => console.error("Error loading booking details:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // شمارشگر معکوس ۱۵ دقیقه برای لینک امن
  useEffect(() => {
    if (!secureTokenData) return;
    const interval = setInterval(() => {
      setSecureTokenData((prev) => {
        if (!prev || prev.secondsLeft <= 1) return null;
        return {
          ...prev,
          secondsLeft: prev.secondsLeft - 1,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secureTokenData]);

  const handleCopyTracking = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // دریافت لینک امن دانلود
  const handleSecureDownload = async (docId: string) => {
    setDownloadingDocId(docId);
    try {
      const res = await fetchProformaDownloadToken(docId);
      setSecureTokenData({
        docId,
        token: res.secureToken,
        expiresAt: res.expiresAt,
        downloadUrl: res.downloadUrl,
        secondsLeft: res.expiresInSeconds || 900,
      });
    } catch (err) {
      console.error("Error generating secure token:", err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  // اعتبارسنجی فرم پرداخت
  const validatePayment = () => {
    const errs: Record<string, string> = {};
    if (!paymentAmount || paymentAmount <= 0) {
      errs.amount = "مبلغ پرداختی را وارد نمایید.";
    }

    if (paymentMethod === "satna") {
      if (!trackingCode.trim()) {
        errs.trackingCode = "شماره پیگیری یا ارجاع فیش بانکی الزامی است.";
      }
      if (!bankName.trim()) {
        errs.bankName = "نام بانک مبدا را مشخص کنید.";
      }
    } else {
      const cleanSayad = checkSayadId.replace(/\s/g, "");
      if (!cleanSayad || cleanSayad.length < 12) {
        errs.checkSayadId = "شناسه ۱۶ رقمی صیادی چک را به صورت کامل وارد کنید.";
      }
      if (!bankName.trim()) {
        errs.bankName = "نام بانک صادرکننده چک الزامی است.";
      }
      if (!dueDate.trim()) {
        errs.dueDate = "تاریخ سررسید چک الزامی است.";
      }
    }

    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ارسال فرم پرداخت به POST /api/v1/client/bookings/{booking}/payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment() || !booking) return;

    setPaymentSubmitting(true);
    setPaymentErrors({});

    try {
      const input: PaymentSubmissionInput = {
        bookingId: booking.id,
        method: paymentMethod,
        amount: paymentAmount,
        bankName: bankName.trim(),
        trackingCode: trackingCode.trim(),
        checkSerial: checkSerial.trim(),
        checkSayadId: checkSayadId.trim(),
        dueDate: dueDate.trim(),
        receiptFileName: fileName || `${paymentMethod}-receipt.pdf`,
        notes: notes.trim(),
      };

      const res = await submitBookingPayment(input);
      if (res.data) {
        setBooking(res.data);
      }

      setPaymentSuccessToast("سند پرداخت با موفقیت ثبت شد و فاکتور به امور مالی جهت تایید ارسال گردید.");
      // پاکسازی فرم
      setTrackingCode("");
      setCheckSayadId("");
      setCheckSerial("");
      setFileName(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ثبت پرداخت.";
      setPaymentErrors({ form: msg });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold">در حال فراخوانی اطلاعات قرارداد و گردش کار...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-foreground">قرارداد یا رزرو مورد نظر یافت نشد</h3>
        <p className="text-xs text-muted-foreground">شناسه یا کد پیگیری وارد شده در سیستم ثبت نشده است.</p>
        <Link
          href="/client/bookings"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>بازگشت به لیست رزروهای من</span>
        </Link>
      </div>
    );
  }

  const isAwaiting = booking.status.value === "awaiting_payment";

  return (
    <div className="space-y-6">
      {/* پیام تست موفقیت پرداخت */}
      {paymentSuccessToast && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{paymentSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* نوار بردکرامب و بازگشت */}
      <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
        <nav className="flex items-center gap-1.5 text-muted-foreground">
          <Link href="/client/bookings" className="hover:text-primary transition-colors">
            رزروهای من
          </Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="font-bold text-foreground font-mono">{booking.trackingCode}</span>
        </nav>

        <Link
          href="/client/bookings"
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>بازگشت به جدول رزروها</span>
        </Link>
      </div>

      {/* کارت سربرگ مشخصات سازه و وضعیت */}
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0">
            {/* عکس سازه */}
            <div className="relative h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={booking.structure.image}
                alt={booking.structure.title}
                fill
                sizes="176px"
                className="object-cover"
              />
              <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                {booking.structure.type}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <span>{booking.trackingCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    title="کپی کد رهگیری"
                    className="hover:text-primary"
                  >
                    {copiedCode ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                    isAwaiting
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isAwaiting && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />}
                  <span>{booking.status.label}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-foreground">
                {booking.structure.title}
              </h2>

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{booking.structure.address}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                  {booking.structure.dimensions}
                </span>
                <span>•</span>
                <span>برند: <strong>{booking.brandName}</strong></span>
                <span>•</span>
                <span>متقاضی: {booking.contactPerson} ({booking.contactPhone})</span>
              </div>
            </div>
          </div>

          {/* باکس مبلغ و مهلت */}
          <div className="w-full md:w-auto bg-slate-50 p-4 rounded-xl border border-border text-right md:text-left shrink-0">
            <span className="block text-[11px] text-muted-foreground">مبلغ نهایی قرارداد:</span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-sans">
              {formatToman(booking.totalPrice)}
            </span>
            <div className="text-[11px] text-primary font-bold mt-1">
              دوره: {booking.startDate} تا {booking.endDate} ({toPersianDigits(booking.durationDays)} روز)
            </div>
          </div>
        </div>
      </div>

      {/* چیدمان دو ستونه: سمت راست (گردش کار و اسناد) و سمت چپ (فرم ثبت پرداخت) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ستون راست (۷ ستون): تایم‌لاین گردش کار + بخش اسناد و پیش‌فاکتور */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* گردش کار و تغییر وضعیت‌ها (Status Workflow Timeline Logs) */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>گردش کار و تاریخچه وضعیت قرارداد (Timeline Logs)</span>
            </h3>

            <div className="relative pr-6 space-y-6 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {booking.timeline.map((item) => (
                <div key={item.id} className="relative group">
                  {/* دایره وضعیت روی خط تایم‌لاین */}
                  <div
                    className={`absolute -right-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
                      item.isDone
                        ? item.isCurrent
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-emerald-600 text-white"
                        : "bg-slate-300 text-slate-600"
                    }`}
                  >
                    {item.isDone ? (
                      <Check className="h-3 w-3 stroke-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[10px] text-slate-500 font-medium">
                      اقدام‌کننده: {item.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* بخش اسناد، پیش‌فاکتور و دانلود با توکن امن ۱۵ دقیقه‌ای */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>اسناد و پیش‌فاکتورهای رسمی صادره</span>
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {toPersianDigits(booking.documents.length)} سند پیوست
              </span>
            </div>

            {/* بنر اطلاع‌رسانی توکن فعال ۱۵ دقیقه‌ای در صورت تولید */}
            {secureTokenData && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 space-y-2 text-xs text-indigo-950 animate-in fade-in">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    توکن امن دانلود فعال است
                  </span>
                  <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    زمان باقی‌مانده: {toPersianDigits(Math.floor(secureTokenData.secondsLeft / 60))}:
                    {toPersianDigits((secureTokenData.secondsLeft % 60).toString().padStart(2, "0"))}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  لینک دانلود اختصاصی با توکن رمزنگاری‌شده صادر شد. روی دکمه زیر کلیک نمایید.
                </p>
                <a
                  href={secureTokenData.downloadUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>دانلود مستقیم پیش‌فاکتور (PDF)</span>
                </a>
              </div>
            )}

            {booking.documents.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-slate-50 rounded-xl">
                هنوز سندی برای این رزرو صادر نشده است. پس از تایید اولیه، پیش‌فاکتور بارگذاری می‌شود.
              </div>
            ) : (
              <div className="space-y-2.5">
                {booking.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">
                            {doc.title}
                          </h4>
                          <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.2 text-[10px] text-slate-600">
                            {doc.typeLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          تاریخ صدور: {doc.date} • حجم: {doc.fileSize}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={downloadingDocId === doc.id}
                      onClick={() => handleSecureDownload(doc.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-border px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:border-primary/50 transition-all disabled:opacity-50"
                    >
                      {downloadingDocId === doc.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          <span>در حال صدور توکن...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 text-primary" />
                          <span>دریافت لینک امن ۱۵ دقیقه‌ای</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* سوابق پرداخت‌های قبلی ثبت‌شده */}
          {booking.payments.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <span>سوابق تراکنش‌ها و اسناد پرداختی ثبت‌شده</span>
              </h3>

              <div className="space-y-2">
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span>{p.methodLabel} - {formatToman(p.amount)}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {p.statusLabel}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-muted-foreground text-[11px]">
                      {p.trackingCode && <span>کد پیگیری: <strong className="text-slate-700">{p.trackingCode}</strong></span>}
                      {p.bankName && <span>بانک: {p.bankName}</span>}
                      {p.checkSayadId && <span>شناسه صیادی: {p.checkSayadId}</span>}
                      <span>ثبت: {p.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ستون چپ (۵ ستون): فرم بارگذاری و ثبت پرداخت (POST /api/v1/client/bookings/{booking}/payment) */}
        <div className="lg:col-span-5" id="payment">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-md space-y-4 sticky top-20">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                <span>ثبت فیش واریزی یا چک صیادی</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                پس از پرداخت حواله یا ثبت چک، اطلاعات را وارد نمایید تا قرارداد شما ظرف ۴ ساعت تایید گردد.
              </p>
            </div>

            {/* خطای فرم */}
            {paymentErrors.form && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{paymentErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* انتخاب روش پرداخت: ساتنا یا چک صیادی */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  روش تسویه حساب:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("satna")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold border transition-all ${
                      paymentMethod === "satna"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                        : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>حواله ساتنا / پایا</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("sayad_check")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold border transition-all ${
                      paymentMethod === "sayad_check"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                        : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>چک صیادی بنفش</span>
                  </button>
                </div>
              </div>

              {/* مبلغ پرداختی */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  مبلغ به تومان: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-xs text-foreground focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  معادل: {formatToman(paymentAmount)}
                </div>
              </div>

              {/* فیلدهای اختصاصی ساتنا */}
              {paymentMethod === "satna" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      شماره پیگیری / ارجاع حواله ساتنا: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="SAT-140301-XXXX"
                      className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-xs text-foreground font-mono focus:border-indigo-600 focus:bg-white focus:outline-none text-left"
                    />
                    {paymentErrors.trackingCode && (
                      <p className="text-[11px] text-rose-600 mt-1">{paymentErrors.trackingCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      نام بانک مبدا واریزکننده: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="مثلاً: بانک ملت، سامان، پاسارگاد..."
                      className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-xs text-foreground focus:border-indigo-600 focus:bg-white focus:outline-none"
                    />
                    {paymentErrors.bankName && (
                      <p className="text-[11px] text-rose-600 mt-1">{paymentErrors.bankName}</p>
                    )}
                  </div>
                </>
              )}

              {/* فیلدهای اختصاصی چک صیادی */}
              {paymentMethod === "sayad_check" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      شناسه ۱۶ رقمی چک صیادی (کد صیاد): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={16}
                      value={checkSayadId}
                      onChange={(e) => setCheckSayadId(e.target.value)}
                      placeholder="1234567890123456"
                      className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-xs text-foreground font-mono focus:border-indigo-600 focus:bg-white focus:outline-none text-left tracking-wider"
                    />
                    {paymentErrors.checkSayadId && (
                      <p className="text-[11px] text-rose-600 mt-1">{paymentErrors.checkSayadId}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        سریال چک:
                      </label>
                      <input
                        type="text"
                        value={checkSerial}
                        onChange={(e) => setCheckSerial(e.target.value)}
                        placeholder="۱۲۳۴۵۶/الف"
                        className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-foreground focus:border-indigo-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        سررسید چک: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="۱۴۰۳/۰۲/۱۵"
                        className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs text-foreground focus:border-indigo-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      بانک صادرکننده: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="مثلاً: بانک صادرات، تجارت، ملی..."
                      className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-xs text-foreground focus:border-indigo-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* بارگذاری فایل فیش یا تصویر چک */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  بارگذاری تصویر فیش یا چک (اختیاری):
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-border bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    {fileName ? (
                      <span className="text-xs font-bold text-emerald-700 truncate max-w-xs">
                        فایل انتخاب شد: {fileName}
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-700">
                          انتخاب تصویر رسید یا کشیدن فایل به اینجا
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          فرمت‌های مجاز: JPG، PNG، PDF (حداکثر ۵ مگابایت)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* توضیحات تکمیلی */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  توضیحات و یادداشت مالی:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="در صورت واریز چندمرحله‌ای یا شماره پیگیری دوم بنویسید..."
                  className="w-full rounded-xl border border-border bg-slate-50 p-2.5 text-xs text-foreground focus:border-indigo-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* دکمه ارسال پرداخت */}
              <button
                type="submit"
                disabled={paymentSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {paymentSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال بارگذاری و ثبت سند...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>تایید و ارسال سند پرداخت برای واحد مالی</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
