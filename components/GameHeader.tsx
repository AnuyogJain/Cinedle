"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onHelp}
          aria-label="How to play"
        >
          <CircleHelp className="h-5 w-5" />
        </Button>
      }
    />
  );
}
