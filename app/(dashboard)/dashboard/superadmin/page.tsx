import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Building2,
  CalendarCheck,
  Handshake,
  LogOut,
  MapPin,
  TrendingUp,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

async function logoutAction() {
  "use server";
  const store = await cookies();
  const token = store.get("token")?.value;

  if (token) {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }

  store.delete("token");
  store.delete("user");
  redirect("/register");
}

export default async function SuperAdminDashboardPage() {
  const store = await cookies();
  const token = store.get("token")?.value;
  if (!token) redirect("/register?r=superadmin-no-token");

  let userName = "مدیر ارشد سیستم";
  try {
    const user = JSON.parse(store.get("user")?.value ?? "null");
    if (user?.name) userName = user.name;
  } catch {
    // fallback
  }

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
                  دسترسی سطح ۱ (Super Admin)
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-foreground">
                خوش آمدید، {userName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                مدیریت کل سیستم، نظارت بر درخواست‌های مالکان، سازه‌ها و رزروها.
              </p>
            </div>
          </header>

          {/* آمارهای کلیدی */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">درخواست‌های همکاری جدید</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">۳</p>
              <p className="mt-1 text-xs text-amber-600 font-medium">نیاز به بررسی مدارک</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">کل سازه‌های تبلیغاتی</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">۱۲۸</p>
              <p className="mt-1 text-xs text-muted-foreground">سازه‌های فعال سراسر کشور</p>
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
                <span className="text-xs font-medium text-muted-foreground">رزروهای در جریان</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <CalendarCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-foreground">۲۴</p>
              <p className="mt-1 text-xs text-sky-600 font-medium">در مرحله پیش‌فاکتور و اکران</p>
            </div>
          </section>

          {/* کارت بخش‌های مدیریتی */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground">بخش‌های مدیریتی سوپر ادمین</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">درخواست‌های همکاری مالکان</h3>
                    <p className="text-xs text-muted-foreground">بررسی اسناد و تایید دسترسی مالکان رسانه</p>
                  </div>
                </div>
              </div>

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
