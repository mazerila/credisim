/**
 * TAEG / APRC with the EU actuarial method (France since 2016):
 * find the monthly rate i such that  net = Σ flows[k] / (1+i)^(k+1),
 * then annualise: (1+i)^12 − 1.
 *
 * `net` is the amount actually made available (principal − upfront costs);
 * `flows` are the monthly outgoings (payment + insurance).
 */
export function actuarialRate(net: number, flows: number[]): number {
  if (net <= 0 || flows.length === 0) return 0;
  const pv = (i: number) => flows.reduce((s, f, k) => s + f / Math.pow(1 + i, k + 1), 0);
  const total = flows.reduce((s, f) => s + f, 0);
  if (total <= net) return 0;

  // Newton–Raphson, falling back to bisection if it leaves the bracket.
  let lo = 0, hi = 1;
  let i = Math.min(0.5, (total / net - 1) / flows.length);
  for (let it = 0; it < 100; it++) {
    let f = -net, df = 0;
    for (let k = 0; k < flows.length; k++) {
      const d = Math.pow(1 + i, -(k + 1));
      f += flows[k] * d;
      df -= ((k + 1) * flows[k] * d) / (1 + i);
    }
    if (f > 0) lo = i; else hi = i;
    let next = i - f / df;
    if (!(next > lo && next < hi)) next = (lo + hi) / 2;
    if (Math.abs(next - i) < 1e-13) { i = next; break; }
    i = next;
  }
  // Guard against a non-converged result.
  if (Math.abs(pv(i) - net) > 0.01) {
    for (let it = 0; it < 200; it++) {
      const mid = (lo + hi) / 2;
      if (pv(mid) > net) lo = mid; else hi = mid;
    }
    i = (lo + hi) / 2;
  }
  return Math.pow(1 + i, 12) - 1;
}

/** The nominal ("taux débiteur") rate expressed as an actuarial annual rate. */
export function nominalToActuarial(annualRate: number): number {
  return Math.pow(1 + annualRate / 12, 12) - 1;
}
