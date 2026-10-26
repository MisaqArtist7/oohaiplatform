"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  CreditCard,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Upload,
  Loader2,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { fetchProformaDownloadToken } from "../api/bookings.api";
import { formatToman, toPersianDigits } from "@/lib/mock-data";
import {
  useClientBookingDetailQuery,
  useSubmitPaymentMutation,
} from "../hooks/useBookings";
import {
  paymentSubmissionSchema,
  PaymentSubmissionFormValues,
} from "../schemas/booking.schema";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

interface BookingDetailViewProps {
  bookingId: string;
  backUrl?: string;
}

const statusBadgeColors: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function BookingDetailView({
  bookingId,
  backUrl = "/dashboard/bookings",
}: BookingDetailViewProps) {
  const { data: booking, isLoading: loading, refetch } = useClientBookingDetailQuery(bookingId);
  const submitPaymentMutation = useSubmitPaymentMutation();

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

  // فایل پیوست انتخابی
  const [fileName, setFileName] = useState<string | null>(null);

  // فرم ثبت پرداخت با React Hook Form و Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSubmissionFormValues>({
    resolver: zodResolver(paymentSubmissionSchema),
    defaultValues: {
      bookingId,
      method: "satna",
      amount: booking?.totalPrice || 0,
      bankName: "",
      trackingCode: "",
      checkSerial: "",
      checkSayadId: "",
      dueDate: "۱۴۰۳/۰۲/۱۵",
      notes: "",
    },
  });

  // هماهنگ‌سازی مقدار پیش‌فرض مبلغ هنگامی که رزرو بارگذاری شد
  useEffect(() => {
    if (booking?.totalPrice) {
      setValue("amount", booking.totalPrice);
      setValue("bookingId", booking.id);
    }
  }, [booking, setValue]);

  const currentMethod = watch("method");
  const watchAmount = watch("amount");

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

  // دریافت توکن ۱۵ دقیقه‌ای برای دانلود پیش‌فاکتور یا قرارداد
  const handleSecureDownload = async (docId: string) => {
    setDownloadingDocId(docId);
    try {
      const data = await fetchProformaDownloadToken(docId);
      setSecureTokenData({
        docId,
        token: data.secureToken,
        expiresAt: data.expiresAt,
        downloadUrl: data.downloadUrl,
        secondsLeft: data.expiresInSeconds,
      });
      toast.success("لینک امن دانلود با اعتبار ۱۵ دقیقه صادر گردید.");
    } catch {
      toast.error("خطا در ایجاد لینک دانلود امن سند.");
    } finally {
      setDownloadingDocId(null);
    }
  };

  const copyTracking = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.trackingCode);
    setCopiedCode(true);
    toast.info("کد پیگیری کپی شد");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ارسال فرم پرداخت با TanStack Query mutation و Zod
  const onSubmitPayment = async (data: PaymentSubmissionFormValues) => {
    try {
      await submitPaymentMutation.mutateAsync({
        bookingId: data.bookingId,
        method: data.method,
        amount: data.amount,
        bankName: data.bankName?.trim() || "",
        trackingCode: data.trackingCode?.trim() || "",
        checkSerial: data.checkSerial?.trim() || "",
        checkSayadId: data.checkSayadId?.trim() || "",
        dueDate: data.dueDate?.trim() || "",
        receiptFileName: fileName || `${data.method}-receipt.pdf`,
        notes: data.notes?.trim() || "",
      });

      toast.success("سند پرداخت با موفقیت ثبت شد و فاکتور به امور مالی جهت تایید ارسال گردید.");
      refetch();
      reset({
        bookingId,
        method: "satna",
        amount: booking?.totalPrice || 0,
        bankName: "",
        trackingCode: "",
        checkSerial: "",
        checkSayadId: "",
        dueDate: "۱۴۰۳/۰۲/۱۵",
        notes: "",
      });
      setFileName(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ثبت پرداخت.";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-3 text-slate-500">
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
          href={backUrl}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به فهرست رزروها</span>
        </Link>
      </div>
    );
  }

  const badgeStyle = statusBadgeColors[booking.status.color] || statusBadgeColors.slate;

  return (
    <div className="space-y-6 pb-12">
      {/* هدر صفحه و دکمه بازگشت */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              <span>فهرست رزروها</span>
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-xs font-bold text-foreground">جزئیات پرونده {booking.trackingCode}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-lg font-black text-foreground">
              پرونده رزرو سازه تبلیغاتی: {booking.structure.title}
            </h1>
            <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold ${badgeStyle}`}>
              {booking.status.label}
            </Badge>
          </div>
        </div>

        {/* کد پیگیری و دکمه کپی */}
        <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-3 py-2">
          <span className="text-[11px] text-muted-foreground">کد پیگیری:</span>
          <span className="font-mono text-xs font-black text-slate-800 tracking-wider">
            {booking.trackingCode}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={copyTracking}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="کپی کد پیگیری"
          >
            {copiedCode ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* بنر لینک دانلود امن فعال (۱۵ دقیقه اعتبار) */}
      {secureTokenData && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-950">
                لینک امن دانلود پیش‌فاکتور صادر گردید (اعتبار محدود ۱۵ دقیقه‌ای)
              </h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                زمان باقی‌مانده تا ابطال توکن امنیتی:{" "}
                <span className="font-mono font-bold text-indigo-900">
                  {Math.floor(secureTokenData.secondsLeft / 60)}:
                  {(secureTokenData.secondsLeft % 60).toString().padStart(2, "0")}
                </span>
              </p>
            </div>
          </div>

          <a
            href={secureTokenData.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>دانلود فوری فایل PDF رسمی</span>
          </a>
        </div>
      )}

      {/* گرید دو ستونه: اطلاعات و اسناد + فرم پرداخت */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ستون راست (۷ ستون): اطلاعات سازه، وضعیت قرارداد و اسناد */}
        <div className="lg:col-span-7 space-y-6">
          {/* کارت مشخصات سازه */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative h-28 w-full sm:w-40 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src={booking.structure.image}
                  alt={booking.structure.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 right-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                  کد: {booking.structure.code}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {booking.structure.title}
                  </h3>
                  <span className="text-xs font-black text-primary shrink-0">
                    {formatToman(booking.totalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{booking.structure.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">بازه اکران:</span>{" "}
                    <span className="font-bold text-foreground">
                      {booking.startDate} تا {booking.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">طول دوره:</span>{" "}
                    <span className="font-bold text-foreground">
                      {toPersianDigits(booking.durationDays)} روز اکران
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* تایم‌لاین گردش کار رزرو */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>گردش کار و تاریخچه وضعیت پرونده</span>
            </h3>

            <div className="relative pr-4 border-r-2 border-slate-200 space-y-4">
              {booking.timeline.map((step) => (
                <div key={step.id} className="relative">
                  {/* دایره وضعیت */}
                  <div
                    className={`absolute -right-5.75 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${
                      step.isDone
                        ? "border-emerald-500 text-emerald-500"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        step.isDone ? "bg-emerald-500" : "bg-transparent"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {step.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {step.timestamp}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* پیش‌فاکتور و اسناد رسمی با دکمه‌های دریافت لینک امن ۱۵ دقیقه‌ای */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>اسناد، پیش‌فاکتورها و فرم‌های قانونی</span>
              </h3>
              <span className="text-[11px] text-muted-foreground">
                لینک‌های دانلود دارای توکن امنیتی موقت هستند
              </span>
            </div>

            {booking.documents.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-slate-200 rounded-xl">
                هنوز سندی از سوی واحد بازرگانی صادر نگردیده است.
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

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={downloadingDocId === doc.id}
                      onClick={() => handleSecureDownload(doc.id)}
                      className="gap-1.5 text-xs font-bold text-slate-800"
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
                    </Button>
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

        {/* ستون چپ (۵ ستون): فرم بارگذاری و ثبت پرداخت با Zod و TanStack Query */}
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

            <form onSubmit={handleSubmit(onSubmitPayment)} className="space-y-4">
              {/* انتخاب روش پرداخت: ساتنا یا چک صیادی */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  روش تسویه حساب:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("method", "satna")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold border transition-all cursor-pointer ${
                      currentMethod === "satna"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                        : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>حواله ساتنا / پایا</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("method", "sayad_check")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold border transition-all cursor-pointer ${
                      currentMethod === "sayad_check"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                        : "bg-slate-50 border-border text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>چک صیادی بنفش</span>
                  </button>
                </div>
                {errors.method && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.method.message}</p>
                )}
              </div>

              {/* مبلغ پرداختی */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  مبلغ به تومان: <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="مبلغ پرداختی..."
                  className="text-xs"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  معادل: {formatToman(watchAmount || 0)}
                </div>
                {errors.amount && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.amount.message}</p>
                )}
              </div>

              {/* فیلدهای اختصاصی ساتنا */}
              {currentMethod === "satna" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      شماره پیگیری / ارجاع حواله ساتنا: <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      dir="ltr"
                      {...register("trackingCode")}
                      placeholder="SAT-140301-XXXX"
                      className="font-mono text-left text-xs"
                    />
                    {errors.trackingCode && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.trackingCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      نام بانک مبدا واریزکننده: <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      {...register("bankName")}
                      placeholder="مثلاً: بانک ملت، سامان، پاسارگاد..."
                      className="text-xs"
                    />
                    {errors.bankName && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.bankName.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* فیلدهای اختصاصی چک صیادی */}
              {currentMethod === "sayad_check" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      شناسه ۱۶ رقمی چک صیادی (کد صیاد): <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      dir="ltr"
                      maxLength={16}
                      {...register("checkSayadId")}
                      placeholder="1234567890123456"
                      className="font-mono text-left tracking-wider text-xs"
                    />
                    {errors.checkSayadId && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.checkSayadId.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        سریال چک:
                      </label>
                      <Input
                        type="text"
                        {...register("checkSerial")}
                        placeholder="۱۲۳۴۵۶/الف"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        سررسید چک: <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        {...register("dueDate")}
                        placeholder="۱۴۰۳/۰۲/۱۵"
                        className="text-xs"
                      />
                      {errors.dueDate && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.dueDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      بانک صادرکننده: <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      {...register("bankName")}
                      placeholder="مثلاً: بانک صادرات، تجارت، ملی..."
                      className="text-xs"
                    />
                    {errors.bankName && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.bankName.message}</p>
                    )}
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
                <Textarea
                  rows={2}
                  {...register("notes")}
                  placeholder="در صورت واریز چندمرحله‌ای یا شماره پیگیری دوم بنویسید..."
                  className="text-xs resize-none"
                />
              </div>

              {/* دکمه ارسال پرداخت */}
              <Button
                type="submit"
                disabled={isSubmitting || submitPaymentMutation.isPending}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-xs cursor-pointer"
              >
                {isSubmitting || submitPaymentMutation.isPending ? (
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
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
