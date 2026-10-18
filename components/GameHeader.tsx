"use client";

import { Button } from "@/components/ui/button";
import { AppTopBar } from "./AppTopBar";
import { InfoIcon } from "lucide-react";

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
