import { Metadata } from "next";
import { Suspense } from "react";
import { StructureFormView } from "@/features/media-owner";

export const instant = false;

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
    description: "ویرایش مشخصات، قیمت پایه و موقعیت مکانی سازه تبلیغاتی.",
  };
}

export default async function EditStructurePage(props: EditPageProps) {
  const { structureId } = await props.params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">در حال بارگذاری فرم ویرایش...</div>}>
      <StructureFormView structureId={structureId} />
    </Suspense>
  );
}
