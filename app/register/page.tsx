"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandTitle } from "@/components/BrandTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readLocalProgress } from "@/lib/progress-local";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setUsernameError(null);
    if (password.length < 8) {
      setPasswordError("At least 8 characters");
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
      const message =
        err instanceof Error ? err.message : "Registration failed";
      if (/username/i.test(message)) {
        setUsernameError(message);
      } else {
        setPasswordError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <BrandTitle className="text-2xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account (optional)
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-md">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
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
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError(null);
                  }}
                  aria-invalid={usernameError != null}
                  aria-describedby={
                    usernameError ? "username-error" : undefined
                  }
                  className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                />
                {usernameError ? (
                  <p id="username-error" className="text-sm text-rose-300">
                    {usernameError}
                  </p>
                ) : null}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  aria-invalid={passwordError != null}
                  aria-describedby={
                    passwordError ? "password-error" : undefined
                  }
                  className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                />
                {passwordError ? (
                  <p id="password-error" className="text-sm text-rose-300">
                    {passwordError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
