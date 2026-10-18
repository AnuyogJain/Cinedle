"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppearanceToggle } from "./AppearanceToggle";
import { BrandTitle } from "./BrandTitle";
import { cn } from "@/lib/utils";

const sideSlot =
  "flex min-h-10 min-w-10 shrink-0 items-center justify-center";

export function AppTopBar({
  backHref,
  subtitle,
  trailing,
}: {
  backHref?: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="app-top-bar glass-panel sticky top-0 z-20 -mx-4 mb-1 shrink-0 border-x-0 border-t-0 px-2 py-3 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-2">
        {backHref ? (
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href={backHref} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        ) : (
          <div className={sideSlot} aria-hidden />
        )}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1">
          <BrandTitle className="text-lg leading-none" />
          {subtitle ? (
            <Badge
              variant="gold"
              className="max-w-full truncate px-2.5 py-0.5 text-[11px] font-medium normal-case tracking-normal"
            >
              {subtitle}
            </Badge>
          ) : null}
        </div>
        <div className={cn(sideSlot, "justify-end gap-1")}>
          {trailing}
          <AppearanceToggle />
        </div>
      </div>
    </header>
  );
}
