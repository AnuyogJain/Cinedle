"use client";

import { Clapperboard } from "lucide-react";
import { useEffect, useState } from "react";
import { posterUrl } from "@/lib/images";

export function WinModal({
  open,
  guessCount,
  title,
  year,
  posterPath,
  onClose,
}: {
  open: boolean;
  guessCount: number;
  title: string;
  year: number;
  posterPath: string | null;
  onClose: () => void;
}) {
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    if (open) setPosterFailed(false);
  }, [open, posterPath]);

  if (!open) return null;

  const poster = posterPath && !posterFailed ? posterUrl(posterPath) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="win-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-5 text-center shadow-2xl">
        <h2 id="win-title" className="text-xl font-semibold">
          Congrats!
        </h2>
        <p className="mt-1 text-sm text-muted">
          You got it in {guessCount} {guessCount === 1 ? "guess" : "guesses"}.
        </p>

        <div className="mx-auto mt-4 flex h-44 w-28 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 shadow-lg">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <Clapperboard className="h-12 w-12 text-subtle" aria-hidden />
          )}
        </div>

        <p className="mt-4 select-none text-lg font-medium leading-snug">
          {title}
        </p>
        {year ? (
          <p className="mt-0.5 select-none text-sm text-subtle">{year}</p>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-6 w-full rounded-xl py-2.5 text-sm font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
