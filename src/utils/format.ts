/** Format influence numbers like Unity `Monitor.FormatNumberToString`. */
export function formatNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000 && abs < 1_000_000_000) {
    return `${Math.round((n / 1_000_000) * 100) / 100}mill`;
  }
  if (abs >= 1_000_000_000 && abs < 1_000_000_000_000) {
    return `${Math.round((n / 1_000_000_000) * 100) / 100}bill`;
  }
  if (abs >= 1_000_000_000_000) {
    return `${Math.round((n / 1_000_000_000_000) * 100) / 100}trill`;
  }
  return Math.floor(n).toLocaleString('en-US');
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
