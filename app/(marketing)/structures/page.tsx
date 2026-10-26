import { Metadata } from "next";
import { StructuresExplorer } from "@/features/structures";
import {
  mockStructures,
  mockStructureTypes,
  mockStructureCategories,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "کاوشگر نقشه و کاتالوگ بیلبوردهای تبلیغاتی",
  description:
    "جستجو، مقایسه موقعیت جغرافیایی و تعرفه اجاره آنلاین بیلبورد، استرابورد، عرشه پل و تلویزیون‌های شهری روی نقشه تعاملی تهران.",
};

export default function StructuresPage() {
  return (
    <StructuresExplorer
      initialStructures={mockStructures}
      initialTypes={mockStructureTypes}
      initialCategories={mockStructureCategories}
    />
  );
}
