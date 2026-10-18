"use client";

import { use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GamePlay } from "@/components/GamePlay";
import { slugToPuzzleKey } from "@/lib/puzzle-key-url";

export default function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const puzzleKey = slugToPuzzleKey(decodeURIComponent(slug));

  const filterQuery = useMemo(
    () => ({
      genres: searchParams.get("genres") ?? "",
      country: searchParams.get("country") ?? "",
    }),
    [searchParams],
  );

  const subtitle =
    puzzleKey.startsWith("daily:") ? puzzleKey.slice("daily:".length) : "Unlimited";

  const backHref = puzzleKey.startsWith("unlimited:") ? "/unlimited" : "/";

  return (
    <GamePlay
      puzzleKey={puzzleKey}
      filterQuery={filterQuery}
      backHref={backHref}
      subtitle={subtitle}
    />
  );
}
