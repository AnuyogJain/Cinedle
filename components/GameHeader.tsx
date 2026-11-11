"use client";

import { Button } from "@/components/ui/button";
import { AppTopBar } from "./AppTopBar";
import { InfoIcon, Share2 } from "lucide-react";

export function GameHeader({
  backHref = "/",
  onHelp,
  onShare,
  subtitle,
}: {
  backHref?: string;
  onHelp: () => void;
  onShare?: () => void;
  subtitle?: string;
}) {
  return (
    <AppTopBar
      backHref={backHref}
      subtitle={subtitle}
      leading={
        onShare ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="appearance-toggle shrink-0"
            onClick={onShare}
            aria-label="Share puzzle"
            title="Share puzzle"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        ) : null
      }
      trailing={
        <Button
          type="button"
          // variant="outline"
          size="icon"
          className="appearance-toggle shrink-0"
          onClick={onHelp}
          aria-label="How to play"
          title="How to play"
        >
          <InfoIcon className="h-5 w-5" />
        </Button>
      }
    />
  );
}
