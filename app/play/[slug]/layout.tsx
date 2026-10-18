import { Suspense, type ReactNode } from "react";

export default function PlayLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p className="py-20 text-center text-sm text-muted">Loading…</p>}>{children}</Suspense>;
}
