"use client";

import Link from "next/link";
import { Clapperboard, Database, SearchX, Settings } from "lucide-react";
import type { PuzzleErrorCode } from "@/lib/puzzle-errors";
import { COUNTRY_OPTIONS, TMDB_GENRES } from "@/lib/genres";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatFilterSummary(genres: string, country: string): string[] {
  const labels: string[] = [];
  if (genres.trim()) {
    const ids = new Set(
      genres
        .split(",")
        .map((s) => Number.parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n)),
    );
    for (const g of TMDB_GENRES) {
      if (ids.has(g.id)) labels.push(g.name);
    }
  }
  if (country.trim()) {
    const match = COUNTRY_OPTIONS.find(
      (c) => c.code.toUpperCase() === country.trim().toUpperCase(),
    );
    labels.push(match?.name ?? country.trim().toUpperCase());
  }
  return labels;
}

export function PuzzleLoadError({
  code,
  message,
  backHref,
  filterQuery,
  onRetry,
}: {
  code?: PuzzleErrorCode | string;
  message: string;
  backHref: string;
  filterQuery?: { genres: string; country: string };
  onRetry?: () => void;
}) {
  const filterLabels =
    filterQuery != null
      ? formatFilterSummary(filterQuery.genres, filterQuery.country)
      : [];

  const isFilterMiss = code === "no_eligible_movie";
  const Icon = isFilterMiss
    ? SearchX
    : code === "tmdb_not_configured"
      ? Settings
      : code === "database_unavailable"
        ? Database
        : Clapperboard;

  const title = isFilterMiss
    ? "No movie for these filters"
    : code === "not_found"
      ? "Puzzle not found"
      : code === "tmdb_not_configured"
        ? "Setup required"
        : code === "database_unavailable"
          ? "Database unavailable"
          : "Couldn't load puzzle";

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10">
      <Card className="w-full max-w-md border-border/60 bg-card/70">
        <CardContent className="flex flex-col items-center px-6 py-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-secondary/60">
            <Icon className="h-6 w-6 text-foreground" aria-hidden />
          </div>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>

          {isFilterMiss && filterLabels.length > 0 ? (
            <div className="mt-4 flex max-w-full flex-wrap justify-center gap-1.5">
              {filterLabels.map((label) => (
                <Badge key={label} variant="secondary" className="font-normal">
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            {isFilterMiss ? (
              <Button variant="default" className="w-full sm:w-auto" asChild>
                <Link href="/unlimited">Change filters</Link>
              </Button>
            ) : null}
            {onRetry ? (
              <Button
                variant={isFilterMiss ? "outline" : "default"}
                className="w-full sm:w-auto"
                type="button"
                onClick={onRetry}
              >
                Try again
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href={backHref}>Go back</Link>
            </Button>
          </div>

          {code === "tmdb_not_configured" ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Add <code className="text-foreground">TMDB_API_KEY</code> to{" "}
              <code className="text-foreground">.env.local</code> and restart the
              dev server.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
