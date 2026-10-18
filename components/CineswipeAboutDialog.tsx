"use client";

import { Clapperboard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CineswipeAboutDialog({
  open,
  onClose,
  appUrl,
}: {
  open: boolean;
  onClose: () => void;
  appUrl: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-0 border-b border-border/60 px-5 pb-4 pt-5 text-left">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border bg-background">
            <Clapperboard className="h-5 w-5" aria-hidden />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Taste &amp; library
          </p>
          <DialogTitle className="font-display text-xl uppercase">
            CineSwipe
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Swipe through film picks matched to your taste, then explore liked
            and watched titles on a world map.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-1.5 px-5 py-4 text-sm text-muted-foreground">
          <li>• Discover deck with genre and cast filters</li>
          <li>• Liked, wishlist, and watched lists</li>
          <li>• Globe view movies by country</li>
        </ul>

        <div className="border-t border-border/60 px-5 py-4">
          {appUrl ? (
            <Button
              variant="default"
              size="lg"
              className="btn-cta w-full"
              asChild
            >
              <a href={appUrl} target="_blank" rel="noopener noreferrer">
                Open CineSwipe
                <ExternalLink className="h-4 w-4" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Set <code className="text-foreground">CINESWIPE_APP_URL</code> to
              enable the link.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
