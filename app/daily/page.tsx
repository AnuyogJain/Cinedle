import { redirect } from "next/navigation";
import { dailyPuzzleKey, puzzleKeyToSlug } from "@/lib/puzzle-key-url";
import { utcDateString } from "@/lib/dates";

export default function DailyRedirectPage() {
  redirect(`/play/${puzzleKeyToSlug(dailyPuzzleKey(utcDateString()))}`);
}
