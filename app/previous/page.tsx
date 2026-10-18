"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageFrame, PageTitle } from "@/components/PageFrame";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { readLocalProgress } from "@/lib/progress-local";
import { dailyPuzzleKey, puzzleKeyToSlug } from "@/lib/puzzle-key-url";
import { utcDateString } from "@/lib/dates";

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export default function PreviousPage() {
  const today = utcDateString();
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1);

  const progress = useMemo(() => readLocalProgress(), []);

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
      <AppTopBar backHref="/" trailing={<ThemeSwitcher />} />

      <main className="flex-1 py-6">
        <PageTitle description="Replay past daily puzzles. Green days are solved on this device.">
          Previous games
        </PageTitle>

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            className="btn-ghost rounded-lg px-3 py-1 text-sm"
            onClick={() => shiftMonth(-1)}
          >
            ‹
          </button>
          <span className="text-sm text-muted">
            {new Date(Date.UTC(year, month, 1)).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </span>
          <button
            type="button"
            className="btn-ghost rounded-lg px-3 py-1 text-sm"
            onClick={() => shiftMonth(1)}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-subtle">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`e-${i}`} />;
            const key = dailyPuzzleKey(cell.date);
            const done = progress[key]?.solved;
            const isFuture = cell.date > today;
            const slug = puzzleKeyToSlug(key);
            return (
              <Link
                key={cell.date}
                href={isFuture ? "#" : `/play/${slug}`}
                aria-disabled={isFuture}
                className={`flex h-10 items-center justify-center rounded-lg text-sm ${
                  isFuture
                    ? "pointer-events-none opacity-30"
                    : done
                      ? "bg-emerald-500/25 font-semibold text-emerald-200"
                      : "btn-ghost"
                }`}
              >
                {cell.day}
              </Link>
            );
          })}
        </div>
      </main>
    </PageFrame>
  );
}
