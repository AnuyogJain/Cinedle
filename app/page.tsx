"use client";

import Link from "next/link";
import { Calendar, Infinity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageFrame } from "@/components/PageFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { utcDateString } from "@/lib/dates";
import { readLocalProgress } from "@/lib/progress-local";
import { dailyPuzzleKey, puzzleKeyToSlug } from "@/lib/puzzle-key-url";
import { cn } from "@/lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatUsDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function utcWeekDays(
  anchorDate: string
): Array<{ date: string; dow: string; day: number }> {
  const [y, m, d] = anchorDate.split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d));
  const start = new Date(anchor);
  start.setUTCDate(anchor.getUTCDate() - anchor.getUTCDay());

  return Array.from({ length: 7 }, (_, i) => {
    const cur = new Date(start);
    cur.setUTCDate(start.getUTCDate() + i);
    const date = utcDateString(cur);
    return { date, dow: DOW[i], day: cur.getUTCDate() };
  });
}

export default function HomePage() {
  const [user, setUser] = useState<{ displayName: string } | null>(null);
  const today = utcDateString();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => null);
  }, []);

  const weekDays = useMemo(() => utcWeekDays(today), [today]);
  const progress = useMemo(() => readLocalProgress(), []);
  const dailySlug = puzzleKeyToSlug(dailyPuzzleKey(today));

  return (
    <PageFrame>
      <AppTopBar />

      <main className="flex flex-1 flex-col justify-center gap-4 py-6">
        <Card className="border-border/80 bg-card/90">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-base font-semibold">Daily game</p>
              <p className="min-w-0 flex-1 truncate text-center text-sm text-muted-foreground">
                {formatUsDate(today)}
              </p>
              <Button size="sm" className="shrink-0 px-4" asChild>
                <Link href={`/play/${dailySlug}`}>Play</Link>
              </Button>
            </div>

            <Separator className="bg-border/80" />

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(({ date, dow, day }) => {
                const isToday = date === today;
                const isFuture = date > today;
                const slug = puzzleKeyToSlug(dailyPuzzleKey(date));
                const solved = progress[dailyPuzzleKey(date)]?.solved;

                const cell = (
                  <div
                    className={cn(
                      "flex flex-col items-center rounded-xl px-0.5 py-2 transition",
                      isToday &&
                        "home-day--today bg-primary/15 ring-1 ring-primary/35 shadow-[0_0_20px_-6px_var(--primary-glow)]",
                      !isToday && !isFuture && "hover:bg-secondary/60",
                      isFuture && "opacity-35",
                      solved && !isToday && "home-day--solved"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {dow}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 text-lg font-semibold leading-none",
                        isToday ? "text-primary" : "text-foreground"
                      )}
                    >
                      {day}
                    </span>
                  </div>
                );

                if (isFuture) {
                  return (
                    <div
                      key={date}
                      aria-disabled
                      className="cursor-not-allowed"
                    >
                      {cell}
                    </div>
                  );
                }

                return (
                  <Link
                    key={date}
                    href={`/play/${slug}`}
                    className="block rounded-xl"
                  >
                    {cell}
                  </Link>
                );
              })}
            </div>

            <Button
              variant="default"
              size="lg"
              className="mt-1 w-full gap-2"
              asChild
            >
              <Link href="/previous">
                <Calendar className="h-4 w-4" aria-hidden />
                Previous games
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <p className="flex items-center gap-2 text-base font-semibold">
              Unlimited
              <Infinity className="h-5 w-5 text-primary" aria-hidden />
            </p>
            <Button size="sm" className="shrink-0 px-4" asChild>
              <Link href="/unlimited">Play</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <div className="flex flex-col items-center gap-2 pb-6">
        {user ? (
          <Link
            href="/account"
            className="auth-link text-sm font-medium underline underline-offset-2"
          >
            Account · {user.displayName}
          </Link>
        ) : (
          <Link
            href="/login"
            className="auth-link text-sm font-medium underline underline-offset-2"
          >
            Login
          </Link>
        )}
        <p className="text-xs text-subtle">
          Progress saves on this device. Log in to sync.
        </p>
      </div>
    </PageFrame>
  );
}
