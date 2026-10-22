import { Metadata } from "next";
import AdminMediaOwnerRequestsView from "@/components/admin/media-owner/AdminMediaOwnerRequestsView";

export const metadata: Metadata = {
  title: "درخواست‌های مالکان رسانه | داشبورد مدیریت OOHAI",
  description: "بررسی و اعتبارسنجی مدارک شرکت‌های حقوقی و کانون‌های تبلیغاتی متقاضی عرضه سازه در پلتفرم OOHAI",
};

export default function AdminMediaOwnerRequestsPage() {
  return <AdminMediaOwnerRequestsView />;
}
