import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-border shadow-xl p-8 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          ۴۰۳ - عدم دسترسی
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          شما دسترسی لازم برای مشاهده این بخش را ندارید. در صورت نیاز با مدیر سامانه تماس حاصل فرمایید.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
          >
            <span>بازگشت به صفحه اصلی</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
