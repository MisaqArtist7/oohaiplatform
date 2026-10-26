import { Metadata } from "next";
import { StructureFormView } from "@/features/media-owner";
import { structuresStore } from "@/lib/mock-data";

export function generateStaticParams() {
  return structuresStore.map((s) => ({
    structureId: s.id,
  }));
}

interface EditPageProps {
  params: Promise<{
    structureId: string;
  }>;
}

export async function generateMetadata(
  props: EditPageProps
): Promise<Metadata> {
  const { structureId } = await props.params;
  return {
    title: `ویرایش سازه ${structureId} | پنل مالکان رسانه`,
    description: "ویرایش ابعاد، قیمت پایه، موقعیت مکانی و تصاویر سازه تبلیغاتی.",
  };
}

export default async function EditStructurePage(props: EditPageProps) {
  const { structureId } = await props.params;
  return <StructureFormView structureId={structureId} />;
}
