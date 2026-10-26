"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Building,
  User,
  History,
  X,
  RefreshCw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { AdminBooking, BookingAuditLog } from "../types";
import {
  useAdminBookingDetailQuery,
  useAdminBookingLogsQuery,
  useLockBookingMutation,
  useIssueProformaMutation,
  useApprovePaymentMutation,
  useRejectBookingMutation,
  useTransitionBookingMutation,
} from "../hooks/useAdmin";

interface AdminBookingActionCenterViewProps {
  bookingId: string;
}

export default function AdminBookingActionCenterView({
  bookingId,
}: AdminBookingActionCenterViewProps) {
  // واکشی داده‌های رزرو و لاگ‌ها از TanStack Query
  const {
    data: bookingRes,
    isLoading: bookingLoading,
    refetch: refetchBooking,
  } = useAdminBookingDetailQuery(bookingId);

  const {
    data: logsRes,
    refetch: refetchLogs,
  } = useAdminBookingLogsQuery(bookingId);

  const lockMutation = useLockBookingMutation();
  const proformaMutation = useIssueProformaMutation();
  const approvePaymentMutation = useApprovePaymentMutation();
  const rejectMutation = useRejectBookingMutation();
  const transitionMutation = useTransitionBookingMutation();

  const booking: AdminBooking | null = bookingRes?.data || null;
  const logs: BookingAuditLog[] = logsRes?.data || [];
  const loading = bookingLoading && !booking;

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // وضعیت مودال‌ها
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [proformaModalOpen, setProformaModalOpen] = useState(false);
  const [approvePaymentModalOpen, setApprovePaymentModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);

  // فرم پیش‌فاکتور
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [invoiceFileUrl, setInvoiceFileUrl] = useState("");

  // فرم رد درخواست
  const [rejectionReason, setRejectionReason] = useState("");

  // فرم تایید پرداخت
  const [financialApprovalNote, setFinancialApprovalNote] = useState("");

  // فرم تغییر وضعیت دستی
  const [newStatusValue, setNewStatusValue] = useState("");
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [transitionNote, setTransitionNote] = useState("");

  const handleOpenProformaModal = () => {
    if (booking) {
      setInvoiceAmount(booking.totalPrice || 0);
      setInvoiceNumber(`PF-${new Date().getFullYear()}-${booking.id.replace("BK-", "")}`);
    }
    setProformaModalOpen(true);
  };


  const fetchData = () => {
    refetchBooking();
    refetchLogs();
  };

  const actionLoading =
    lockMutation.isPending ||
    proformaMutation.isPending ||
    approvePaymentMutation.isPending ||
    rejectMutation.isPending ||
    transitionMutation.isPending;

  // عملیات: قفل ۴۸ ساعته
  const handleLock = async () => {
    try {
      const res = await lockMutation.mutateAsync(bookingId);
      if (res.success) {
        toast.success(res.message || "قفل ۴۸ ساعته سازه با موفقیت فعال گردید.");
        setFeedback({ type: "success", message: res.message || "قفل ۴۸ ساعته سازه با موفقیت فعال گردید." });
        setLockModalOpen(false);
      } else {
        toast.error(res.message || "خطا در اعمال قفل سازه");
        setFeedback({ type: "error", message: res.message || "خطا در اعمال قفل سازه" });
      }
    } catch {
      toast.error("خطای ناشناخته در اعمال قفل");
      setFeedback({ type: "error", message: "خطای ناشناخته در اعمال قفل" });
    }
  };

  // عملیات: صدور پیش‌فاکتور
  const handleIssueProforma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      toast.error("لطفاً شماره پیش‌فاکتور را وارد فرمایید.");
      setFeedback({ type: "error", message: "لطفاً شماره پیش‌فاکتور را وارد فرمایید." });
      return;
    }
    try {
      const res = await proformaMutation.mutateAsync({
        bookingId,
        payload: {
          invoiceNumber: invoiceNumber.trim(),
          amount: Number(invoiceAmount) || booking?.totalPrice || 0,
          fileUrl: invoiceFileUrl.trim() || undefined,
        },
      });
      if (res.success) {
        toast.success(res.message || "پیش‌فاکتور رسمی با موفقیت صادر شد.");
        setFeedback({ type: "success", message: res.message || "پیش‌فاکتور رسمی با موفقیت صادر شد." });
        setProformaModalOpen(false);
      } else {
        toast.error(res.message || "خطا در صدور پیش‌فاکتور");
        setFeedback({ type: "error", message: res.message || "خطا در صدور پیش‌فاکتور" });
      }
    } catch {
      toast.error("خطای ارتباط با سرور در صدور پیش‌فاکتور");
      setFeedback({ type: "error", message: "خطای ارتباط با سرور در صدور پیش‌فاکتور" });
    }
  };

  // عملیات: تایید نهایی پرداخت و اکران
  const handleApprovePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await approvePaymentMutation.mutateAsync({
        bookingId,
        approvalNote: financialApprovalNote.trim(),
      });
      if (res.success) {
        toast.success(res.message || "پرداخت تایید شد و مجوز اکران صادر گردید.");
        setFeedback({ type: "success", message: res.message || "پرداخت تایید شد و مجوز اکران صادر گردید." });
        setApprovePaymentModalOpen(false);
      } else {
        toast.error(res.message || "خطا در تایید مالی پرداخت");
        setFeedback({ type: "error", message: res.message || "خطا در تایید مالی پرداخت" });
      }
    } catch {
      toast.error("خطای ارتباط با سرور در تایید پرداخت");
      setFeedback({ type: "error", message: "خطای ارتباط با سرور در تایید پرداخت" });
    }
  };

  // عملیات: رد رزرو با ذکر علت
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("ذکر علت رد درخواست رزرو الزامی است.");
      setFeedback({ type: "error", message: "ذکر علت رد درخواست رزرو الزامی است." });
      return;
    }
    try {
      const res = await rejectMutation.mutateAsync({
        bookingId,
        reason: rejectionReason.trim(),
      });
      if (res.success) {
        toast.success(res.message || "درخواست رزرو رد شد و در سوابق ذخیره گردید.");
        setFeedback({ type: "success", message: res.message || "درخواست رزرو رد شد و در سوابق ذخیره گردید." });
        setRejectModalOpen(false);
      } else {
        toast.error(res.message || "خطا در ثبت رد درخواست");
        setFeedback({ type: "error", message: res.message || "خطا در ثبت رد درخواست" });
      }
    } catch {
      toast.error("خطای سرور در رد درخواست");
      setFeedback({ type: "error", message: "خطای سرور در رد درخواست" });
    }
  };

  // عملیات: تغییر وضعیت دستی
  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusValue) {
      toast.error("لطفاً وضعیت مقصد را انتخاب فرمایید.");
      setFeedback({ type: "error", message: "لطفاً وضعیت مقصد را انتخاب فرمایید." });
      return;
    }
    try {
      const res = await transitionMutation.mutateAsync({
        bookingId,
        status: newStatusValue,
        statusLabel: newStatusLabel || undefined,
        note: transitionNote.trim() || undefined,
      });
      if (res.success) {
        toast.success(res.message || "وضعیت پرونده با موفقیت تغییر یافت.");
        setFeedback({ type: "success", message: res.message || "وضعیت پرونده با موفقیت تغییر یافت." });
        setTransitionModalOpen(false);
      } else {
        toast.error(res.message || "خطا در تغییر وضعیت پرونده");
        setFeedback({ type: "error", message: res.message || "خطا در تغییر وضعیت پرونده" });
      }
    } catch {
      toast.error("خطای سرور در تغییر وضعیت");
      setFeedback({ type: "error", message: "خطای سرور در تغییر وضعیت" });
    }
  };

  // دانلود امن مستندات
  const handleSecureDownload = async (documentId: string) => {
    try {
      const url = `/api/v1/admin/bookings/documents/${documentId}/download?format=file`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error opening document:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-bold text-slate-600">
          در حال بارگذاری مرکز عملیات و پرونده رزرو {bookingId}...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-600 mx-auto" />
        <h3 className="text-lg font-black text-rose-900">
          رزرو مورد نظر یافت نشد
        </h3>
        <p className="text-xs text-rose-700 font-medium">
          ممکن است شناسه پرونده نادرست باشد یا توسط مدیر دیگری حذف شده باشد.
        </p>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به فهرست کل رزروها</span>
        </Link>
      </div>
    );
  }

  const customerName = booking.customer?.fullName || booking.contactPerson || "مشتری سازمانی";
  const brandName = booking.customer?.companyName || booking.brandName;
  const phone = booking.customer?.phone || booking.contactPhone;

  return (
    <div className="space-y-6">
      {/* پیام بازخورد و نوتیفیکیشن */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold animate-in fade-in duration-200 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* نوار ناوبری بالا و بازگشت */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            title="بازگشت به لیست رزروها"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                مرکز عملیات رزرو {booking.id}
              </h2>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {booking.trackingCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              متقاضی: {brandName} ({customerName}) • ثبت در {booking.createdAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* دکمه به‌روزرسانی زنده */}
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            title="تازه‌سازی اطلاعات"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
            <span>تازه‌سازی</span>
          </button>

          {/* دکمه تغییر وضعیت دستی */}
          <button
            type="button"
            onClick={() => setTransitionModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <History className="h-4 w-4 text-slate-500" />
            <span>تغییر وضعیت دستی</span>
          </button>

          {/* دکمه رد پرونده */}
          <button
            type="button"
            onClick={() => setRejectModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>رد درخواست</span>
          </button>
        </div>
      </div>

      {/* بخش کارت وضعیت و اقدامات فوری عملیاتی */}
      <div className="rounded-2xl border border-indigo-200/80 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                وضعیت فعلی پرونده:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-black text-white border border-indigo-400/30">
                <Clock className="h-3.5 w-3.5 text-indigo-300" />
                {booking.status.label}
              </span>
              {booking.lockedUntil && (
                <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-300/30">
                  مهلت قفل: {booking.lockedUntil}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-indigo-300 block font-medium">مبلغ کل قرارداد</span>
                <span className="text-lg font-black text-white">
                  {booking.totalPrice.toLocaleString("fa-IR")}{" "}
                  <span className="text-xs font-normal text-indigo-200">تومان</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-300 block font-medium">مدت اکران</span>
                <span className="text-lg font-black text-white">
                  {booking.durationDays.toLocaleString("fa-IR")}{" "}
                  <span className="text-xs font-normal text-indigo-200">روز</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-300 block font-medium">بازه اکران</span>
                <span className="text-xs font-bold text-white block mt-1">
                  از {booking.startDate} تا {booking.endDate}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-300 block font-medium">سازه درخواستی</span>
                <span className="text-xs font-bold text-white block mt-1 truncate max-w-xs">
                  {booking.structure.title}
                </span>
              </div>
            </div>
          </div>

          {/* اکشن‌های عملیاتی فوری */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-indigo-800/80">
            {/* ۱. دکمه تایید اولیه و قفل ۴۸ ساعته */}
            <button
              type="button"
              onClick={() => setLockModalOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-102"
            >
              <Lock className="h-4 w-4" />
              <span>تایید اولیه و قفل ۴۸ ساعته</span>
            </button>

            {/* ۲. دکمه صدور و آپلود پیش‌فاکتور */}
            <button
              type="button"
              onClick={handleOpenProformaModal}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-indigo-400 transition-all hover:scale-102"
            >
              <FileText className="h-4 w-4" />
              <span>صدور و آپلود پیش‌فاکتور</span>
            </button>

            {/* ۳. دکمه تایید نهایی پرداخت */}
            <button
              type="button"
              onClick={() => setApprovePaymentModalOpen(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-emerald-500 transition-all hover:scale-102"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>تایید نهایی پرداخت و اکران</span>
            </button>
          </div>
        </div>
      </div>

      {/* شبکه دو ستونه مشخصات و جزئیات مالی */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ستون راست (۲ واحد): اطلاعات سازه، اسناد و پرداخت‌ها */}
        <div className="lg:col-span-2 space-y-6">
          {/* کارت مشخصات سازه تبلیغاتی */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-600" />
              <span>مشخصات فنی و مکانی سازه تبلیغاتی</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {booking.structure.image && (
                <img
                  src={booking.structure.image}
                  alt={booking.structure.title}
                  className="h-28 w-40 shrink-0 rounded-xl object-cover border border-slate-200"
                />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    {booking.structure.title}
                  </h4>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                    {booking.structure.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {booking.structure.address} ({booking.structure.district})
                </p>
                <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-bold">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
                    نوع: {booking.structure.type}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
                    دسته‌بندی: {booking.structure.category}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
                    ابعاد: {booking.structure.dimensions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* بررسی فیش‌ها و اسناد واریزی مشتری (Payment Review Section) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span>بررسی فیش‌ها و اسناد مالی واریز شده مشتری</span>
              </h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {booking.payments.length.toLocaleString("fa-IR")} سند پرداختی
              </span>
            </div>

            {booking.payments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 font-medium">
                هنوز هیچ فیش ساتنا یا چک صیادی توسط مشتری بارگذاری نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {p.amount.toLocaleString("fa-IR")} تومان
                        </span>
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                          {p.methodLabel}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            p.status === "verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "pending_verification"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {p.bankName ? `بانک مقصد: ${p.bankName} • ` : ""}
                        {p.trackingCode ? `کد رهگیری بانکی: ${p.trackingCode} • ` : ""}
                        {p.checkSayadId ? `شناسه صیادی چک: ${p.checkSayadId} • ` : ""}
                        <span>ثبت در: {p.submittedAt}</span>
                      </p>
                      {p.notes && (
                        <p className="text-[11px] text-slate-500 italic">
                          توضیحات واریزکننده: {p.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSecureDownload(p.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>دانلود تصویر فیش واریز</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* اسناد رسمی پرونده (پیش‌فاکتور، قرارداد، حواله نصب) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>مستندات و پیش‌فاکتورهای رسمی سامانه</span>
            </h3>

            {booking.documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 font-medium">
                سندی برای این رزرو صادر نشده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {booking.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {doc.typeLabel} • {doc.fileSize}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSecureDownload(doc.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white transition-colors"
                      title="دانلود امن فایل"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* لاگ بازرسی و تاریخچه گردش‌کار (Audit Trail Table - GET /logs) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" />
                <span>گزارش کامل رویدادها و لاگ‌های بازرسی (Audit Trail)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {logs.length.toLocaleString("fa-IR")} رویداد ثبت شده
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">مجری / کاربر</th>
                    <th className="py-2.5 px-3">عنوان اقدام</th>
                    <th className="py-2.5 px-3">وضعیت قبلی / جدید</th>
                    <th className="py-2.5 px-3">زمان ثبت</th>
                    <th className="py-2.5 px-3">توضیحات و یادداشت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {log.actor}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-mono whitespace-nowrap">
                        {log.previousStatus ? (
                          <span>
                            {log.previousStatus} &larr; {log.newStatus}
                          </span>
                        ) : (
                          <span>{log.newStatus}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {log.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ستون چپ (۱ واحد): اطلاعات مشتری و فرآیند پرونده */}
        <div className="space-y-6">
          {/* کارت مشخصات مشتری */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              <span>اطلاعات مشتری و طرف قرارداد</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">نام و عنوان برند:</span>
                <span className="font-bold text-slate-900">{brandName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">شخص رابط:</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">شماره تماس:</span>
                <span className="font-mono font-bold text-slate-900">{phone || "ثبت نشده"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">شناسه پرونده:</span>
                <span className="font-mono font-bold text-slate-900">{booking.id}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">کد پیگیری سیستمی:</span>
                <span className="font-mono font-bold text-indigo-700">{booking.trackingCode}</span>
              </div>
            </div>
          </div>

          {/* تایم‌لاین مراحل چرخه عمر رزرو */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>تایم‌لاین گردش‌کار پرونده</span>
            </h3>

            <div className="relative border-r border-slate-200 mr-2 space-y-4 pr-4">
              {booking.timeline.map((item) => (
                <div key={item.id} className="relative">
                  <span
                    className={`absolute -right-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      item.isDone
                        ? "bg-emerald-500 ring-2 ring-emerald-100"
                        : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                      <span>مجری: {item.actor}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ۱. مودال تایید اولیه و قفل ۴۸ ساعته */}
      {lockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>تایید اولیه و قفل ۴۸ ساعته سازه</span>
              </h3>
              <button
                type="button"
                onClick={() => setLockModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              آیا از تایید اولیه این رزرو و اعمال قفل اختصاصی ۴۸ ساعته برای سازه{" "}
              <strong className="text-slate-900 font-bold">{booking.structure.code}</strong> اطمینان دارید؟ در این مدت سازه از دسترس سایر مشتریان خارج خواهد شد تا مشتری مراحل پیش‌فاکتور و واریز وجه را انجام دهد.
            </p>

            <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800 font-medium">
              ⏱ مهلت ۴۸ ساعته تا تاریخ دو روز آینده محاسبه و ثبت خواهد گردید.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLockModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleLock}
                disabled={actionLoading}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "در حال ثبت قفل..." : "تایید و اعمال قفل ۴۸ ساعته"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ۲. مودال صدور و آپلود پیش‌فاکتور رسمی */}
      {proformaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>صدور و بارگذاری پیش‌فاکتور رسمی</span>
              </h3>
              <button
                type="button"
                onClick={() => setProformaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssueProforma} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  شماره رسمی پیش‌فاکتور *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="PF-1403-1029"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  مبلغ پیش‌فاکتور (تومان) *
                </label>
                <input
                  type="number"
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  لینک فایل رسمی PDF پیش‌فاکتور یا شناسه فایل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={invoiceFileUrl}
                    onChange={(e) => setInvoiceFileUrl(e.target.value)}
                    placeholder="https://oohaiplatform.ir/storage/invoices/pf-9120.pdf"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3 font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <Upload className="absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  در صورت خالی ماندن، پیش‌فاکتور استاندارد پلتفرم OOHAI به شکل خودکار تولید خواهد گردید.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProformaModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "در حال ثبت پیش‌فاکتور..." : "ثبت و ارسال به کارتابل مشتری"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ۳. مودال تایید نهایی پرداخت و مجوز اکران */}
      {approvePaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>تایید نهایی پرداخت و مجوز اکران</span>
              </h3>
              <button
                type="button"
                onClick={() => setApprovePaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              با تایید پرداخت، وضعیت پرونده به <strong className="text-emerald-700 font-bold">تایید شده / اکران</strong> ارتقا یافته و حواله نصب برای چاپخانه و مجری ارسال می‌گردد.
            </p>

            <form onSubmit={handleApprovePayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  یادداشت مدیر مالی / کد سند حسابداری (اختیاری)
                </label>
                <textarea
                  rows={3}
                  value={financialApprovalNote}
                  onChange={(e) => setFinancialApprovalNote(e.target.value)}
                  placeholder="واریز وجه به حساب جام بانک ملت تایید شد. شماره سند: ACC-9941"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApprovePaymentModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "در حال تایید..." : "تایید مالی و صدور مجوز اکران"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ۴. مودال رد درخواست با فیلد اجباری علت */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>رد درخواست رزرو</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  علت رد درخواست (الزامی برای اطلاع مشتری) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: عدم تایید طرح فرهنگی توسط اداره کل فرهنگ و ارشاد اسلامی / تداخل بازه اکران با کمپین ملی..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "در حال ثبت رد..." : "تایید رد درخواست رزرو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ۵. مودال تغییر وضعیت دستی توسط اپراتور */}
      {transitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" />
                <span>تغییر وضعیت دستی (ماشین حالت)</span>
              </h3>
              <button
                type="button"
                onClick={() => setTransitionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTransition} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  وضعیت مقصد *
                </label>
                <select
                  required
                  value={newStatusValue}
                  onChange={(e) => {
                    setNewStatusValue(e.target.value);
                    const opt = e.target.selectedOptions[0];
                    if (opt) setNewStatusLabel(opt.text);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">انتخاب وضعیت جدید...</option>
                  <option value="pending_review">در انتظار تایید اولیه</option>
                  <option value="locked_for_contract">قفل ۴۸ ساعته سازه</option>
                  <option value="proforma_issued">پیش‌فاکتور صادر شده</option>
                  <option value="payment_submitted">فیش پرداخت ثبت شده</option>
                  <option value="approved">تایید نهایی و مجوز اکران</option>
                  <option value="active">در حال اکران روی سازه</option>
                  <option value="completed">پایان دوره اکران</option>
                  <option value="rejected">رد شده</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  یادداشت تغییر وضعیت (در لاگ بازرسی ثبت می‌شود)
                </label>
                <textarea
                  rows={3}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="تغییر دستی وضعیت بر اساس هماهنگی تلفنی با متقاضی..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransitionModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "در حال اعمال..." : "ثبت انتقال وضعیت"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
