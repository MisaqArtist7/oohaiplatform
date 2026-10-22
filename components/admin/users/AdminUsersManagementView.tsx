"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  KeyRound,
} from "lucide-react";
import { AdminRole, AdminUser } from "@/types/admin-dashboard";
import {
  getAdminUsers,
  assignRoleToUserApi,
  removeRoleFromUserApi,
} from "@/lib/admin-api";

export default function AdminUsersManagementView() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // واکشی کاربران و نقش‌ها
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers(search || undefined);
      if (res.success && res.data) {
        setUsers(res.data);
        if (res.roles) setRoles(res.roles);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminUsers().then((res) => {
      if (isMounted && res.success && res.data) {
        setUsers(res.data);
        if (res.roles) setRoles(res.roles);
      }
    }).catch((err) => {
      console.error("Error loading users:", err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  // اختصاص نقش به کاربر
  const handleAssignRole = async (userId: string, roleSlug: string) => {
    setActionLoading(true);
    try {
      const res = await assignRoleToUserApi(userId, roleSlug);
      if (res.success && res.user) {
        setFeedback({ type: "success", message: res.message || "نقش با موفقیت به کاربر اختصاص یافت." });
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.user! : u)));
        if (selectedUser?.id === userId) {
          setSelectedUser(res.user);
        }
      } else {
        setFeedback({ type: "error", message: res.message || "خطا در انتساب نقش." });
      }
    } catch {
      setFeedback({ type: "error", message: "خطای ناشناخته در ارتباط با سرور." });
    } finally {
      setActionLoading(false);
    }
  };

  // حذف نقش از کاربر
  const handleRemoveRole = async (userId: string, roleSlug: string) => {
    setActionLoading(true);
    try {
      const res = await removeRoleFromUserApi(userId, roleSlug);
      if (res.success && res.user) {
        setFeedback({ type: "success", message: res.message || "نقش با موفقیت از کاربر سلب گردید." });
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.user! : u)));
        if (selectedUser?.id === userId) {
          setSelectedUser(res.user);
        }
      } else {
        setFeedback({ type: "error", message: res.message || "خطا در حذف نقش." });
      }
    } catch {
      setFeedback({ type: "error", message: "خطای ناشناخته در ارتباط با سرور." });
    } finally {
      setActionLoading(false);
    }
  };

  // فیلتر کلاینت ساید نقش‌ها
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && !u.roles.some((r) => r.slug === roleFilter)) {
      return false;
    }
    return true;
  });

  // رنگ نقش‌ها
  const getRoleBadgeColor = (color: string) => {
    switch (color) {
      case "indigo":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

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
            <Users className="h-6 w-6 text-indigo-600" />
            <span>مدیریت کاربران، پرسنل و ماتریس نقش‌ها</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            تعیین سطوح دسترسی مالی، عملیاتی، مدیریت مالکان رسانه و اختیارات ادمین کل سیستم
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          <span>بروزرسانی</span>
        </button>
      </div>

      {/* کارت‌های معرفی نقش‌های اصلی سیستم */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-lg px-2 py-0.5 text-[10px] font-black border ${getRoleBadgeColor(
                  role.color
                )}`}
              >
                {role.slug}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {role.permissionsCount} دسترسی
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 truncate">
              {role.name}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {role.description}
            </p>
          </div>
        ))}
      </div>

      {/* نوار جستجو و تب‌های نقش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* فیلتر تب نقش */}
        <div className="flex space-x-reverse space-x-2 text-xs font-bold overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 border transition-all ${
              roleFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            همه کاربران ({users.length})
          </button>
          {roles.map((r) => {
            const count = users.filter((u) => u.roles.some((ro) => ro.slug === r.slug)).length;
            const active = roleFilter === r.slug;
            return (
              <button
                key={r.slug}
                type="button"
                onClick={() => setRoleFilter(r.slug)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 border transition-all ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {r.name.split("(")[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* فیلد جستجو */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام کاربر، ایمیل، موبایل..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </form>
      </div>

      {/* جدول کاربران */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500">
              در حال دریافت فهرست کاربران و نقش‌ها...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <Users className="h-10 w-10 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">
              کاربری با این مشخصات یافت نشد
            </h4>
            <p className="text-xs text-slate-400">
              عبارت جستجو یا فیلتر نقش انتخابی را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">مشخصات کاربر</th>
                  <th className="py-3.5 px-4">واحد سازمانی / شرکت</th>
                  <th className="py-3.5 px-4">شماره تماس و ایمیل</th>
                  <th className="py-3.5 px-4">نقش‌های منتسب</th>
                  <th className="py-3.5 px-4">وضعیت حساب</th>
                  <th className="py-3.5 px-4">آخرین ورود</th>
                  <th className="py-3.5 px-4 text-center">مدیریت اختیارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* مشخصات کاربر */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">
                          {(user.fullName || user.name).charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">
                            {user.fullName || user.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            کد ملی: {user.nationalCode || "تایید شده"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* واحد یا شرکت */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">
                        {user.department}
                      </span>
                      {user.company && (
                        <span className="text-[11px] text-slate-400">
                          {user.company}
                        </span>
                      )}
                    </td>

                    {/* شماره و ایمیل */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col text-[11px] font-mono">
                        <span className="text-slate-800">{user.phone}</span>
                        <span className="text-slate-400">{user.email}</span>
                      </div>
                    </td>

                    {/* نقش‌ها */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {user.roles.map((r) => (
                          <span
                            key={r.slug}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getRoleBadgeColor(
                              r.color
                            )}`}
                          >
                            {r.name.split("(")[0]}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* وضعیت */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {user.statusLabel}
                      </span>
                    </td>

                    {/* آخرین ورود */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {user.lastLogin}
                    </td>

                    {/* دکمه مدیریت اختیارات */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>مدیریت نقش‌ها</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مودال جامع مدیریت نقش‌ها و اختیارات کاربر */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  مدیریت دسترسی‌ها و نقش‌های کاربر
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* کارت مشخصات کاربر */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm">
                  {(selectedUser.fullName || selectedUser.name).charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {selectedUser.fullName || selectedUser.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedUser.email} • {selectedUser.phone}
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-800">
                {selectedUser.department}
              </span>
            </div>

            {/* انتخاب یا سلب نقش‌ها */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                <span>نقش‌های سازمانی فعال برای این کاربر</span>
                <span className="text-[11px] font-normal text-slate-400">
                  برای تغییر وضعیت روی چک‌باکس یا دکمه کلیک فرمایید
                </span>
              </h4>

              <div className="space-y-2">
                {roles.map((role) => {
                  const hasRole = selectedUser.roles.some((r) => r.slug === role.slug);

                  return (
                    <div
                      key={role.slug}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                        hasRole
                          ? "border-indigo-300 bg-indigo-50/40"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {role.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold border ${getRoleBadgeColor(
                              role.color
                            )}`}
                          >
                            {role.slug}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          {role.description}
                        </p>
                      </div>

                      <div>
                        {hasRole ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(selectedUser.id, role.slug)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>سلب نقش</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAssignRole(selectedUser.id, role.slug)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                            <span>اختصاص نقش</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* فوتر مودال */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                تایید و بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
