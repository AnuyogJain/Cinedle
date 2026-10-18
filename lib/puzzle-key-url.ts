export function puzzleKeyToSlug(puzzleKey: string): string {
  return puzzleKey.replace(":", "-");
}

export function slugToPuzzleKey(slug: string): string {
  const idx = slug.indexOf("-");
  if (idx <= 0) return slug;
  return `${slug.slice(0, idx)}:${slug.slice(idx + 1)}`;
}

export function dailyPuzzleKey(date: string): string {
  return `daily:${date}`;
}

export function unlimitedPuzzleKey(id: string): string {
  return `unlimited:${id}`;
}
