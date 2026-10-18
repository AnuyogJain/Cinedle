"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandTitle } from "@/components/BrandTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { syncProgressWithServer } from "@/lib/progress-remote-sync";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      await syncProgressWithServer();
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
        <p className="mt-2 text-sm text-muted-foreground">Sign in to sync progress</p>
      </div>

      <Card className="border-border/60 bg-card/80 backdrop-blur-md">
        <CardHeader className="pb-0" />
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
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
                  setError(null);
                }}
                className="app-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                aria-invalid={error != null}
                aria-describedby={error ? "login-error" : undefined}
                className="app-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
              />
              {error ? (
                <p id="login-error" className="auth-error text-sm">
                  {error}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="auth-link font-medium underline underline-offset-2">
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
