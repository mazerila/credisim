<script lang="ts">
  import type { Row } from '../lib/engine';
  import { niceMax, ticks, yearStep } from '../lib/chart';
  import { fmt, t } from '../lib/i18n/index.svelte';

  type Series = { label: string; color: string; principal: number; rows: Row[] };
  let { series }: { series: Series[] } = $props();

  const W = 420, H = 230, L = 46, RP = 10, T = 14, B = 28;
  const n = $derived(Math.max(1, ...series.map((s) => s.rows.length)));
  const max = $derived(niceMax(Math.max(1, ...series.map((s) => s.principal))));
  const x = (k: number) => L + ((W - L - RP) * k) / n;
  const y = (v: number) => H - B - ((H - T - B) * v) / max;
  const path = (s: Series) =>
    [[0, s.principal] as const, ...s.rows.map((r) => [r.k, r.balance] as const)]
      .map(([k, v], i) => `${i ? 'L' : 'M'}${x(k).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  const years = $derived(Math.ceil(n / 12));
  const xTicks = $derived.by(() => {
    const step = yearStep(years);
    const out: number[] = [];
    for (let yr = 0; yr <= years; yr += step) out.push(yr);
    return out;
  });
  const half = $derived.by(() => {
    const s = series[0];
    if (!s) return null;
    const row = s.rows.find((r) => r.balance <= s.principal / 2);
    return row ? { k: row.k, v: row.balance } : null;
  });
</script>

<section class="card">
  <h2 class="card-title">{t('balanceTitle')}</h2>
  <svg viewBox="0 0 {W} {H}" role="img" aria-label={t('balanceTitle')}>
    {#each ticks(max) as v (v)}
      <line x1={L} x2={W - RP} y1={y(v)} y2={y(v)} stroke="var(--sep)" stroke-width="1" />
      <text x={L - 8} y={y(v) + 4} text-anchor="end" class="axis">{fmt.compact(v)}</text>
    {/each}
    {#each xTicks as yr (yr)}
      <text x={x(yr * 12)} y={H - 8} text-anchor="middle" class="axis">{yr}</text>
    {/each}
    {#each series as s, i (s.label)}
      {#if i === 0}<path d="{path(s)}L{x(s.rows.length)} {y(0)}L{x(0)} {y(0)}Z" fill={s.color} opacity="0.1" />{/if}
      <path d={path(s)} fill="none" stroke={s.color} stroke-width="2.5" stroke-linejoin="round" stroke-dasharray={i ? '6 5' : ''} />
    {/each}
    {#if half && series.length === 1}
      <circle cx={x(half.k)} cy={y(half.v)} r="4.5" fill="var(--surface)" stroke={series[0].color} stroke-width="2.5" />
      <text x={x(half.k) > W * 0.55 ? x(half.k) - 10 : x(half.k) + 10} y={y(half.v) - 12} text-anchor={x(half.k) > W * 0.55 ? 'end' : 'start'} class="note">{t('balanceHalf', { t: fmt.years(half.k) })}</text>
    {/if}
  </svg>
  {#if series.length > 1}
    <ul class="legend">
      {#each series as s, i (s.label)}<li><i style="background:{s.color};{i ? 'opacity:.7' : ''}"></i>{s.label}</li>{/each}
    </ul>
  {/if}
</section>

<style>
  svg { width: 100%; height: auto; display: block; overflow: visible; }
  .axis { fill: var(--text-3); font: 12px var(--font); }
  .note { fill: var(--text); font: 600 12px var(--font); }
  .legend { list-style: none; padding: 0; margin: 10px 0 0; display: flex; gap: 18px; font-size: 14px; }
  .legend li { display: flex; align-items: center; gap: 6px; }
  .legend i { width: 14px; height: 3px; border-radius: 2px; }
</style>
