"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  Loader2,
  AlertCircle,
  Search,
  ExternalLink,
  Inbox,
  AlertTriangle,
  Ban,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  type MediaOwnerRequestItem,
  formatDate,
  getStatusBadge,
  extractRequestsList,
  DEFAULT_SAMPLE_REQUESTS,
} from "./types";

export type { MediaOwnerRequestItem };

const STATUS_ICONS = {
  approved: CheckCircle,
  rejected: XCircle,
  pending: Clock,
};

interface RequestsTableProps {
  initialRequests?: MediaOwnerRequestItem[];
}

export default function RequestsTable({ initialRequests = [] }: RequestsTableProps) {
  const [requests, setRequests] = useState<MediaOwnerRequestItem[]>(() => {
    if (initialRequests && initialRequests.length > 0) {
      return initialRequests;
    }
    return DEFAULT_SAMPLE_REQUESTS;
  });
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MediaOwnerRequestItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // وضعیت‌های مربوط به مودال رد درخواست
  const [rejectingItem, setRejectingItem] = useState<MediaOwnerRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  // دریافت آخرین تغییرات از سرور در صورت امکان پس از لود صفحه
  useEffect(() => {
    let active = true;

    async function fetchOnMount() {
      try {
        const res = await fetch("/api/v1/admin/media-owner-requests");
        if (res.ok) {
          const json = await res.json().catch(() => null);
          const list = extractRequestsList(json);
          if (active && list.length > 0) {
            setRequests(list);
          }
        }
      } catch {
        // در صورت عدم دسترسی به سرور، داده‌های فعلی حفظ می‌شوند
      }
    }

    fetchOnMount();

    return () => {
      active = false;
    };
  }, []);

  // بارگذاری دستی مجدد داده‌ها از سمت کلاینت با دکمه رفرش
  const loadRequests = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/admin/media-owner-requests");
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const list = extractRequestsList(json);
        if (list.length > 0) {
          setRequests(list);
        }
      }
    } catch {
      // در صورت خطای کلاینت، داده‌های فعلی حفظ می‌شوند
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // باز کردن فرم رد درخواست
  const handleOpenRejectModal = (item: MediaOwnerRequestItem) => {
    setRejectingItem(item);
    setRejectionReason("");
    setRejectionError("");
  };

  // دکمه تستی بلاک برای تایید شده‌ها
  const handleBlockTest = (item: MediaOwnerRequestItem) => {
    const compName = item.company_name || item.company || "مالک رسانه";
    setFeedback({
      type: "info",
      message: `دکمه «بلاک» برای «${compName}» تستی است و در حال حاضر تغییری در سیستم اعمال نمی‌کند.`,
    });
  };

  // عملیات تایید درخواست
  const handleApprove = async (id: string | number) => {
    setProcessingId(id);
    setActionType("approve");
    setFeedback(null);

    try {
      const res = await fetch(`/api/v1/admin/media-owner-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data?.message || "خطا در تایید درخواست همکاری.",
        });
        return;
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );

      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: "approved" });
      }

      setFeedback({
        type: "success",
        message: data?.message || "درخواست همکاری با موفقیت تایید شد.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "خطا در برقراری ارتباط با سرور. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  // ثبت نهایی رد درخواست به همراه ارسال دلیل (حداکثر ۵۰۰ کاراکتر)
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;

    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      setRejectionError("لطفاً دلیل رد درخواست را وارد کنید.");
      return;
    }

    if (trimmedReason.length > 500) {
      setRejectionError("دلیل رد درخواست نمی‌تواند بیش از ۵۰۰ کاراکتر باشد.");
      return;
    }

    setProcessingId(rejectingItem.id);
    setActionType("reject");
    setRejectionError("");

    try {
      const res = await fetch(`/api/v1/admin/media-owner-requests/${rejectingItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: trimmedReason,
          rejection_reason: trimmedReason,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setRejectionError(data?.message || "خطا در رد درخواست همکاری.");
        return;
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === rejectingItem.id
            ? { ...item, status: "rejected", rejection_reason: trimmedReason }
            : item
        )
      );

      if (selectedRequest && selectedRequest.id === rejectingItem.id) {
        setSelectedRequest({
          ...selectedRequest,
          status: "rejected",
          rejection_reason: trimmedReason,
        });
      }

      setFeedback({
        type: "success",
        message: data?.message || "درخواست همکاری با موفقیت رد شد.",
      });

      setRejectingItem(null);
      setRejectionReason("");
    } catch {
      setRejectionError("خطا در برقراری ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  // فیلتر کردن درخواست‌ها
  const filteredRequests = requests.filter((item) => {
    const badge = getStatusBadge(item.status);
    if (activeFilter !== "all" && badge.key !== activeFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const comp = (item.company_name || item.company || "").toLowerCase();
      const nat = (item.national_id || item.national_code || "").toLowerCase();
      return comp.includes(query) || nat.includes(query);
    }

    return true;
  });

  const countByFilter = {
    all: requests.length,
    pending: requests.filter((r) => getStatusBadge(r.status).key === "pending").length,
    approved: requests.filter((r) => getStatusBadge(r.status).key === "approved").length,
    rejected: requests.filter((r) => getStatusBadge(r.status).key === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* پیام بازخورد (موفقیت، خطا یا اعلان تستی) */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold transition-all ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : feedback.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            ) : (
              <Info className="h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="rounded p-1 hover:bg-black/5"
            title="بستن"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* نوار جستجو و تب‌های فیلتر */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* فیلترها */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-white p-1 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>همه</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {countByFilter.all.toLocaleString("fa-IR")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeFilter === "pending"
                ? "bg-amber-500 text-white font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>در انتظار</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {countByFilter.pending.toLocaleString("fa-IR")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("approved")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeFilter === "approved"
                ? "bg-emerald-600 text-white font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>تایید شده</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {countByFilter.approved.toLocaleString("fa-IR")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("rejected")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeFilter === "rejected"
                ? "bg-red-600 text-white font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>رد شده</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {countByFilter.rejected.toLocaleString("fa-IR")}
            </span>
          </button>
        </div>

        {/* فیلد جستجو و دکمه بروزرسانی */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRequests}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs disabled:opacity-50"
            title="بروزرسانی داده‌ها از سرور"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>

          <div className="relative min-w-48 sm:min-w-56">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در کمپانی یا شماره ملی..."
              className="w-full rounded-xl border border-border bg-white py-1.5 pr-8 pl-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* اگر موردی یافت نشد */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-sm font-bold text-foreground">هیچ درخواستی در این وضعیت یافت نشد</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeFilter !== "all"
              ? "در این فیلتر هیچ درخواستی وجود ندارد. تب «همه» را بررسی کنید."
              : "هنوز درخواستی از طرف مالکان رسانه ثبت نشده است."}
          </p>
        </div>
      ) : (
        /* جدول درخواست‌ها */
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 pr-4 pl-3">ردیف</th>
                  <th className="py-3.5 px-3">نام کمپانی</th>
                  <th className="py-3.5 px-3">شماره ملی</th>
                  <th className="py-3.5 px-3">اسناد</th>
                  <th className="py-3.5 px-3">تاریخ ثبت</th>
                  <th className="py-3.5 px-3">وضعیت</th>
                  <th className="py-3.5 pl-4 pr-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((item, index) => {
                  const compName = item.company_name || item.company || "—";
                  const natId = item.national_id || item.national_code || "—";
                  const docsCount = Array.isArray(item.documents) ? item.documents.length : 0;
                  const badge = getStatusBadge(item.status);
                  const StatusIcon = STATUS_ICONS[badge.key] || Clock;
                  const isProcessing = processingId === item.id;
                  const isApproved = badge.key === "approved";

                  return (
                    <tr key={item.id ?? index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-4 pl-3 text-xs text-muted-foreground">
                        {(index + 1).toLocaleString("fa-IR")}
                      </td>

                      <td className="py-4 px-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate max-w-44">{compName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3 font-mono text-xs text-foreground">
                        {natId}
                      </td>

                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          {docsCount.toLocaleString("fa-IR")} مدرک
                        </span>
                      </td>

                      <td className="py-4 px-3 text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      </td>

                      {/* دکمه‌های اقدام: در تایید شده‌ها دکمه رد وجود ندارد، بلکه فقط دکمه بلاک (تستی) است */}
                      <td className="py-4 pl-4 pr-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {isApproved ? (
                            /* در وضعیت تایید شده: دکمه بلاک (تستی) به جای رد */
                            <button
                              type="button"
                              onClick={() => handleBlockTest(item)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:scale-95 transition-all shadow-2xs"
                              title="بلاک کردن مالک رسانه (تستی)"
                            >
                              <Ban className="h-3.5 w-3.5 text-rose-600" />
                              <span>بلاک</span>
                            </button>
                          ) : (
                            /* در وضعیت غیر از تایید شده: دکمه‌های تایید و رد */
                            <>
                              {/* دکمه تایید (Approve) */}
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleApprove(item.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-all shadow-2xs"
                                title="تایید درخواست همکاری"
                              >
                                {isProcessing && actionType === "approve" ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline">تایید</span>
                              </button>

                              {/* دکمه رد (Reject) - باز کردن مودال ثبت دلیل رد */}
                              <button
                                type="button"
                                disabled={isProcessing || badge.key === "rejected"}
                                onClick={() => handleOpenRejectModal(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40 transition-all shadow-2xs"
                                title="رد درخواست همکاری"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">رد</span>
                              </button>
                            </>
                          )}

                          {/* مشاهده جزئیات */}
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs"
                            title="مشاهده جزئیات و مدارک"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── مودال رد درخواست به همراه فیلد دلیل رد (حداکثر ۵۰۰ کاراکتر) ── */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* هدر مودال رد */}
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">رد درخواست همکاری مالک</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-64">
                    {rejectingItem.company_name || rejectingItem.company}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* خطای اعتبارسنجی دلیل */}
            {rejectionError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{rejectionError}</span>
              </div>
            )}

            {/* فیلد دلیل رد درخواست */}
            <div className="space-y-1.5 text-right">
              <div className="flex items-center justify-between">
                <label htmlFor="rejectionReason" className="block text-xs font-bold text-foreground">
                  علت رد درخواست <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-semibold ${
                    rejectionReason.length > 480
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {rejectionReason.length.toLocaleString("fa-IR")} / ۵۰۰ کاراکتر
                </span>
              </div>

              <textarea
                id="rejectionReason"
                rows={4}
                maxLength={500}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value.slice(0, 500));
                  if (rejectionError) setRejectionError("");
                }}
                placeholder="علت رد درخواست را جهت اطلاع متقاضی و ثبت در سوابق سیستم بنویسید (حداکثر ۵۰۰ کاراکتر)..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                این پیام به متقاضی نمایش داده خواهد شد تا در صورت نیاز مدارک خود را تصحیح نماید.
              </p>
            </div>

            {/* دکمه‌های اقدام رد */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                disabled={processingId === rejectingItem.id}
                onClick={() => setRejectingItem(null)}
                className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={processingId === rejectingItem.id || !rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {processingId === rejectingItem.id && actionType === "reject" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>در حال ارسال...</span>
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5" />
                    <span>ثبت و رد درخواست</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── مودال جزئیات درخواست ── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* هدر مودال */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    جزئیات درخواست همکاری مالک
                  </h3>
                  <p className="text-xs text-muted-foreground">شناسه درخواست: {selectedRequest.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* محتوای مودال */}
            <div className="space-y-3.5 text-xs text-right">
              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-muted-foreground font-medium">نام کمپانی:</span>
                <span className="font-bold text-foreground">
                  {selectedRequest.company_name || selectedRequest.company || "—"}
                </span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-muted-foreground font-medium">شماره ملی:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedRequest.national_id || selectedRequest.national_code || "—"}
                </span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-muted-foreground font-medium">تاریخ ثبت:</span>
                <span className="text-foreground">{formatDate(selectedRequest.created_at)}</span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-muted-foreground font-medium">وضعیت فعلی:</span>
                <div>
                  {(() => {
                    const badge = getStatusBadge(selectedRequest.status);
                    const StatusIcon = STATUS_ICONS[badge.key] || Clock;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {(selectedRequest.rejection_reason || selectedRequest.reason) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1 text-red-900">
                  <span className="font-bold block">دلیل رد درخواست:</span>
                  <p className="leading-relaxed">
                    {selectedRequest.rejection_reason || selectedRequest.reason}
                  </p>
                </div>
              )}

              {selectedRequest.description && (
                <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium block">توضیحات:</span>
                  <p className="text-foreground leading-relaxed">{selectedRequest.description}</p>
                </div>
              )}

              {/* اسناد و فایل‌ها */}
              <div className="rounded-xl border border-border p-3 space-y-2">
                <span className="text-muted-foreground font-semibold block">
                  اسناد پیوست شده ({Array.isArray(selectedRequest.documents) ? selectedRequest.documents.length : 0} فایل):
                </span>

                {Array.isArray(selectedRequest.documents) && selectedRequest.documents.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedRequest.documents.map((doc, idx) => {
                      const docName = typeof doc === "object" ? (doc.name || `سند شماره ${idx + 1}`) : `سند شماره ${idx + 1}`;
                      const docUrl = typeof doc === "object" ? (doc.url || doc.path) : doc;

                      return (
                        <li
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-foreground"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{docName}</span>
                          </div>

                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline shrink-0"
                            >
                              <span>مشاهده</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-[11px]">هیچ فایلی برای این درخواست پیوست نشده است.</p>
                )}
              </div>
            </div>

            {/* دکمه‌های اقدام داخل مودال */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                بستن
              </button>

              {getStatusBadge(selectedRequest.status).key === "approved" ? (
                /* در صورت تایید شده بودن: دکمه بلاک تستی */
                <button
                  type="button"
                  onClick={() => {
                    handleBlockTest(selectedRequest);
                    setSelectedRequest(null);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-2xs"
                  title="بلاک کردن مالک رسانه (تستی)"
                >
                  <Ban className="h-3.5 w-3.5 text-rose-600" />
                  <span>بلاک</span>
                </button>
              ) : (
                /* در غیر این صورت: دکمه‌های رد و تایید */
                <>
                  <button
                    type="button"
                    disabled={processingId === selectedRequest.id}
                    onClick={() => {
                      const target = selectedRequest;
                      setSelectedRequest(null);
                      handleOpenRejectModal(target);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>رد درخواست</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingId === selectedRequest.id}
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {processingId === selectedRequest.id && actionType === "approve" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>تایید درخواست</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
