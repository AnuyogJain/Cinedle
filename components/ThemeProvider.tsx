"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyUiMode,
  getStoredUiMode,
  persistUiMode,
  type UiMode,
} from "@/lib/appearance";

interface ThemeContextValue {
  uiMode: UiMode;
  isLight: boolean;
  hydrated: boolean;
  setUiMode: (mode: UiMode) => void;
  toggleUiMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SSR_UI_MODE: UiMode = "light";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [uiMode, setUiModeState] = useState<UiMode>(SSR_UI_MODE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredUiMode();
    setUiModeState(stored);
    applyUiMode(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyUiMode(uiMode);
    persistUiMode(uiMode);
  }, [uiMode, hydrated]);

  const setUiMode = useCallback((mode: UiMode) => {
    setUiModeState(mode);
  }, []);

  const toggleUiMode = useCallback(() => {
    setUiModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      uiMode,
      isLight: uiMode === "light",
      hydrated,
      setUiMode,
      toggleUiMode,
    }),
    [uiMode, hydrated, setUiMode, toggleUiMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
