"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { BrandTitle } from "./BrandTitle";

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
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/90 px-2 py-3 backdrop-blur-sm">
      {backHref ? (
        <Link
          href={backHref}
          className={`${sideSlot} rounded-full text-muted hover:bg-surface-hover`}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      ) : (
        <div className={sideSlot} aria-hidden />
      )}
      <div className="min-w-0 flex-1 text-center">
        <BrandTitle className="text-lg" />
        {subtitle ? (
          <p className="truncate text-xs text-subtle">{subtitle}</p>
        ) : null}
      </div>
      <div className={`${sideSlot} justify-end`}>{trailing ?? <span aria-hidden />}</div>
    </header>
  );
}
