// مسیر: app/dashboard/page.tsx  (تک‌فایل؛ بعدا تفکیک می‌کنیم)
import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
MapPin,
LayoutDashboard,
CalendarCheck,
Sparkles,
LogOut,
Plus,
CalendarDays,
AlertCircle,
Handshake,
} from "lucide-react";

/* ───────────────────────── تنظیمات ───────────────────────── */

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://oohaiplatform.ir/api/v1";

// آدرس صفحه‌هایی که بعدا می‌سازیم؛ اینجا یک‌جا عوض کن
const ROUTES = {
structures: "/structures",
booking: (id: string) => `/dashboard/bookings/${id}`,
mediaOwnerRequest: "/mediaOwnerRequest",
proposals: "/dashboard/proposals",
};

/* ───────────────────────── تایپ‌ها و وضعیت‌ها ───────────────────────── */

type BookingStatusValue =
| "pending_review"
| "locked_for_contract"
| "proforma_issued"
| "payment_submitted"
| "occupied"
| "rejected"
| "expired"
| "completed";

type Booking = {
id: string;
uuid: string;
structure: { id: string; title: string; address: string; price: string; location: string };
start_date: string | null;
end_date: string | null;
status: { value: BookingStatusValue; label: string };
locked_until: string | null;
total_amount: string;
rejection_reason?: string | null;
created_at: string | null;
};

// action: مشتری باید کاری بکند | waiting: منتظر بررسی ما | active: فعال | closed: پایان‌یافته
type StatusGroup = "action" | "waiting" | "active" | "closed";

const STATUS_META: Record<BookingStatusValue, { badge: string; hint: string; group: StatusGroup }> = {
pending_review: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    hint: "درخواست شما در حال بررسی است.",
    group: "waiting",
},
locked_for_contract: {
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    hint: "سازه برای شما قفل شده است. منتظر صدور پیش‌فاکتور باشید.",
    group: "waiting",
},
proforma_issued: {
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    hint: "پیش‌فاکتور صادر شد. پرداخت را ثبت کنید.",
    group: "action",
},
payment_submitted: {
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    hint: "پرداخت شما در حال بررسی است.",
    group: "waiting",
},
occupied: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    hint: "سازه در اختیار شماست.",
    group: "active",
},
completed: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    hint: "این رزرو به پایان رسیده است.",
    group: "closed",
},
rejected: {
    badge: "bg-red-100 text-red-800 border-red-200",
    hint: "این درخواست رد شد.",
    group: "closed",
},
expired: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    hint: "مهلت این رزرو تمام شده است.",
    group: "closed",
},
};

const FALLBACK_META = {
badge: "bg-slate-100 text-slate-700 border-slate-200",
hint: "",
group: "waiting" as StatusGroup,
};

const getMeta = (value: string) => STATUS_META[value as BookingStatusValue] ?? FALLBACK_META;

const SUMMARY: { group: StatusGroup; label: string }[] = [
{ group: "action", label: "نیاز به پرداخت" },
{ group: "waiting", label: "در حال بررسی" },
{ group: "active", label: "فعال" },
{ group: "closed", label: "پایان‌یافته" },
];

/* ───────────────────────── فرمت‌ها ───────────────────────── */

const formatDate = (iso?: string | null) =>
iso ? new Date(iso).toLocaleDateString("fa-IR") : "—";

const formatDateTime = (iso?: string | null) =>
iso
    ? new Date(iso).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" })
    : "—";

// واحد پول مشخص نیست؛ فعلا فقط عدد
const formatAmount = (v?: string | number | null) => {
const n = Number(v);
if (Number.isFinite(n) && v !== null && v !== "") return n.toLocaleString("fa-IR");
return v ? String(v) : "—";
};

/* ───────────────────────── خروج (Server Action) ───────────────────────── */

async function logoutAction() {
"use server";

const store = await cookies();
const token = store.get("token")?.value;

if (token) {
    await fetch(`${API}/auth/logout`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => null); // حتی اگر بک‌اند جواب نداد، کاربر خارج می‌شود
}

store.delete("token");
store.delete("user");
redirect("/register");
}

/* ───────────────────────── صفحه ───────────────────────── */

