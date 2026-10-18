"use client";

import { CircleHelp } from "lucide-react";
import { AppTopBar } from "./AppTopBar";

export function GameHeader({
  backHref = "/",
  onHelp,
  subtitle,
}: {
  backHref?: string;
  onHelp: () => void;
  subtitle?: string;
}) {
  return (
    <AppTopBar
      backHref={backHref}
      subtitle={subtitle}
      trailing={
        <button
          type="button"
          onClick={onHelp}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted hover:bg-surface-hover"
          aria-label="How to play"
        >
          <CircleHelp className="h-5 w-5" />
        </button>
      }
    />
  );
}
