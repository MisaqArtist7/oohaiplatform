import { Metadata } from "next";
import { StructureFormView } from "@/features/media-owner";

export const metadata: Metadata = {
  title: "ثبت سازه تبلیغاتی جدید | پنل مالکان رسانه بیلبورد مارکت",
  description: "افزودن بیلبورد، استرابورد، تلویزیون شهری یا عرشه پل با موقعیت مکانی و تعیین قیمت پایه.",
};

export default function NewStructurePage() {
  return <StructureFormView />;
}
