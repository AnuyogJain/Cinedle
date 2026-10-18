"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageFrame, PageTitle } from "@/components/PageFrame";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { COUNTRY_OPTIONS, TMDB_GENRES } from "@/lib/genres";
import { unlimitedPuzzleKey, puzzleKeyToSlug } from "@/lib/puzzle-key-url";

export default function UnlimitedPage() {
  const router = useRouter();
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const [country, setCountry] = useState("");

  const toggleGenre = (id: number) => {
    setGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const start = () => {
    const id = crypto.randomUUID();
    const params = new URLSearchParams();
    if (genreIds.length) params.set("genres", genreIds.join(","));
    if (country) params.set("country", country);
    const qs = params.toString();
    router.push(
      `/play/${puzzleKeyToSlug(unlimitedPuzzleKey(id))}${qs ? `?${qs}` : ""}`,
    );
  };

  return (
    <PageFrame>
      <AppTopBar backHref="/" trailing={<ThemeSwitcher />} />

      <main className="flex-1 py-6">
        <PageTitle description="Random movie titles with optional filters. Same rules as daily play.">
          Unlimited
        </PageTitle>

        <section className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
            Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {TMDB_GENRES.map((g) => {
              const active = genreIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    active
                      ? "bg-accent-soft text-accent-text ring-1 ring-accent/40"
                      : "btn-ghost"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-subtle">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="app-input w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </section>

        <button
          type="button"
          onClick={start}
          className="btn-primary w-full rounded-2xl py-3 text-sm font-semibold"
        >
          Start puzzle
        </button>
      </main>
    </PageFrame>
  );
}