async function Dashboard() {
// ۱) سشن از کوکی
const store = await cookies();
const token = store.get("token")?.value;
if (!token) redirect("/register?r=dashboard-no-token");

let userName = "کاربر";
let userObj: { name?: string; permissions?: string[]; roles?: (string | { name?: string })[] } | null = null;
try {
    userObj = JSON.parse(store.get("user")?.value ?? "null");
    if (userObj?.name) userName = userObj.name;
} catch {
    // کوکی کاربر خراب بود؛ با نام پیش‌فرض ادامه می‌دهیم
}

// بررسی پرمیژن و نقش سوپر ادمین
const userPermissions: string[] =
  userObj?.permissions && Array.isArray(userObj.permissions) ? userObj.permissions : [];
const userRoles =
  userObj?.roles && Array.isArray(userObj.roles) ? userObj.roles : [];
const roleNames: string[] = userRoles
  .map((r) => (typeof r === "string" ? r : r?.name))
  .filter((r): r is string => Boolean(r));

const isSuperAdmin =
  userPermissions.some((p: string) =>
    ["superadmin", "super-admin", "super_admin", "dashboard.superadmin"].includes(p.toLowerCase())
  ) ||
  roleNames.some((r: string) =>
    ["superadmin", "super-admin", "super_admin"].includes(r.toLowerCase())
  );

if (isSuperAdmin) {
  redirect("/dashboard/superadmin");
}

// ۲) دریافت رزروها
let bookings: Booking[] = [];
let failed = false;

const res = await fetch(`${API}/client/bookings`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
}).catch(() => null);

if (res?.status === 401) redirect("/register?r=api-401"); // توکن منقضی شده؛ با ورود مجدد جایگزین می‌شود

if (!res || !res.ok) {
    failed = true;
} else {
    const json = await res.json().catch(() => null);
    bookings = Array.isArray(json?.data) ? json.data : [];
}

// جدیدترین رزروها اول
bookings = [...bookings].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

const countOf = (g: StatusGroup) =>
    bookings.filter((b) => getMeta(b.status.value).group === g).length;
const needsAction = bookings.filter((b) => getMeta(b.status.value).group === "action");
const recent = bookings.slice(0, 5);

