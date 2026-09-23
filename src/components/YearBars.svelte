<script lang="ts">
  import type { YearRow } from '../lib/engine';
  import { niceMax, ticks, yearStep } from '../lib/chart';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { years }: { years: YearRow[] } = $props();

  const W = 760, H = 260, L = 52, RP = 8, T = 12, B = 28;
  const keys = [
    { f: 'capital' as const, c: 'var(--c-capital)', l: 'lCapital' as const },
    { f: 'interest' as const, c: 'var(--c-interest)', l: 'lInterest' as const },
    { f: 'insurance' as const, c: 'var(--c-insurance)', l: 'lInsurance' as const },
  ];
  const max = $derived(niceMax(Math.max(1, ...years.map((y) => y.capital + y.interest + y.insurance))));
  const slot = $derived((W - L - RP) / Math.max(1, years.length));
  const bw = $derived(Math.min(44, Math.max(3, slot * 0.66)));
  const h = (v: number) => ((H - T - B) * v) / max;
  const step = $derived(yearStep(years.length));
  const bars = $derived(
    years.map((y, i) => {
      let base = H - B;
      const x = L + i * slot + (slot - bw) / 2;
      return {
        y,
        x,
        segs: keys.map((k) => {
          const hh = h(y[k.f]);
          base -= hh;
          return { ...k, top: base, hh };
        }),
      };
    }),
  );
</script>

<section class="card">
  <h2 class="card-title">{t('barsTitle')}</h2>
  <div class="scroll">
    <svg viewBox="0 0 {W} {H}" role="img" aria-label={t('barsTitle')}>
      {#each ticks(max) as v (v)}
        <line x1={L} x2={W - RP} y1={H - B - h(v)} y2={H - B - h(v)} stroke="var(--sep)" stroke-width="1" />
        <text x={L - 8} y={H - B - h(v) + 4} text-anchor="end" class="axis">{fmt.compact(v)}</text>
      {/each}
      {#each bars as b (b.y.year)}
        <g>
          <title>{t('colYear')} {b.y.year} · {t('lCapital')} {fmt.eur(b.y.capital)} · {t('lInterest')} {fmt.eur(b.y.interest)}{b.y.insurance ? ` · ${t('lInsurance')} ${fmt.eur(b.y.insurance)}` : ''}</title>
          {#each b.segs as s (s.f)}
            {#if s.hh > 0}<rect x={b.x} y={s.top} width={bw} height={s.hh} fill={s.c} />{/if}
          {/each}
          {#if years.length <= 10 || b.y.year === 1 || b.y.year % step === 0}
            <text x={b.x + bw / 2} y={H - 8} text-anchor="middle" class="axis">{b.y.year}</text>
          {/if}
        </g>
      {/each}
    </svg>
  </div>
  <ul class="legend">
    {#each keys as k (k.f)}
      {#if k.f !== 'insurance' || years.some((y) => y.insurance > 0)}
        <li><i style="background:{k.c}"></i>{t(k.l)}</li>
      {/if}
    {/each}
  </ul>
</section>

<style>
  .scroll { overflow-x: auto; }
  svg { width: 100%; min-width: 480px; height: auto; display: block; }
  .axis { fill: var(--text-3); font: 12px var(--font); }
  rect { transition: y 0.3s, height 0.3s; }
  g:hover rect { opacity: 0.8; }
  .legend { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 14px; }
  .legend li { display: flex; align-items: center; gap: 6px; }
  .legend i { width: 10px; height: 10px; border-radius: 3px; }
</style>
