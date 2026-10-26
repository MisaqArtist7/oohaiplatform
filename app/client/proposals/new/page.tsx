import { Metadata } from "next";
import { NewProposalForm } from "@/features/proposals";

export const metadata: Metadata = {
  title: "ثبت سناریوی هوشمند کمپین تبلیغاتی | بیلبورد مارکت",
  description:
    "ثبت بودجه و سناریوی بازاریابی جهت دریافت بهینه‌ترین سازه‌های پیشنهادی با هوش مصنوعی.",
};

export default function NewProposalPage() {
  return <NewProposalForm />;
}
