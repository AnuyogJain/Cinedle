"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageFrame, PageTitle } from "@/components/PageFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readLocalProgress, type ProgressMap } from "@/lib/progress-local";
import { pullServerProgressIntoLocal } from "@/lib/progress-remote-sync";
import { dailyPuzzleKey, puzzleKeyToSlug } from "@/lib/puzzle-key-url";
import { utcDateString } from "@/lib/dates";
import { cn } from "@/lib/utils";

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export default function PreviousPage() {
  const [today, setToday] = useState<string | null>(null);
  const [year, setYear] = useState(() =>
    Number(utcDateString().slice(0, 4)),
  );
  const [month, setMonth] = useState(() =>
    Number(utcDateString().slice(5, 7)) - 1,
  );
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setToday(utcDateString());
    void pullServerProgressIntoLocal().then(() =>
      setProgress(readLocalProgress()),
    );
  }, []);

  const cells = useMemo(() => {
    const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const total = daysInMonth(year, month);
    const items: Array<{ date: string; day: number } | null> = [];
    for (let i = 0; i < firstDow; i++) items.push(null);
    for (let d = 1; d <= total; d++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      items.push({ date: `${year}-${mm}-${dd}`, day: d });
    }
    return items;
  }, [year, month]);

  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
  };

  return (
    <PageFrame>
      <AppTopBar backHref="/" />

      <main className="flex-1 py-6">
        <PageTitle description="Replay past daily puzzles. Green days are solved on this device.">
          Previous games
        </PageTitle>

        <Card className="calendar-panel bg-card/60">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="calendar-control"
                onClick={() => shiftMonth(-1)}
              >
                ‹
              </Button>
              <span className="text-sm text-muted-foreground">
                {new Date(Date.UTC(year, month, 1)).toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="calendar-control"
                onClick={() => shiftMonth(1)}
              >
                ›
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-subtle">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                if (!cell) return <div key={`e-${i}`} aria-hidden />;
                const key = dailyPuzzleKey(cell.date);
                const done = progress[key]?.solved;
                const isFuture = today != null && cell.date > today;
                const slug = puzzleKeyToSlug(key);
                const dayClass = cn(
                  "calendar-day flex h-10 items-center justify-center rounded-lg text-sm transition",
                  isFuture
                    ? "calendar-day--future pointer-events-none"
                    : done
                      ? "calendar-day--solved"
                      : "calendar-day--open",
                );

                if (isFuture) {
                  return (
                    <div key={cell.date} className={dayClass} aria-hidden>
                      {cell.day}
                    </div>
                  );
                }

                return (
                  <Link key={cell.date} href={`/play/${slug}`} className={dayClass}>
                    {cell.day}
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </PageFrame>
  );
}
