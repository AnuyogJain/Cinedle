"use client";

import { Clapperboard, ExternalLink, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useCineswipeAppUrl } from "@/components/CineswipeAppUrlProvider";
import { posterUrl } from "@/lib/images";
import { buildCineswipeMovieHref } from "@/lib/cineswipe";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function WinModal({
  open,
  guessCount,
  title,
  year,
  posterPath,
  tmdbId,
  onClose,
}: {
  open: boolean;
  guessCount: number;
  title: string;
  year: number;
  posterPath: string | null;
  tmdbId: number | null;
  onClose: () => void;
}) {
  const cineswipeAppUrl = useCineswipeAppUrl();
  const [posterFailed, setPosterFailed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (open) setPosterFailed(false);
  }, [open, posterPath]);

  useEffect(() => {
    if (!open) return;
    setAuthChecked(false);
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLoggedIn(Boolean(data?.user)))
      .catch(() => setLoggedIn(false))
      .finally(() => setAuthChecked(true));
  }, [open]);

  const poster = posterPath && !posterFailed ? posterUrl(posterPath) : null;
  const guessLabel = `${guessCount} ${guessCount === 1 ? "guess" : "guesses"}`;

  const cineswipeHref =
    cineswipeAppUrl && tmdbId != null && tmdbId > 0
      ? buildCineswipeMovieHref(cineswipeAppUrl, tmdbId, loggedIn)
      : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          "max-w-[min(100vw-2rem,22rem)] gap-0 overflow-hidden border-primary/25 p-0",
          "shadow-[0_0_0_1px_rgb(245_197_24/0.12),0_24px_80px_rgb(0_0_0/0.55)]",
        )}
      >
        <div className="relative border-b border-border/50 bg-gradient-to-b from-primary/10 via-transparent to-transparent px-6 pb-5 pt-8 text-center">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            aria-hidden
          />
          <Badge
            variant="gold"
            className="mb-3 gap-1 border-primary/40 px-2.5 py-0.5 normal-case tracking-normal"
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            Solved
          </Badge>
          <DialogTitle className="text-2xl uppercase">Congrats!</DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            You nailed today&apos;s title in{" "}
            <span className="font-medium text-foreground">{guessLabel}</span>.
          </DialogDescription>
        </div>

        <div className="flex flex-col items-center px-6 py-6">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-2xl bg-primary/15 blur-2xl"
              aria-hidden
            />
            <div className="relative aspect-[2/3] w-36 overflow-hidden rounded-xl border border-primary/25 bg-secondary shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:w-40">
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt={title ? `Poster for ${title}` : ""}
                  className="h-full w-full object-cover"
                  onError={() => setPosterFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-background">
                  <Clapperboard
                    className="h-14 w-14 text-muted-foreground/70"
                    aria-hidden
                  />
                </div>
              )}
            </div>
          </div>

          <h3 className="font-display mt-5 select-none text-center text-xl font-semibold leading-snug tracking-wide text-foreground">
            {title}
          </h3>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {year ? (
              <Badge variant="outline" className="border-primary/35 font-normal">
                {year}
              </Badge>
            ) : null}
            <Badge
              variant="secondary"
              className="gap-1 font-normal normal-case tracking-normal"
            >
              <Trophy className="h-3 w-3 text-primary" aria-hidden />
              {guessLabel}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 border-t border-border/50 bg-glass/30 px-6 py-4">
          {cineswipeAppUrl && tmdbId != null && tmdbId > 0 ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              disabled={!authChecked || !cineswipeHref}
              asChild={Boolean(cineswipeHref && authChecked)}
            >
              {cineswipeHref && authChecked ? (
                <a href={cineswipeHref}>
                  View on CineSwipe
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <>View on CineSwipe</>
              )}
            </Button>
          ) : null}
          <Button variant="default" size="lg" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
