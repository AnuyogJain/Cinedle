export function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
