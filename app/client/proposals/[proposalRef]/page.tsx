import { Metadata } from "next";
import { ProposalResultView } from "@/features/proposals";

interface ProposalPageProps {
  params: Promise<{
    proposalRef: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProposalPageProps): Promise<Metadata> {
  const { proposalRef } = await params;
  return {
    title: `نتیجه پیشنهاد هوشمند #${proposalRef} | بیلبورد مارکت`,
    description: `مشاهده نتایج تحلیل هوش مصنوعی و سازه‌های پیشنهادی برای استعلام #${proposalRef}.`,
  };
}

export default async function ClientProposalDetailPage({
  params,
}: ProposalPageProps) {
  const { proposalRef } = await params;
  return <ProposalResultView proposalRef={proposalRef} />;
}