return (
    <div dir="rtl" className="min-h-screen bg-slate-50 lg:flex">
    {/* ── سایدبار / هدر موبایل ── */}
    <aside className="flex flex-col border-b border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between p-4 lg:p-5">
        <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-foreground">
            بیلبورد<span className="text-primary">مارکت</span>
            </span>
        </Link>

        {/* خروج در موبایل */}
        <form action={logoutAction} className="lg:hidden">
            <LogoutButton />
        </form>
        </div>

        <nav aria-label="منوی داشبورد" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
        <Link
            href="/dashboard"
            aria-current="page"
            className="flex shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
        >
            <LayoutDashboard className="h-4 w-4" />
            <span>نمای کلی</span>
        </Link>

        <Link
            href={ROUTES.mediaOwnerRequest}
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
            <Handshake className="h-4 w-4 text-primary" />
            <span>همکاری</span>
        </Link>

        {/* صفحه‌های بعدی؛ تا ساخته نشدن غیرفعال‌اند */}
        <span
            aria-disabled="true"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
        >
            <CalendarCheck className="h-4 w-4" />
            <span>رزروهای من</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">به‌زودی</span>
        </span>
        <Link
            href={ROUTES.proposals}
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>پیشنهادهای هوشمند</span>
        </Link>
        </nav>

        {/* کاربر و خروج در دسکتاپ */}
        <div className="hidden border-t border-border p-4 lg:block">
        <p className="truncate px-3 text-sm font-semibold text-foreground">{userName}</p>
        <form action={logoutAction} className="mt-1">
            <LogoutButton className="w-full" />
        </form>
        </div>
    </aside>

    {/* ── محتوا ── */}
    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
        {/* هدر */}
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-extrabold text-foreground">سلام، {userName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                وضعیت رزروهای خود را از اینجا دنبال کنید.
            </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={ROUTES.mediaOwnerRequest}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary shadow-xs transition-all hover:bg-primary/10 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Handshake className="h-4 w-4" />
                <span>همکاری</span>
              </Link>
              <Link
                href={ROUTES.structures}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Plus className="h-4 w-4" />
                <span>رزرو سازه جدید</span>
              </Link>
            </div>
        </header>

        {/* خطای دریافت اطلاعات */}
        {failed && (
            <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-6 w-6 text-danger" />
            <h2 className="text-base font-bold text-foreground">دریافت اطلاعات ناموفق بود</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                اتصال به سرور برقرار نشد. اینترنت خود را بررسی کنید و دوباره تلاش کنید.
            </p>
            {/* لینک معمولی (نه Link) تا صفحه کامل دوباره بارگذاری شود */}
            <a
                href="/dashboard"
                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
                تلاش مجدد
            </a>
            </div>
        )}

        {!failed && (
            <>
            {/* نیاز به اقدام */}
            {needsAction.length > 0 && (
                <section aria-labelledby="action-title" className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <h2 id="action-title" className="text-base font-bold text-sky-950">
                    برای ادامه، پرداخت این {needsAction.length.toLocaleString("fa-IR")} رزرو را ثبت کنید
                </h2>
                <ul className="mt-3 divide-y divide-sky-200">
                    {needsAction.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-sky-950">{b.structure.title}</p>
                        <p className="mt-0.5 text-xs text-sky-900/70">
                            مبلغ پیش‌فاکتور: {formatAmount(b.total_amount)}
                        </p>
                        </div>
                        <Link
                        href={ROUTES.booking(b.id)}
                        className="rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                        >
                        ثبت پرداخت
                        </Link>
                    </li>
                    ))}
                </ul>
                </section>
            )}

            {/* خلاصه */}
            <section aria-label="خلاصه رزروها">
                <dl className="grid grid-cols-2 divide-x divide-x-reverse divide-border overflow-hidden rounded-2xl border border-border bg-background sm:grid-cols-4">
                {SUMMARY.map(({ group, label }) => (
                    <div key={group} className="p-4 sm:p-5">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-2xl font-extrabold text-foreground">
                        {countOf(group).toLocaleString("fa-IR")}
                    </dd>
                    </div>
                ))}
                </dl>
            </section>

            {/* آخرین رزروها */}
            <section aria-labelledby="recent-title">
                <h2 id="recent-title" className="mb-3 text-base font-bold text-foreground">
                آخرین رزروها
                </h2>

                {recent.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
                    <CalendarDays className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                    <h3 className="text-base font-bold text-foreground">هنوز رزروی ثبت نکرده‌اید</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    یک سازه انتخاب کنید و درخواست رزرو ثبت کنید. وضعیت آن همین‌جا نمایش داده می‌شود.
                    </p>
                    <Link
                    href={ROUTES.structures}
                    className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                    مشاهده سازه‌ها
                    </Link>
                </div>
                ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
                    {recent.map((b) => {
                    const meta = getMeta(b.status.value);
                    const hint =
                        b.status.value === "rejected" && b.rejection_reason
                        ? `دلیل رد: ${b.rejection_reason}`
                        : b.status.value === "locked_for_contract" && b.locked_until
                            ? `${meta.hint} (قفل تا ${formatDateTime(b.locked_until)})`
                            : meta.hint;

                    return (
                        <li key={b.id} className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {b.structure.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {b.structure.address}
                            </p>
                            </div>
                            <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
                            >
                            {b.status.label}
                            </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                            <span>
                            از {formatDate(b.start_date)} تا {formatDate(b.end_date)}
                            </span>
                            <span>مبلغ: {formatAmount(b.total_amount)}</span>
                        </div>

                        {hint && <p className="mt-2 text-xs text-foreground/80">{hint}</p>}
                        </li>
                    );
                    })}
                </ul>
                )}
            </section>
            </>
        )}
        </div>
    </main>
    </div>
);
}

/* دکمه خروج: بدون state، فقط داخل <form action={logoutAction}> */
function LogoutButton({ className = "" }: { className?: string }) {
return (
    <button
    type="submit"
    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
    <LogOut className="h-4 w-4" />
    <span>خروج</span>
    </button>
);
}

/* ───────────────────────── خروجی صفحه ───────────────────────── */

// کوکی فقط داخل <Suspense> خوانده می‌شود (الزام Cache Components در Next 16)
export default function DashboardPage() {
return (
    <Suspense fallback={<DashboardSkeleton />}>
    <Dashboard />
    </Suspense>
);
}

function DashboardSkeleton() {
return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
    <div className="mx-auto max-w-4xl animate-pulse space-y-6" aria-busy="true" aria-label="در حال بارگذاری">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-20 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
    </div>
    </div>
);
}