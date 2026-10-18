"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandTitle } from "@/components/BrandTitle";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

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
    return <p className="py-20 text-center text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Home
        </Link>
        <BrandTitle className="text-lg" />
        <ThemeSwitcher />
      </div>

      <h1 className="text-xl font-semibold">{user.displayName}</h1>
      <p className="text-sm text-muted">@{user.username}</p>

      <section className="app-panel mt-8 space-y-3 rounded-2xl p-4">
        <h2 className="text-sm font-medium">Progress backup</h2>
        <p className="text-xs text-subtle">
          Export or import puzzle progress as CSV. Server backup requires Turso.
        </p>
        {message ? <p className="text-sm text-accent-text">{message}</p> : null}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={exportBackup}
            className="btn-ghost rounded-xl py-2 text-sm font-medium"
          >
            Export to file
          </button>
          <label className="btn-ghost cursor-pointer rounded-xl py-2 text-center text-sm font-medium">
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
          <button
            type="button"
            disabled={busy}
            onClick={() => void uploadServerBackup()}
            className="btn-ghost rounded-xl py-2 text-sm font-medium"
          >
            Save backup on server
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadServerBackup()}
            className="btn-ghost rounded-xl py-2 text-sm font-medium"
          >
            Download server backup
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={() => void logout()}
        className="mt-8 w-full rounded-xl border border-border py-2.5 text-sm text-muted hover:bg-surface-hover"
      >
        Log out
      </button>
    </div>
  );
}
