"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageFrame } from "@/components/PageFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { pullServerProgressIntoLocal } from "@/lib/progress-remote-sync";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ displayName: string; username: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/login?next=/account"));
  }, [router]);

  const exportBackup = () => {
    window.location.href = "/api/backup/export";
  };

  const importBackup = async (file: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/backup/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      await pullServerProgressIntoLocal();
      setMessage("Progress restored from backup.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const uploadServerBackup = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/backup/upload", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setMessage("Backup saved on server.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Server backup failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadServerBackup = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/backup/download");
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cinedle-backup-server.csv";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Server backup downloaded.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Download failed");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  };

  if (!user) {
    return <p className="py-20 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <PageFrame className="py-4">
      <AppTopBar backHref="/" />

      <div className="mb-2">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">
          {user.displayName}
        </h1>
        <Badge variant="outline" className="mt-2">
          @{user.username}
        </Badge>
      </div>

      <Card className="mt-6 border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Progress backup</CardTitle>
          <CardDescription>
            Export or import puzzle progress as CSV. Server backup requires Turso.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {message ? (
            <p className="text-sm text-primary">{message}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={exportBackup}
          >
            Export to file
          </Button>
          <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-card/40 px-5 text-sm font-semibold backdrop-blur-sm hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-50">
            Import from file
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importBackup(file);
              }}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void uploadServerBackup()}
          >
            Save backup on server
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void downloadServerBackup()}
          >
            Download server backup
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-8 bg-border" />

      <Button type="button" variant="ghost" className="w-full" onClick={() => void logout()}>
        Log out
      </Button>
    </PageFrame>
  );
}
