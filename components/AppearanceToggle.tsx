"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export function AppearanceToggle() {
  const { isLight, toggleUiMode, hydrated } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="appearance-toggle shrink-0"
      disabled={!hydrated}
      aria-label={isLight ? "Switch to dark appearance" : "Switch to light appearance"}
      title={isLight ? "Dark mode" : "Light mode"}
      onClick={toggleUiMode}
    >
      {isLight ? (
        <Moon className="h-5 w-5" aria-hidden />
      ) : (
        <Sun className="h-5 w-5" aria-hidden />
      )}
    </Button>
  );
}
