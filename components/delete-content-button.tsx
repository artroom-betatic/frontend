"use client";

import { useRouter } from "next/navigation";
import {
  deleteArtwork,
  deleteSeries,
} from "@/lib/user-actions";

type DeleteContentButtonProps = {
  contentId: string;
  contentType: "artwork" | "series";
  redirectHref: string;
};

export function DeleteContentButton({
  contentId,
  contentType,
  redirectHref,
}: DeleteContentButtonProps) {
  const router = useRouter();

  const deleteContent = () => {
    if (!window.confirm("정말 삭제할 것입니까?")) {
      return;
    }

    if (contentType === "artwork") {
      deleteArtwork(contentId);
    } else {
      deleteSeries(contentId);
    }

    router.push(redirectHref);
  };

  return (
    <button
      className="mt-3 flex min-h-9 w-full items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-panel"
      onClick={deleteContent}
      type="button"
    >
      삭제
    </button>
  );
}
