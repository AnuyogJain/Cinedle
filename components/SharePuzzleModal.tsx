"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { puzzleKeyToSlug } from "@/lib/puzzle-key-url";
import { BrandTitle } from "./BrandTitle";

export function SharePuzzleModal({
  open,
  onClose,
  puzzleKey,
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  puzzleKey?: string;
  subtitle?: string;
}) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }

    if (typeof window !== "undefined") {
      let url = window.location.href;
      if (puzzleKey) {
        const slug = puzzleKeyToSlug(puzzleKey);
        const search = window.location.search || "";
        url = `${window.location.origin}/play/${slug}${search}`;
      }
      setShareUrl(url);
      setCanNativeShare(
        typeof navigator !== "undefined" && typeof navigator.share === "function",
      );
    }
  }, [open, puzzleKey]);

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    if (canNativeShare && navigator.share) {
      try {
        await navigator.share({
          title: "Cinedle — Daily Movie Title Puzzle",
          text: `Can you guess the movie title? 🎬🍿`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    await copyToClipboard();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[min(100vw-2rem,24rem)] gap-4 p-5 sm:p-6">
        <DialogHeader className="items-center text-center">
          <Badge
            variant="gold"
            className="mb-1.5 gap-1.5 px-3 py-1 text-xs font-semibold normal-case tracking-normal"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            Share Puzzle
          </Badge>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Challenge Your Friends
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share this puzzle link and see if they can crack the movie title!
          </DialogDescription>
        </DialogHeader>

        {/* Puzzle Preview Card */}
        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-secondary/50 p-3.5 text-center transition-colors">
          <div className="flex items-center justify-center gap-2">
            <BrandTitle className="text-base" />
            {subtitle ? (
              <Badge
                variant="gold"
                className="px-2 py-0.5 text-[10px] font-semibold"
              >
                {subtitle}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Guess the secret movie title • Wordle for film buffs 🎬
          </p>
        </div>

        {/* Link Box & Copy Action */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Puzzle Link
          </label>
          <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 p-1.5 pl-3 focus-within:ring-2 focus-within:ring-primary/50">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground outline-none select-all"
              aria-label="Puzzle URL"
            />
            <Button
              type="button"
              size="sm"
              onClick={copyToClipboard}
              className={`shrink-0 font-semibold transition-all ${copied
                  ? "bg-emerald-600 text-white hover:bg-emerald-600"
                  : "btn-cta bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Native Mobile Share Button (if supported) */}
        {canNativeShare ? (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 font-semibold"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Share via App…</span>
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
