import { Metadata } from "next";
import { ProposalsView } from "@/features/proposals";

export const metadata: Metadata = {
  title: "مشاوره و پیشنهاد کمپین (AI Planner) | بیلبورد مارکت",
  description: "طراحی هوشمند سبد رسانه تبلیغات محیطی و بیلبورد بر اساس بودجه و سناریوی بازاریابی با هوش مصنوعی.",
};

export default function ClientProposalsPage() {
  return <ProposalsView />;
}
