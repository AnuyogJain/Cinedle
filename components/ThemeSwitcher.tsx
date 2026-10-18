"use client";

import { DARK_THEMES } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { resolvedId, setThemeId } = useTheme();

  return (
    <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
      {DARK_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          title={theme.label}
          aria-label={theme.label}
          onClick={() => setThemeId(theme.id)}
          className={`h-7 w-7 rounded-full border-2 transition ${
            resolvedId === theme.id
              ? "border-accent-text scale-105"
              : "border-transparent opacity-70 hover:opacity-100"
          }`}
          style={{ background: theme.swatch }}
        />
      ))}
    </div>
  );
}
