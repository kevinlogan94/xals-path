/** Format large influence numbers like the Unity game. */
export function formatNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) return Math.floor(n).toString();
  if (abs < 1_000_000) return `${(n / 1_000).toFixed(2)}K`;
  if (abs < 1_000_000_000) return `${(n / 1_000_000).toFixed(2)} mill`;
  if (abs < 1_000_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} bill`;
  return `${(n / 1_000_000_000_000).toFixed(2)} trill`;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
