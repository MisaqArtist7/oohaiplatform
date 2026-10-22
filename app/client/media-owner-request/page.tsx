import { Metadata } from "next";
import MediaOwnerRequestView from "@/components/client/media-owner/MediaOwnerRequestView";

export const metadata: Metadata = {
  title: "درخواست ارتقا به مالک رسانه | بیلبورد مارکت",
  description: "عرضه و مدیریت فضاهای تبلیغات محیطی، بیلبورد و تلویزیون شهری در پلتفرم سراسری OOHAI.",
};

export default function MediaOwnerRequestPage() {
  return <MediaOwnerRequestView />;
}
