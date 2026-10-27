"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Plus,
  Trash2,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/features/auth/hooks/use-session";
import { Can } from "@/features/auth/components/Can";
import {
  useAdminUsersQuery,
  useAdminUserDetailQuery,
  useUserRolesQuery,
  useAssignRoleMutation,
  useRemoveRoleMutation,
} from "../hooks/useAdmin";
import {
  USER_ROLE_LABELS,
  USER_ROLES_LIST,
  type AdminUser,
  type UserRoleValue,
} from "../types";
import { toPersianDigits } from "@/shared/lib/digits";
import { ApiError } from "@/shared/lib/errors";

export default function AdminUsersManagementView() {
  return (
    <Can
      perm="admin.manage-user-roles"
      fallback={
        <div className="py-24 px-6 text-center bg-white rounded-2xl border border-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            عدم دسترسی به بخش کاربران
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            حساب کاربری شما مجوز لازم برای مدیریت کاربران و تخصیص نقش‌ها (admin.manage-user-roles) را دارا نمی‌باشد.
          </p>
        </div>
      }
    >
      <AdminUsersContent />
    </Can>
  );
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentSessionUser } = useSession();

  const searchParam = searchParams.get("search") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);

  // استیت جستجو با Debounce ۴۰۰ میلی‌ثانیه
  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.delete("page"); // بازگشت به صفحه اول در جستجوی جدید
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, pathname, router, searchParams]);

  const queryParams = useMemo(
    () => ({
      search: searchParam || undefined,
      page: pageParam > 1 ? pageParam : undefined,
      per_page: perPageParam !== 15 ? perPageParam : undefined,
    }),
    [searchParam, pageParam, perPageParam]
  );

  const { data: pageData, isLoading, isError, error, refetch } = useAdminUsersQuery(queryParams);

  const users: AdminUser[] = pageData?.data || [];
  const meta = pageData?.meta;

  // کاربر انتخاب‌شده جهت باز شدن دیالوگ جزییات و نقش‌ها
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);

  // دیالوگ تأیید حذف نقش
  const [roleToDelete, setRoleToDelete] = useState<{ uuid: string; role: UserRoleValue; label: string } | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* هدر بخش مدیریت کاربران */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            مدیریت کاربران و نقش‌ها
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مشاهده اطلاعات کاربران، انتساب و سلب نقش‌های ۳ گانه سیستم (مشتری، مالک رسانه، مدیر ارشد)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
            title="تازه‌سازی لیست کاربران"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* نوار جستجوی زنده با debounce */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="جستجوی نام یا شماره همراه کاربر..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-10 pr-9 pl-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
              title="پاک کردن جستجو"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold text-slate-500">
              در حال دریافت لیست کاربران از سرور...
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              خطا در دریافت لیست کاربران
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              {error instanceof Error ? error.message : "امکان برقراری ارتباط با سرویس کاربران وجود ندارد."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>تلاش مجدد</span>
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              کاربری یافت نشد
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchParam
                ? `برای عبارت «${searchParam}» هیچ کاربری پیدا نشد.`
                : "هیچ کاربری در سیستم ثبت نشده است."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">شناسه</th>
                    <th className="py-3.5 px-4">نام و نام خانوادگی</th>
                    <th className="py-3.5 px-4">شماره همراه</th>
                    <th className="py-3.5 px-4">وضعیت حساب</th>
                    <th className="py-3.5 px-4">نقش‌ها</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    // استخراج نقش‌ها از پاسخ لیست
                    const rolesDisplay: string[] = [];
                    if (user.role) {
                      rolesDisplay.push(
                        USER_ROLE_LABELS[user.role as UserRoleValue] || String(user.role)
                      );
                    }
                    if (Array.isArray(user.roles)) {
                      for (const r of user.roles) {
                        const slug = typeof r === "string" ? r : r.slug || r.name || "";
                        const label = USER_ROLE_LABELS[slug as UserRoleValue] || slug;
                        if (label && !rolesDisplay.includes(label)) {
                          rolesDisplay.push(label);
                        }
                      }
                    }

                    return (
                      <tr
                        key={user.uuid || user.id}
                        onClick={() => setSelectedUserUuid(user.uuid || String(user.id))}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* شناسه */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                          #{toPersianDigits(user.id)}
                        </td>

                        {/* نام */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {user.name || "—"}
                          </span>
                        </td>

                        {/* شماره همراه */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {user.phone ? toPersianDigits(user.phone) : "—"}
                        </td>

                        {/* وضعیت فعال */}
                        <td className="py-3.5 px-4">
                          {user.is_active !== undefined ? (
                            user.is_active ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                فعال
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                غیرفعال
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* نقش‌ها */}
                        <td className="py-3.5 px-4">
                          {rolesDisplay.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rolesDisplay.map((roleLabel, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                                >
                                  {roleLabel}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* دکمه عملیات */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedUserUuid(user.uuid || String(user.id))}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <span>مدیریت نقش‌ها</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* کنترل‌های صفحه‌بندی */}
            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  نمایش ردیف‌های{" "}
                  <span className="font-bold text-slate-900">
                    {meta.from ? toPersianDigits(meta.from) : "۱"}
                  </span>{" "}
                  تا{" "}
                  <span className="font-bold text-slate-900">
                    {meta.to ? toPersianDigits(meta.to) : toPersianDigits(users.length)}
                  </span>{" "}
                  از مجموع{" "}
                  <span className="font-bold text-slate-900">
                    {toPersianDigits(meta.total)}
                  </span>{" "}
                  کاربر
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>قبلی</span>
                  </button>

                  <span className="px-3 py-1.5 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
                    صفحه {toPersianDigits(meta.current_page)} از {toPersianDigits(meta.last_page)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page >= meta.last_page}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>بعدی</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* مودال جزئیات و مدیریت نقش‌های کاربر */}
      {selectedUserUuid && (
        <UserDetailAndRolesModal
          userUuid={selectedUserUuid}
          currentSessionUuid={currentSessionUser?.uuid}
          onClose={() => setSelectedUserUuid(null)}
          onRequestDeleteRole={(uuid, role, label) => setRoleToDelete({ uuid, role, label })}
        />
      )}

      {/* دیالوگ تأیید حذف نقش */}
      {roleToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                <Trash2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                تأیید سلب نقش کاربر
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              آیا از سلب نقش <strong className="text-slate-900">«{roleToDelete.label}»</strong> از این کاربر اطمینان دارید؟
            </p>

            <ConfirmDeleteRoleAction
              roleToDelete={roleToDelete}
              onClose={() => setRoleToDelete(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// کامپوننت مودال جزییات کاربر و مدیریت نقش‌ها
function UserDetailAndRolesModal({
  userUuid,
  currentSessionUuid,
  onClose,
  onRequestDeleteRole,
}: {
  userUuid: string;
  currentSessionUuid?: string;
  onClose: () => void;
  onRequestDeleteRole: (uuid: string, role: UserRoleValue, label: string) => void;
}) {
  const { data: user, isLoading: userLoading } = useAdminUserDetailQuery(userUuid);
  const { data: activeRoles = [], isLoading: rolesLoading, refetch: refetchRoles } = useUserRolesQuery(userUuid);
  const assignRoleMutation = useAssignRoleMutation();

  const [selectedNewRole, setSelectedNewRole] = useState<UserRoleValue | "">("");

  // لیست نقش‌هایی که کاربر در حال حاضر ندارد (از بین ۳ نقش سند)
  const availableRolesToAdd = useMemo(() => {
    return USER_ROLES_LIST.filter((r) => !activeRoles.includes(r.value));
  }, [activeRoles]);

  const currentRoleValue = useMemo(() => {
    if (selectedNewRole && availableRolesToAdd.some((r) => r.value === selectedNewRole)) {
      return selectedNewRole;
    }
    return availableRolesToAdd[0]?.value ?? "";
  }, [selectedNewRole, availableRolesToAdd]);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleToAdd = currentRoleValue;
    if (!roleToAdd || assignRoleMutation.isPending) return;

    try {
      const res = await assignRoleMutation.mutateAsync({
        uuid: userUuid,
        role: roleToAdd,
      });
      toast.success(res?.message || `نقش «${USER_ROLE_LABELS[roleToAdd]}» با موفقیت اضافه شد.`);
      setSelectedNewRole("");
      refetchRoles();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در انتساب نقش.");
    }
  };

  const isSelfSuperAdmin = Boolean(
    currentSessionUuid &&
    user?.uuid &&
    currentSessionUuid === user.uuid
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                مشخصات و نقش‌های کاربر
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">
                UUID: {userUuid}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {userLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : !user ? (
          <p className="text-xs text-rose-600 py-4 text-center">
            اطلاعات کاربر یافت نشد.
          </p>
        ) : (
          <div className="space-y-4">
            {/* جزییات مشخصات کاربر */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">نام و نام خانوادگی:</span>
                <span className="font-bold text-slate-900">{user.name || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">شماره همراه:</span>
                <span className="font-bold font-mono text-slate-900">
                  {user.phone ? toPersianDigits(user.phone) : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">شناسه عددی:</span>
                <span className="font-bold font-mono text-slate-700">
                  #{toPersianDigits(user.id)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">وضعیت حساب:</span>
                <span className="font-bold text-emerald-700">
                  {user.is_active !== false ? "فعال" : "غیرفعال"}
                </span>
              </div>

              {/* لینک به رزروهای این کاربر */}
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <Link
                  href={`/admin/bookings?client_id=${user.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <span>مشاهده رزروهای ثبت‌شده توسط این کاربر</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* بخش نقش‌های فعال کاربر */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>نقش‌های فعال کاربر:</span>
                {rolesLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />}
              </h5>

              {activeRoles.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  هیچ نقشی به این کاربر اختصاص داده نشده است.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeRoles.map((roleKey) => {
                    const label = USER_ROLE_LABELS[roleKey] || roleKey;
                    const isSelfAdminRole = isSelfSuperAdmin && roleKey === "super_admin";

                    return (
                      <div
                        key={roleKey}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            ({roleKey})
                          </span>
                        </div>

                        {isSelfAdminRole ? (
                          <span
                            className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded cursor-not-allowed"
                            title="نمی‌توانید نقش مدیر ارشد خودتان را حذف کنید"
                          >
                            غیرقابل حذف (نقش خودتان)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRequestDeleteRole(userUuid, roleKey, label)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={`سلب نقش ${label}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>سلب نقش</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* بخش افزودن نقش جدید */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h5 className="text-xs font-bold text-slate-800">
                افزودن نقش جدید:
              </h5>

              {availableRolesToAdd.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl text-center">
                  تمامی نقش‌های مجاز (مشتری، مالک رسانه، مدیر ارشد) به این کاربر اختصاص یافته است.
                </p>
              ) : (
                <form onSubmit={handleAddRole} className="flex items-center gap-2">
                  <select
                    value={currentRoleValue}
                    onChange={(e) => setSelectedNewRole(e.target.value as UserRoleValue)}
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    {availableRolesToAdd.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} ({r.value})
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={!currentRoleValue || assignRoleMutation.isPending}
                    className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {assignRoleMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>افزودن نقش</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

// کامپوننت اجرای حذف نقش
function ConfirmDeleteRoleAction({
  roleToDelete,
  onClose,
}: {
  roleToDelete: { uuid: string; role: UserRoleValue; label: string };
  onClose: () => void;
}) {
  const removeRoleMutation = useRemoveRoleMutation();

  const handleConfirm = async () => {
    try {
      const res = await removeRoleMutation.mutateAsync({
        uuid: roleToDelete.uuid,
        role: roleToDelete.role,
      });
      toast.success(res?.message || `نقش «${roleToDelete.label}» با موفقیت سلب شد.`);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error(err instanceof Error ? err.message : "خطا در سلب نقش.");
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
        disabled={removeRoleMutation.isPending}
        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
      >
        انصراف
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={removeRoleMutation.isPending}
        className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5 cursor-pointer"
      >
        {removeRoleMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        <span>تأیید و سلب نقش</span>
      </button>
    </div>
  );
}
