"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandTitle } from "@/components/BrandTitle";
import { readLocalProgress, type ProgressMap } from "@/lib/progress-local";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const syncLocalProgress = async () => {
    const map: ProgressMap = readLocalProgress();
    const entries = Object.values(map);
    if (entries.length === 0) return;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    }).catch(() => null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      await syncLocalProgress();
      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className="text-center">
        <BrandTitle className="text-2xl" />
        <p className="mt-2 text-sm text-muted">Sign in to sync progress</p>
      </div>

      <form onSubmit={submit} className="app-panel space-y-4 rounded-2xl p-4">
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <div className="space-y-2">
          <label className="text-xs text-subtle" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="app-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-subtle" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="app-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="text-accent-text hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
