<script lang="ts">
  import type { Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { r }: { r: Result } = $props();
  const v = $derived(r.variable!);
  const shown = $derived(v.yearRates.slice(0, Math.min(v.yearRates.length, 10)));
  const top = $derived(Math.max(...shown, v.initialRate) * 1.15 || 0.01);
  const extra = $derived(r.totalInterest + r.totalInsurance - v.costIfStable);
</script>

<section class="card">
  <h2 class="card-title">{t('varTitle')}</h2>
  <div class="bars" role="img" aria-label={t('varTitle')}>
    {#each shown as rate, y (y)}
      <div class="col">
        <span class="v num">{fmt.pct(rate, 2)}</span>
        <div class="bar" class:up={rate > v.initialRate + 1e-9} class:down={rate < v.initialRate - 1e-9} style="height:{(rate / top) * 100}%"></div>
        <span class="y">{y + 1}</span>
      </div>
    {/each}
  </div>
  <p class="axis muted small">{t('varYear')} →</p>
  <div class="stats">
    <div><span>{t('varInitial')}</span><b class="num">{fmt.pct(v.initialRate)}</b></div>
    <div><span>{t('varMax')}</span><b class="num">{fmt.pct(v.maxRate)}</b></div>
    <div><span>{t('varMaxMonthly')}</span><b class="num">{fmt.eur(v.maxMonthly)}</b></div>
    <div><span>{t('varExtra')}</span><b class="num" class:bad={extra > 0.5} class:good={extra < -0.5}>{extra >= 0 ? '+' : '−'}{fmt.eur(Math.abs(extra))}</b></div>
  </div>
  {#if v.worstMonthly !== null}<p class="worst">{t('varWorst', { v: fmt.eur(v.worstMonthly) })}</p>{/if}
  <p class="muted small">{t('varHint')}</p>
</section>

<style>
  .bars { display: flex; align-items: flex-end; gap: 6px; height: 150px; padding-top: 18px; }
  .col { flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 4px; }
  .bar { width: 100%; max-width: 44px; border-radius: 6px 6px 2px 2px; background: var(--c-capital); transition: height 0.3s; }
  .bar.up { background: var(--c-interest); }
  .bar.down { background: var(--c-notary); }
  .v { font-size: 11px; color: var(--text-2); white-space: nowrap; }
  .y { font-size: 12px; color: var(--text-3); }
  .axis { margin: 2px 0 14px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .stats div { display: grid; gap: 2px; }
  .stats span { font-size: 13px; color: var(--text-2); }
  .stats b { font-size: 20px; font-weight: 600; }
  .bad { color: var(--bad); } .good { color: var(--ok); }
  .worst { margin: 14px 0 0; font-weight: 600; color: var(--warn); }
  p { margin: 10px 0 0; }
  @media (max-width: 520px) { .v { display: none; } }
</style>
