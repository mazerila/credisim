/** Round a maximum up to a readable axis top (1, 2, 2.5, 5 × 10ⁿ). */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

export function ticks(max: number, n = 4): number[] {
  return Array.from({ length: n + 1 }, (_, i) => (max * i) / n);
}

/** Year labels that don't crowd: every year up to 10, then every 5. */
export function yearStep(years: number): number {
  return years <= 10 ? 1 : years <= 20 ? 2 : 5;
}
