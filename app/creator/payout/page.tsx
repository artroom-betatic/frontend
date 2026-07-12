import type { Metadata } from "next";
import { CreatorPayoutClient } from "@/components/creator-payout-client";

export const metadata: Metadata = {
  title: "정산 설정 | Artroom",
};

export default function CreatorPayoutPage() {
  return <CreatorPayoutClient />;
}
