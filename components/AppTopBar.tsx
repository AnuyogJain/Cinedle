"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppearanceToggle } from "./AppearanceToggle";
import { CineswipeHeaderButton } from "./CineswipeHeaderButton";
import { BrandTitle } from "./BrandTitle";
import { cn } from "@/lib/utils";

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
    <header className="app-top-bar glass-panel sticky top-0 z-20 -mx-4 mb-4 shrink-0 border-x-0 border-t-0 px-2 pt-[env(safe-area-inset-top,0px)] shadow-lg shadow-black/20">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 py-3">
        <div className="flex min-h-10 items-center justify-start gap-1">
          {backHref ? (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 appearance-toggle"
              asChild
            >
              <Link href={backHref} aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          ) : null}
        </div>

        <div
          className={cn(
            "flex max-w-[min(100%,14rem)] flex-col items-center justify-center gap-1 text-center",
            !subtitle && "min-h-10 justify-center",
          )}
        >
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

        <div className="flex min-h-10 items-center justify-end gap-1">
          {trailing}
          <CineswipeHeaderButton />
          <AppearanceToggle />
        </div>
      </div>
    </header>
  );
}
