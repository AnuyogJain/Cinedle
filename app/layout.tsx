import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { CineswipeAppUrlProvider } from "@/components/CineswipeAppUrlProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { APPEARANCE_BOOT_SCRIPT, LIGHT_THEME_COLOR } from "@/lib/appearance";
import { getCineswipeAppUrl } from "@/lib/cineswipe";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Cinedle",
  applicationName: "Cinedle",
  description: "Daily movie title puzzle — cinema-themed Wordle for film buffs",
};

export const viewport: Viewport = {
  themeColor: LIGHT_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cineswipeAppUrl = getCineswipeAppUrl();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-ui-mode="light"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider>
          <CineswipeAppUrlProvider appUrl={cineswipeAppUrl}>
            {children}
          </CineswipeAppUrlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
