"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { BrandTitle } from "@/components/BrandTitle";
import { PageFrame } from "@/components/PageFrame";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { dailyPuzzleKey, puzzleKeyToSlug } from "@/lib/puzzle-key-url";
import { utcDateString } from "@/lib/dates";

export default function HomePage() {
  const [user, setUser] = useState<{ displayName: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => null);
  }, []);

  const today = utcDateString();
  const dailySlug = puzzleKeyToSlug(dailyPuzzleKey(today));

  return (
    <PageFrame>
      <AppTopBar trailing={<ThemeSwitcher />} />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
        <div>
          <BrandTitle className="text-4xl sm:text-5xl" />
          <p className="mt-3 text-sm text-muted">
            Guess the movie title — one daily puzzle for everyone.
          </p>
        </div>

        <nav className="flex w-full max-w-xs flex-col gap-3">
          <Link
            href={`/play/${dailySlug}`}
            className="btn-primary rounded-2xl py-3.5 text-center text-sm font-semibold"
          >
            Daily puzzle
          </Link>
          <Link
            href="/previous"
            className="btn-ghost rounded-2xl py-3.5 text-center text-sm font-semibold"
          >
            Previous games
          </Link>
          <Link
            href="/unlimited"
            className="btn-ghost rounded-2xl py-3.5 text-center text-sm font-semibold"
          >
            Unlimited
          </Link>
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2 pb-6">
        {user ? (
          <Link href="/account" className="text-sm text-accent-text hover:underline">
            Account · {user.displayName}
          </Link>
        ) : (
          <Link href="/login" className="text-sm text-accent-text hover:underline">
            Login
          </Link>
        )}
        <p className="text-xs text-subtle">Progress saves on this device. Log in to sync.</p>
      </div>
    </PageFrame>
  );
}
