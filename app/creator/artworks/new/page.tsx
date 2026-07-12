import type { Metadata } from "next";
import { CreatorArtworkForm } from "@/components/creator-artwork-form";

export const metadata: Metadata = {
  title: "작품 등록하기 | Artroom",
};

export default function NewCreatorArtworkPage() {
  return <CreatorArtworkForm />;
}
