import type { Metadata } from "next";
import { CreatorMembershipClient } from "@/components/creator-membership-client";

export const metadata: Metadata = {
  title: "구독 멤버십 | Artroom",
};

export default function CreatorMembershipPage() {
  return <CreatorMembershipClient />;
}
