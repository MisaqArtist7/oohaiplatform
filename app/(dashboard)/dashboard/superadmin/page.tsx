import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Building2,
  Handshake,
  LogOut,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  RequestsTable,
  type MediaOwnerRequestItem,
  extractRequestsList,
  getStatusBadge,
  DEFAULT_SAMPLE_REQUESTS,
} from "@/features/admin";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

export const instant = false;

async function logoutAction() {
  "use server";
  const store = await cookies();
  const token = store.get("access_token")?.value || store.get("token")?.value;

  if (token) {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }

  store.delete("access_token");
  store.delete("user_info");
  store.delete("token");
  store.delete("user");
  redirect("/register");
}

export default async function SuperAdminDashboardPage() {
  const store = await cookies();
  const token = store.get("access_token")?.value || store.get("token")?.value;
  if (!token) redirect("/register?r=superadmin-no-token");

  let userName = "مدیر ارشد سیستم";
  try {
    const user = JSON.parse(
      store.get("user_info")?.value ?? store.get("user")?.value ?? "null"
    );
    if (user?.name) userName = user.name;
  } catch {
    // fallback
  }

  // تلاش برای دریافت لیست درخواست‌های همکاری از اندپوینت‌های معتبر با توکن احراز هویت
  let requests: MediaOwnerRequestItem[] = [];

  const endpoints = [
    process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/media-owner-requests`
      : null,
    "https://oohaiplatform.ir/api/v1/admin/media-owner-requests",
  ].filter(Boolean) as string[];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const list = extractRequestsList(json);
        if (list.length > 0) {
          requests = list;
          break;
        }
      }
    } catch {
      // ادامه به اندپوینت بعدی
    }
  }

  const effectiveRequests = requests.length > 0 ? requests : DEFAULT_SAMPLE_REQUESTS;
  const pendingCount = effectiveRequests.filter((r) => {
    const badge = getStatusBadge(r.status);
    return badge.key === "pending";
  }).length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 lg:flex">
      {/* ── سایدبار سوپر ادمین ── */}
      <aside className="flex flex-col border-b border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between p-4 lg:p-5">
          <Link href="/dashboard/superadmin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <span className="text-sm font-bold text-foreground">
                پنل سوپر<span className="text-indigo-600">ادمین</span>
              </span>
              <span className="block text-[10px] text-muted-foreground">بیلبورد مارکت</span>
            </div>
          </Link>
        </div>

        <nav aria-label="منوی سوپر ادمین" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
          <Link
            href="/dashboard/superadmin"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>داشبورد سوپر ادمین</span>
          </Link>

          <Link
            href="#requests-section"
            className="flex shrink-0 items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Handshake className="h-4 w-4 text-indigo-600" />
              <span>درخواست‌های همکاری</span>
            </div>
            {requests.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                {requests.length.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>مشاهده داشبورد کاربر</span>
          </Link>

          <Link
            href="/mediaOwnerRequest"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Handshake className="h-4 w-4" />
            <span>فرم همکاری مالکان</span>
          </Link>
        </nav>

        <div className="border-t border-border p-4">
          <p className="truncate px-3 text-xs font-semibold text-foreground">{userName}</p>
          <p className="px-3 text-[10px] text-indigo-600 font-medium">دسترسی: Super Admin</p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="inline-flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج از حساب</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ── محتوای اصلی ── */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* هدر */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  مدیریت کل سیستم (Super Admin)
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-foreground">
                خوش آمدید، {userName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                نظارت بر درخواست‌های مالکان رسانه، تایید و رد درخواست‌ها و بررسی مدارک ارسالی.
              </p>
            </div>
          </header>

          {/* آمارهای کلیدی */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">درخواست‌های در انتظار</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">
                {pendingCount.toLocaleString("fa-IR")}
              </p>
              <p className="mt-1 text-xs text-amber-600 font-medium">نیاز به تایید یا رد</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">کل درخواست‌های دریافتی</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Handshake className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">
                {effectiveRequests.length.toLocaleString("fa-IR")}
              </p>
              <p className="mt-1 text-xs text-indigo-600 font-medium">ثبت‌شده در سامانه</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">کاربران ثبت‌نام‌شده</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">۵۴۰</p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">مشتریان و مالکان</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">سازه‌های فعال</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">۱۲۸</p>
              <p className="mt-1 text-xs text-sky-600 font-medium">سراسر کشور</p>
            </div>
          </section>

          {/* ── بخش درخواست‌های همکاری مالکان رسانه ── */}
          <section id="requests-section" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  مدیریت درخواست‌های همکاری مالکان رسانه
                </h2>
                <p className="text-xs text-muted-foreground">
                  امکان تایید درخواست‌ها، بلاک مالکان تاییدشده (تستی)، و رد درخواست‌ها با درج دلیل موجه (حداکثر ۵۰۰ کاراکتر).
                </p>
              </div>

              <a
                href="/dashboard/superadmin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                <span>بروزرسانی زنده</span>
              </a>
            </div>

            <RequestsTable initialRequests={requests} />
          </section>

          {/* سایر بخش‌های مدیریتی */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground">سایر بخش‌های مدیریتی</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">مدیریت کاربران و دسترسی‌ها</h3>
                    <p className="text-xs text-muted-foreground">تعیین نقش‌ها و مجوزهای ادمین و مشتریان</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">مدیریت بیلبوردها و سازه‌ها</h3>
                    <p className="text-xs text-muted-foreground">افزودن، ویرایش و قیمت‌گذاری سازه‌ها</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
