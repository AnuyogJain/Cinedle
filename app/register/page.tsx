"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandTitle } from "@/components/BrandTitle";
import { readLocalProgress } from "@/lib/progress-local";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("At least 8 characters");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");

      const entries = Object.values(readLocalProgress());
      if (entries.length) {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries }),
        }).catch(() => null);
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <BrandTitle className="text-2xl" />
          <p className="mt-2 text-sm text-muted">Create an account (optional)</p>
        </div>

        <form onSubmit={submit} className="app-panel space-y-4 rounded-2xl p-4">
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <div className="space-y-2">
            <label className="text-xs text-subtle" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="app-input w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-subtle" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="app-input w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-subtle" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="app-input w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have one?{" "}
          <Link href="/login" className="text-accent-text hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
