import { Suspense } from "react";
import { Metadata } from "next";
import { ProposalsListView } from "@/features/proposals";

export const metadata: Metadata = {
  title: "تاریخچه پیشنهادات و کمپین‌های هوشمند | بیلبورد مارکت",
  description:
    "مشاهده فهرست سناریوهای بازاریابی ثبت‌شده و نتایج پردازش هوش مصنوعی برای سبد رسانه تبلیغات محیطی.",
};

export default function ClientProposalsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
      }
    >
      <ProposalsListView />
    </Suspense>
  );
}
