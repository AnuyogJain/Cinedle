export const APPEARANCE_STORAGE_KEY = "cinedle-ui-mode";

export type UiMode = "light" | "dark";

export const DEFAULT_UI_MODE: UiMode = "light";
export const LIGHT_THEME_COLOR = "#fafafa";
export const DARK_THEME_COLOR = "#0a0a0f";

export function normalizeUiMode(value: string | null | undefined): UiMode {
  if (value === "dark") return "dark";
  if (value === "light") return "light";
  return DEFAULT_UI_MODE;
}

export function getStoredUiMode(): UiMode {
  if (typeof window === "undefined") return DEFAULT_UI_MODE;
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (raw == null) return DEFAULT_UI_MODE;
    return normalizeUiMode(raw);
  } catch {
    return DEFAULT_UI_MODE;
  }
}

export function applyUiMode(uiMode: UiMode): void {
  const root = document.documentElement;
  root.setAttribute("data-ui-mode", uiMode);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (uiMode === "light") {
    root.style.colorScheme = "light";
    if (meta) meta.setAttribute("content", LIGHT_THEME_COLOR);
  } else {
    root.style.colorScheme = "dark";
    if (meta) meta.setAttribute("content", DARK_THEME_COLOR);
  }
}

export function persistUiMode(uiMode: UiMode): void {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, uiMode);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Inline boot script — keep in sync with lib/appearance.ts */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  APPEARANCE_STORAGE_KEY
)};var raw=localStorage.getItem(k);var ui=raw==="dark"?"dark":"light";document.documentElement.setAttribute("data-ui-mode",ui);if(ui==="light"){document.documentElement.style.colorScheme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(
  LIGHT_THEME_COLOR
)});}else{document.documentElement.style.colorScheme="dark";}}catch(e){document.documentElement.setAttribute("data-ui-mode",${JSON.stringify(
  DEFAULT_UI_MODE
)});}})();`;
