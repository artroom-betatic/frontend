import type { Metadata } from "next";
import { CreatorCommissionsClient } from "@/components/creator-commissions-client";

export const metadata: Metadata = {
  title: "받은 커미션 관리 | Artroom",
};

export default function CreatorCommissionsPage() {
  return <CreatorCommissionsClient />;
}
