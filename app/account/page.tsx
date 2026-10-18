"use client";

import { CloudUpload, Download, FileUp, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageFrame } from "@/components/PageFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { pullServerProgressIntoLocal } from "@/lib/progress-remote-sync";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    displayName: string;
    username: string;
  } | null>(null);
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
      const res = await fetch("/api/backup/import", {
        method: "POST",
        body: form,
      });
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
    return (
      <PageFrame className="pb-8">
        <AppTopBar backHref="/" />
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </PageFrame>
    );
  }

  return (
    <PageFrame className="pb-8">
      <AppTopBar backHref="/" />

      <section className="mt-2 flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary/50 text-primary"
          aria-hidden
        >
          <User className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display truncate text-2xl font-semibold uppercase tracking-wide">
            {user.displayName}
          </h1>
          <Badge variant="gold" className="mt-1.5 normal-case tracking-normal">
            @{user.username}
          </Badge>
        </div>
      </section>

      {message ? (
        <p
          className={cn(
            "mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground"
          )}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <Card className="mt-6 border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Local backup</CardTitle>
          <CardDescription>
            Export or import progress as a CSV file on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            type="button"
            variant="default"
            disabled={busy}
            className="w-full justify-start gap-2"
            onClick={exportBackup}
          >
            <Download className="h-4 w-4" aria-hidden />
            Export to file
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            className="w-full justify-start gap-2"
            asChild
          >
            <label className="flex w-full cursor-pointer items-center gap-2">
              <FileUp className="h-4 w-4" aria-hidden />
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
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4 border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Server backup</CardTitle>
          <CardDescription>
            Optional copy stored in Turso with your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            className="w-full justify-start gap-2"
            onClick={() => void uploadServerBackup()}
          >
            <CloudUpload className="h-4 w-4" aria-hidden />
            Save backup on server
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            className="w-full justify-start gap-2"
            onClick={() => void downloadServerBackup()}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download server backup
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-8 bg-border" />

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => void logout()}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </Button>
    </PageFrame>
  );
}
