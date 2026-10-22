"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  FileText,
  MapPin,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import { AdminMediaOwnerRequest } from "@/types/admin-dashboard";
import {
  getAdminMediaOwnerRequests,
  approveMediaOwnerRequest,
  rejectMediaOwnerRequest,
} from "@/lib/admin-api";

export default function AdminMediaOwnerRequestsView() {
  const [requests, setRequests] = useState<AdminMediaOwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedRequest, setSelectedRequest] = useState<AdminMediaOwnerRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // وضعیت مودال رد
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetRejectId, setTargetRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getAdminMediaOwnerRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error("Error loading media owner requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminMediaOwnerRequests().then((res) => {
      if (isMounted && res.success && res.data) {
        setRequests(res.data);
      }
    }).catch((err) => {
      console.error("Error loading media owner requests:", err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // تایید درخواست همکاری
  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await approveMediaOwnerRequest(id);
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "درخواست احراز هویت شرکت با موفقیت تایید شد." });
        loadRequests();
        if (selectedRequest?.id === id) {
          setSelectedRequest((prev) => prev ? { ...prev, status: "approved", statusLabel: "تایید شده و فعال" } : null);
        }
      } else {
        setFeedback({ type: "error", message: res.message || "خطا در تایید درخواست." });
      }
    } catch {
      setFeedback({ type: "error", message: "خطای ناشناخته در ارتباط با سرور." });
    } finally {
      setActionLoading(false);
    }
  };

  // باز کردن مودال رد درخواست
  const openRejectModal = (id: string) => {
    setTargetRejectId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  // ارسال رد درخواست با ذکر علت
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRejectId) return;
    if (!rejectionReason.trim()) {
      setFeedback({ type: "error", message: "لطفاً علت رد درخواست را مرقوم فرمایید." });
      return;
    }

    setActionLoading(true);
    try {
      const res = await rejectMediaOwnerRequest(targetRejectId, rejectionReason.trim());
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "درخواست همکاری رد شد و علت آن ثبت گردید." });
        setRejectModalOpen(false);
        loadRequests();
        if (selectedRequest?.id === targetRejectId) {
          setSelectedRequest((prev) => prev ? { ...prev, status: "rejected", statusLabel: "رد شده", rejectionReason: rejectionReason.trim() } : null);
        }
      } else {
        setFeedback({ type: "error", message: res.message || "خطا در رد درخواست." });
      }
    } catch {
      setFeedback({ type: "error", message: "خطای سرور در رد درخواست." });
    } finally {
      setActionLoading(false);
    }
  };

  // فیلتر جستجو و تب
  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.companyName.toLowerCase().includes(q) ||
        r.nationalId.includes(q) ||
        r.contactPerson.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.trackingCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* پیام فیدبک */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold border animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
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

      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-amber-600" />
            <span>بررسی درخواست‌های احراز هویت مالکان رسانه</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            بررسی و اعتبارسنجی حقوقی کانون‌های تبلیغاتی و مالکان بیلبورد متقاضی افزودن سازه در پلتفرم OOHAI
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
          <span>بروزرسانی لیست</span>
        </button>
      </div>

      {/* نوار جستجو و تب‌های وضعیت */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* تب‌های وضعیت */}
        <div className="flex space-x-reverse space-x-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl px-4 py-2 border transition-all ${
              statusFilter === "all"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            همه درخواست‌ها ({requests.length.toLocaleString("fa-IR")})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`rounded-xl px-4 py-2 border transition-all ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "text-amber-800 border-amber-200 bg-amber-50/50 hover:bg-amber-100/60"
            }`}
          >
            در انتظار بررسی ({requests.filter((r) => r.status === "pending").length.toLocaleString("fa-IR")})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`rounded-xl px-4 py-2 border transition-all ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "text-emerald-800 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60"
            }`}
          >
            تایید شده ({requests.filter((r) => r.status === "approved").length.toLocaleString("fa-IR")})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`rounded-xl px-4 py-2 border transition-all ${
              statusFilter === "rejected"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "text-rose-800 border-rose-200 bg-rose-50/50 hover:bg-rose-100/60"
            }`}
          >
            رد شده ({requests.filter((r) => r.status === "rejected").length.toLocaleString("fa-IR")})
          </button>
        </div>

        {/* فیلد جستجو */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام شرکت، شناسه ملی یا نام مدیر..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-none placeholder:text-slate-400"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* جدول متقاضیان مالک رسانه */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-sm font-semibold text-slate-500">
              در حال دریافت پرونده‌های احراز هویت شرکت‌ها...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <Building2 className="h-10 w-10 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">
              درخواستی در این بخش یافت نشد
            </h4>
            <p className="text-xs text-slate-400">
              فیلتر وضعیت یا عبارت جستجو را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">کد رهگیری</th>
                  <th className="py-3.5 px-4">نام کانون / شرکت حقوقی</th>
                  <th className="py-3.5 px-4">شناسه ملی شرکت</th>
                  <th className="py-3.5 px-4">مدیرمسئول و شماره تماس</th>
                  <th className="py-3.5 px-4">تعداد سازه‌های تحت تملک</th>
                  <th className="py-3.5 px-4">وضعیت احراز هویت</th>
                  <th className="py-3.5 px-4">مدارک قانونی</th>
                  <th className="py-3.5 px-4 text-center">عملیات تصمیم‌گیری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-amber-50/30 transition-colors">
                    {/* کد رهگیری */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.trackingCode}
                    </td>

                    {/* نام شرکت */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{req.companyName}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {req.province} • {req.address}
                        </span>
                      </div>
                    </td>

                    {/* شناسه ملی */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {req.nationalId}
                    </td>

                    {/* مدیر مسئول و شماره */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{req.contactPerson}</span>
                        <span className="font-mono text-[11px] text-slate-500">{req.phone}</span>
                      </div>
                    </td>

                    {/* تعداد سازه‌ها */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-800">
                        {req.structuresCount.toLocaleString("fa-IR")} سازه
                      </span>
                    </td>

                    {/* وضعیت */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3.5 w-3.5" />
                          {req.statusLabel}
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {req.statusLabel}
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 border border-rose-200">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {req.statusLabel}
                        </span>
                      )}
                    </td>

                    {/* مدارک و اسناد */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="h-3.5 w-3.5 text-indigo-600" />
                        <span>مشاهده ({req.documents.length})</span>
                      </button>
                    </td>

                    {/* عملیات تایید و رد */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>تایید</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(req.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>رد</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800"
                        >
                          مشاهده سوابق
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* کشو / مودال جزئیات پرونده و اسناد حقوقی شرکت */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  پرونده احراز هویت حقوقی {selectedRequest.companyName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* مشخصات کامل شرکت */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">شناسه ملی شرکت:</span>
                <span className="font-mono font-bold text-slate-900">{selectedRequest.nationalId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">مدیرعامل / نماینده:</span>
                <span className="font-bold text-slate-900">{selectedRequest.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">شماره تماس مستقیم:</span>
                <span className="font-mono font-bold text-slate-900">{selectedRequest.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">استان و شهر فعالیت:</span>
                <span className="font-bold text-slate-900">{selectedRequest.province}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">تعداد سازه‌های اعلامی:</span>
                <span className="font-bold text-slate-900">{selectedRequest.structuresCount} سازه تبلیغاتی</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">تاریخ ثبت تقاضا:</span>
                <span className="font-bold text-slate-900">{selectedRequest.submittedAt}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-400 block text-[11px]">نشانی دفتر مرکزی:</span>
                <span className="text-slate-800">{selectedRequest.address}</span>
              </div>
            </div>

            {/* مستندات بارگذاری شده شرکت */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>مدارک و مجوزهای بارگذاری شده جهت راستی‌آزمایی</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedRequest.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{doc.fileSize}</span>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>مشاهده سند</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* سوابق بررسی قبلی */}
            {selectedRequest.status !== "pending" && (
              <div className="rounded-xl border border-slate-200 p-3 text-xs bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    وضعیت نهایی: {selectedRequest.statusLabel}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    بررسی توسط: {selectedRequest.reviewedBy} در {selectedRequest.reviewedAt}
                  </span>
                </div>
                {selectedRequest.rejectionReason && (
                  <p className="text-rose-700 text-xs font-medium">
                    علت رد: {selectedRequest.rejectionReason}
                  </p>
                )}
              </div>
            )}

            {/* دکمه‌های اکشن داخل مودال */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                بستن
              </button>

              {selectedRequest.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openRejectModal(selectedRequest.id)}
                    className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    رد این درخواست
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    تایید و اعطای دسترسی مالک رسانه
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مودال علت رد درخواست مالک رسانه */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>رد درخواست احراز هویت شرکت</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  علت رد تقاضا (به شرکت متقاضی پیامک و ایمیل خواهد شد) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: منقضی بودن اعتبار پروانه کانون تبلیغاتی / عدم تطابق شناسه ملی با آگهی روزنامه رسمی..."
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
                  {actionLoading ? "در حال ثبت..." : "تایید رد درخواست"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
