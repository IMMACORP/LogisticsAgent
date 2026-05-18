import { InquiryTopPage } from "@/components/inquiry/inquiry-top-page";
import { logisticsServices } from "@/lib/data/services";

export default function Page() {
  return <InquiryTopPage services={logisticsServices} />;
}
