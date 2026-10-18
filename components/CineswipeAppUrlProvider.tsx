"use client";

import { createContext, useContext, type ReactNode } from "react";

const CineswipeAppUrlContext = createContext<string | null>(null);

export function CineswipeAppUrlProvider({
  appUrl,
  children,
}: {
  appUrl: string | null;
  children: ReactNode;
}) {
  return (
    <CineswipeAppUrlContext.Provider value={appUrl}>
      {children}
    </CineswipeAppUrlContext.Provider>
  );
}

export function useCineswipeAppUrl(): string | null {
  return useContext(CineswipeAppUrlContext);
}
