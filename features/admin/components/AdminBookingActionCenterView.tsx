"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CreditCard,
  Clock,
  Download,
  User,
  History,
  X,
  RefreshCw,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  BookingStatusBadge,
  LockCountdown,
  BOOKING_STEPPER_STEPS,
  type BookingLog,
  type BookingDocument,
} from "@/features/bookings";

import {
  useAdminBookingDetailQuery,
  useAdminBookingLogsQuery,
  useLockBookingMutation,
  useIssueProformaMutation,
  useApprovePaymentMutation,
  useRejectBookingMutation,
  useCompleteBookingMutation,
} from "../hooks/useAdmin";
import { getAdminDocumentDownloadUrl } from "../api/admin.api";
import { openSignedUrl } from "@/shared/lib/open-signed-url";
import { formatToman } from "@/shared/lib/money";
import { formatJalali } from "@/shared/lib/dates";
import { toPersianDigits } from "@/shared/lib/digits";
import { ApiError } from "@/shared/lib/errors";

interface AdminBookingActionCenterViewProps {
  bookingId: string;
}

export default function AdminBookingActionCenterView({
  bookingId,
}: AdminBookingActionCenterViewProps) {
  // ۱. واکشی جزییات پرونده رزرو و لاگ‌های حسابرسی
  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
    error,
    refetch: refetchBooking,
  } = useAdminBookingDetailQuery(bookingId);

  // در صورتی که جزئیات پرونده حاوی logs نباشد، از اندپوینت لاگ‌ها استفاده می‌شود
  const { data: logsData, refetch: refetchLogs } = useAdminBookingLogsQuery(bookingId);

  // موتیشن‌های عملیات مجاز ادمین
  const lockMutation = useLockBookingMutation();
  const proformaMutation = useIssueProformaMutation();
  const approvePaymentMutation = useApprovePaymentMutation();
  const rejectMutation = useRejectBookingMutation();
  const completeMutation = useCompleteBookingMutation();

  // وضعیت دانلود مدرک
  const [downloadingDocId, setDownloadingDocId] = useState<number | string | null>(null);

  // استیت‌های مودال‌های عملیاتی
  const [activeModal, setActiveModal] = useState<
    "lock" | "proforma" | "approve" | "reject" | "complete" | null
  >(null);

  // فیلدهای فرم دیالوگ‌ها
  const [actionNote, setActionNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [proformaFile, setProformaFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const normalizeFieldErrors = (errors?: Record<string, string[] | string>): Record<string, string> => {
    if (!errors) return {};
    const res: Record<string, string> = {};
    for (const [key, val] of Object.entries(errors)) {
      res[key] = Array.isArray(val) ? val[0] : String(val);
    }
    return res;
  };

  const isSubmitting =
    lockMutation.isPending ||
    proformaMutation.isPending ||
    approvePaymentMutation.isPending ||
    rejectMutation.isPending ||
    completeMutation.isPending;

  const closeModal = () => {
    if (isSubmitting) return;
    setActiveModal(null);
    setActionNote("");
    setRejectReason("");
    setProformaFile(null);
    setFieldErrors({});
  };

  // دانلود امن مدارک
  const handleDownloadDoc = async (docId: number | string) => {
    if (downloadingDocId || !booking) return;
    setDownloadingDocId(docId);
    try {
      await openSignedUrl(
        () => getAdminDocumentDownloadUrl(booking.id, docId),
        { errorMessage: "خطا در دریافت لینک دانلود مدرک" }
      );
    } finally {
      setDownloadingDocId(null);
    }
  };

  // ۱. هندلر قفل قرارداد
  const handleLockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !booking) return;
    setFieldErrors({});

    try {
      const res = await lockMutation.mutateAsync({
        id: booking.id,
        note: actionNote.trim() || undefined,
      });
      toast.success(res?.message || "رزرو با موفقیت برای قرارداد قفل شد.");
      closeModal();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        setFieldErrors(normalizeFieldErrors(err.fieldErrors));
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در اعمال قفل قرارداد.");
    }
  };

  // ۲. هندلر صدور پیش‌فاکتور
  const handleProformaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !booking) return;
    setFieldErrors({});

    if (!proformaFile) {
      setFieldErrors({ document: "بارگذاری فایل پیش‌فاکتور الزامی است." });
      return;
    }

    if (proformaFile.size > 10 * 1024 * 1024) {
      setFieldErrors({ document: "حجم فایل نمی‌تواند بیشتر از ۱۰ مگابایت باشد." });
      return;
    }

    try {
      const res = await proformaMutation.mutateAsync({
        id: booking.id,
        file: proformaFile,
        note: actionNote.trim() || undefined,
      });
      toast.success(res?.message || "پیش‌فاکتور رسمی با موفقیت صادر و ثبت شد.");
      closeModal();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        setFieldErrors(normalizeFieldErrors(err.fieldErrors));
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در صدور پیش‌فاکتور.");
    }
  };

  // ۳. هندلر تایید پرداخت
  const handleApprovePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !booking) return;
    setFieldErrors({});

    try {
      const res = await approvePaymentMutation.mutateAsync({
        id: booking.id,
        note: actionNote.trim() || undefined,
      });
      toast.success(res?.message || "پرداخت تایید و بازه اکران فعال گردید.");
      closeModal();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        setFieldErrors(normalizeFieldErrors(err.fieldErrors));
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در تایید پرداخت.");
    }
  };

  // ۴. هندلر رد درخواست
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !booking) return;
    setFieldErrors({});

    const cleanReason = rejectReason.trim();
    if (!cleanReason) {
      setFieldErrors({ reason: "ثبت دلیل رد درخواست الزامی است." });
      return;
    }

    try {
      const res = await rejectMutation.mutateAsync({
        id: booking.id,
        reason: cleanReason,
      });
      toast.success(res?.message || "درخواست رزرو رد شد.");
      closeModal();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        setFieldErrors(normalizeFieldErrors(err.fieldErrors));
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در رد پرونده.");
    }
  };

  // ۵. هندلر اتمام دوره اکران (Transition به completed)
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !booking) return;
    setFieldErrors({});

    try {
      const res = await completeMutation.mutateAsync({
        id: booking.id,
        note: actionNote.trim() || undefined,
      });
      toast.success(res?.message || "پایان دوره اکران با موفقیت ثبت شد.");
      closeModal();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        setFieldErrors(normalizeFieldErrors(err.fieldErrors));
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در تکمیل پرونده اکران.");
    }
  };

  if (bookingLoading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">
          در حال بارگذاری اطلاعات پرونده رزرو #{toPersianDigits(bookingId)}...
        </p>
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="py-20 px-6 text-center bg-white rounded-2xl border border-slate-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          خطا در دریافت مشخصات پرونده رزرو
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          {error instanceof Error ? error.message : "پرونده مورد نظر یافت نشد یا دسترسی به آن امکان‌پذیر نیست."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>بازگشت به لیست رزروها</span>
          </Link>
          <button
            type="button"
            onClick={() => refetchBooking()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      </div>
    );
  }

  // داده‌های لاگ (Audit Trail): اولویت با logs موجود در جزئیات، در غیر این‌صورت اندپوینت logs
  const logsList: BookingLog[] = (booking.logs && booking.logs.length > 0)
    ? booking.logs
    : (logsData || []);

  const documentsList: BookingDocument[] = booking.documents || [];

  // محاسبه استپر وضعیت
  const currentStatusVal = booking.status?.value;
  const isTerminalStatus = currentStatusVal === "rejected" || currentStatusVal === "expired";
  const currentStepIndex = BOOKING_STEPPER_STEPS.findIndex((s) => s.value === currentStatusVal);

  const allowedActions = booking.allowed_actions || [];

  return (
    <div className="space-y-6">
      {/* نوار ناوبری بالا و عنوان صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
            title="بازگشت به لیست رزروها"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                پرونده رزرو #{toPersianDigits(booking.id)}
              </h2>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ثبت‌شده در تاریخ {formatJalali(booking.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              refetchBooking();
              refetchLogs();
            }}
            disabled={bookingLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${bookingLoading ? "animate-spin" : ""}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* هشدار رد شدن یا منقضی شدن */}
      {currentStatusVal === "rejected" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>این پرونده رزرو رد شده است</span>
          </div>
          {booking.rejection_reason && (
            <p className="pr-6 font-medium leading-relaxed">
              علت رد: <span className="font-bold">{booking.rejection_reason}</span>
            </p>
          )}
        </div>
      )}

      {currentStatusVal === "expired" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="h-4 w-4 shrink-0" />
            <span>مهلت قفل و اقدام این رزرو به پایان رسیده و پرونده منقضی شده است.</span>
          </div>
        </div>
      )}

      {/* استپر مراحل (فقط در صورتی که رزرو رد یا منقضی نباشد) */}
      {!isTerminalStatus && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500">
            گردش‌کار و مراحل پرونده رزرو
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {BOOKING_STEPPER_STEPS.map((step, idx) => {
              const isPassed = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.value}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    isCurrent
                      ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs font-black"
                      : isPassed
                      ? "border-emerald-300 bg-emerald-50/60 text-emerald-800 font-bold"
                      : "border-slate-200 bg-slate-50/60 text-slate-400 opacity-60 font-medium"
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {toPersianDigits(idx + 1)}
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 text-slate-400 text-[10px] font-medium flex items-center justify-center">
                        {toPersianDigits(idx + 1)}
                      </div>
                    )}
                  </div>
                  <span className="block text-xs">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون راست (۲ بخش): اطلاعات پرونده، مدارک، لاگ‌ها */}
        <div className="lg:col-span-2 space-y-6">
          {/* مشخصات خریدار و سازه */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>مشخصات خریدار و سازه تبلیغاتی</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* خریدار */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-slate-400 font-semibold block">خریدار (مشتری):</span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{booking.user?.name || "—"}</span>
                </div>
                {booking.user?.phone && (
                  <p className="text-slate-600 font-mono text-xs">
                    {toPersianDigits(booking.user.phone)}
                  </p>
                )}
                {booking.user_id && (
                  <Link
                    href={`/admin/bookings?client_id=${booking.user_id}`}
                    className="inline-block text-[11px] font-bold text-indigo-600 hover:underline pt-1"
                  >
                    مشاهده سایر رزروهای این کاربر ←
                  </Link>
                )}
              </div>

              {/* سازه */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-slate-400 font-semibold block">سازه انتخابی:</span>
                <Link
                  href={`/structures/${booking.structure?.uuid || booking.structure_id || booking.structure?.id}`}
                  className="font-bold text-indigo-600 hover:underline text-sm block truncate"
                  title={booking.structure?.title}
                >
                  {booking.structure?.title || `سازه #${booking.structure_id}`}
                </Link>
                {booking.structure?.address && (
                  <p className="text-slate-500 text-[11px] leading-relaxed truncate">
                    {booking.structure.address}
                  </p>
                )}
              </div>

              {/* بازه اکران */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">بازه تاریخی اکران:</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    از {formatJalali(booking.start_date)} تا {formatJalali(booking.end_date)}
                  </span>
                </div>
              </div>

              {/* مبلغ کل قرارداد */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">مبلغ کل قرارداد:</span>
                <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>{formatToman(booking.total_amount)}</span>
                </div>
              </div>

              {/* شناسه پرداخت */}
              {booking.payment_reference && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs">
                  <span className="text-indigo-700 font-semibold block mb-0.5">
                    شناسه رهگیری واریز / فیش صیادی:
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {booking.payment_reference}
                  </span>
                </div>
              )}

              {/* مهلت قفل */}
              {booking.locked_until && booking.status?.value === "locked_for_contract" && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <Clock className="h-4 w-4" />
                    <span>مهلت قفل پرونده ۴۸ ساعته:</span>
                  </div>
                  <LockCountdown
                    lockedUntil={booking.locked_until}
                    isLockExpired={booking.is_lock_expired || false}
                    statusValue={booking.status?.value}
                    onExpired={() => refetchBooking()}
                  />
                </div>
              )}
            </div>
          </div>

          {/* لیست اسناد و مدارک پرونده */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>اسناد، پیش‌فاکتورها و مدارک پیوست</span>
            </h3>

            {documentsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                هنوز هیچ مدرکی (پیش‌فاکتور یا فیش پرداخت) برای این پرونده بارگذاری نشده است.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {documentsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {doc.original_filename || `سند #${doc.id}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {doc.document_type || "مدرک"} •{" "}
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                            : "—"}{" "}
                          • {formatJalali(doc.created_at)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc.id)}
                      disabled={downloadingDocId === doc.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                    >
                      {downloadingDocId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>دانلود امن</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تاریخچه و لاگ‌های حسابرسی (Audit Trail) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="h-4 w-4 text-indigo-600" />
              <span>تاریخچه تغییرات و لاگ‌های حسابرسی (Audit Trail)</span>
            </h3>

            {logsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                هنوز لاگ تغییری برای این پرونده ثبت نشده است.
              </p>
            ) : (
              <div className="space-y-3">
                {logsList.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">
                          نقش: {log.user_role || "سیستم"}
                        </span>
                        {log.changed_by_user_id && (
                          <span className="text-slate-400">
                            (شناسه کاربر: {toPersianDigits(log.changed_by_user_id)})
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono">
                        {formatJalali(log.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>{log.from_status?.label || "شروع"}</span>
                      <span className="text-slate-300">←</span>
                      <span className="text-indigo-600">{log.to_status?.label}</span>
                    </div>

                    {log.note && (
                      <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                        {log.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ستون چپ: پنل عملیات مجاز (Action Panel - کاملاً مبتنی بر allowed_actions) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 sticky top-20">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900">
                مرکز عملیات و اختیارات ادمین
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                دکمه‌ها منحصراً بر اساس ماشین وضعیت و اختیارات سرور فعال می‌شوند
              </p>
            </div>

            {allowedActions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                <p className="font-semibold text-slate-600">
                  در حال حاضر هیچ اقدام مجازی برای این پرونده در دسترس نیست.
                </p>
                <p className="text-[11px] text-slate-400">
                  (اقدام توسط طرف مقابل پرونده یا تکمیل فرایند)
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* ۱. lock_for_contract */}
                {allowedActions.includes("lock_for_contract") && (
                  <button
                    type="button"
                    onClick={() => setActiveModal("lock")}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Clock className="h-4 w-4" />
                    <span>تأیید اولیه و قفل قرارداد</span>
                  </button>
                )}

                {/* ۲. issue_proforma */}
                {allowedActions.includes("issue_proforma") && (
                  <button
                    type="button"
                    onClick={() => setActiveModal("proforma")}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>صدور پیش‌فاکتور</span>
                  </button>
                )}

                {/* ۳. approve_payment */}
                {allowedActions.includes("approve_payment") && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>ابتدا مدارک پرداخت را بررسی کنید.</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveModal("approve")}
                      disabled={isSubmitting}
                      className="w-full h-11 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>تأیید پرداخت و شروع اکران</span>
                    </button>
                  </div>
                )}

                {/* ۴. reject */}
                {allowedActions.includes("reject") && (
                  <button
                    type="button"
                    onClick={() => setActiveModal("reject")}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>رد درخواست</span>
                  </button>
                )}

                {/* ۵. complete */}
                {allowedActions.includes("complete") && (
                  <button
                    type="button"
                    onClick={() => setActiveModal("complete")}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>پایان دوره اکران</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* مودال‌های عملیاتی دیالوگ */}
      {/* ============================================================== */}

      {/* مودال ۱: قفل قرارداد */}
      {activeModal === "lock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                تأیید اولیه و قفل قرارداد
              </h4>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 leading-relaxed">
              سازه ۴۸ ساعت قفل می‌شود. در این بازه، دیگر متقاضیان امکان رزرو تداخل‌دار نخواهند داشت.
            </div>

            <form onSubmit={handleLockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  یادداشت ادمین (اختیاری)
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="توضیحات و شرایط مورد نظر جهت ثبت در پرونده..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
                {fieldErrors.note && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.note}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>تأیید و اعمال قفل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ۲: صدور پیش‌فاکتور با آپلود فایل الزامی */}
      {activeModal === "proforma" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                صدور و بارگذاری پیش‌فاکتور
              </h4>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProformaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  فایل پیش‌فاکتور رسمی (الزامی: PDF یا تصویر، حداکثر ۱۰MB)
                </label>
                <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600 justify-center">
                      <label className="relative cursor-pointer font-bold text-indigo-600 hover:text-indigo-500">
                        <span>انتخاب فایل پیش‌فاکتور</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setProformaFile(e.target.files[0]);
                              setFieldErrors((prev) => ({ ...prev, document: "" }));
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400">PDF, PNG, JPG تا حداکثر ۱۰MB</p>
                  </div>
                </div>

                {proformaFile && (
                  <div className="mt-2 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
                    <div className="truncate min-w-0 pr-1">
                      <span className="font-bold text-indigo-900 block truncate">
                        {proformaFile.name}
                      </span>
                      <span className="text-[11px] text-indigo-700">
                        {(proformaFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProformaFile(null)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="حذف فایل انتخابی"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {fieldErrors.document && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    {fieldErrors.document}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  یادداشت یا توضیحات پیش‌فاکتور (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="شرایط تسویه، شماره حساب یا توضیحات..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
                {fieldErrors.note && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.note}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>صدور و ارسال پیش‌فاکتور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ۳: تایید پرداخت */}
      {activeModal === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                تأیید پرداخت و شروع اکران
              </h4>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed font-semibold">
              یادآوری: لطفاً پیش از تأیید نهایی، رسید واریز یا وضعیت چک صیادی را در بخش اسناد پرونده بررسی فرمایید.
            </div>

            <form onSubmit={handleApprovePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  یادداشت مالی / اداری (اختیاری)
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="توضیحات تأیید واریز یا شماره سند حسابداری..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
                {fieldErrors.note && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.note}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>تأیید نهایی پرداخت و اکران</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ۴: رد درخواست */}
      {activeModal === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                رد درخواست رزرو
              </h4>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              دلیل رد درخواست ثبت شده و به مشتری نمایش داده خواهد شد.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  دلیل رد پرونده (الزامی) *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (fieldErrors.reason) setFieldErrors((prev) => ({ ...prev, reason: "" }));
                  }}
                  placeholder="علت رد درخواست (مثال: عدم تایید طرح فرهنگی، پر بودن بازه زمانی، نقص مدارک...)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-rose-500 focus:outline-none"
                />
                {fieldErrors.reason && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    {fieldErrors.reason}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>ثبت و رد درخواست</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ۵: پایان دوره اکران */}
      {activeModal === "complete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                پایان دوره اکران سازه
              </h4>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              با این اقدام، پرونده رزرو به وضعیت «پایان‌یافته» (completed) منتقل شده و دوره اکران آن خاتمه می‌یابد.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  یادداشت تکمیل پرونده (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="گزارش پایان اکران یا یادداشت پایانی..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
                {fieldErrors.note && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.note}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black disabled:opacity-50 rounded-xl flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>تأیید و پایان اکران</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
