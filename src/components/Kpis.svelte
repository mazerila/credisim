<script lang="ts">
  import type { Inputs, Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';
  import Info from './ui/Info.svelte';

  let { r, inp }: { r: Result; inp: Inputs } = $props();
</script>

<section class="kpis" aria-live="polite">
  <div class="kpi lead">
    <span class="label">{t('kMonthly')}</span>
    <span class="value num">{fmt.eur(r.monthlyTotal)}</span>
    <span class="sub">{r.insuranceMonthly > 0 ? t('kMonthlySub', { ins: fmt.eur(r.insuranceMonthly) }) : t('kMonthlySubNoIns')}</span>
  </div>

  <div class="kpi">
    <span class="label">{t('kTaeg')} <Info text={t('tip_taeg')} /></span>
    <span class="value num">{fmt.pct(r.taeg)}</span>
    <span class="sub">{t('kTaegSub', { rate: fmt.pct(inp.rate / 100) })}</span>
    <span class="pill {r.usury.ok ? 'ok' : 'bad'}">{t(r.usury.ok ? 'usuryOk' : 'usuryBad', { u: fmt.pct(r.usury.limit) })}</span>
    {#if r.usury.stale}<span class="pill warn">{t('usuryStale', { q: r.usury.quarter })}</span>{/if}
  </div>

  <div class="kpi">
    <span class="label">{t('kCost')} <Info text={t('tip_cost')} /></span>
    <span class="value num">{fmt.eur(r.creditCost)}</span>
    <span class="sub">{t('kCostSub', { amount: fmt.eur(r.principal) })}</span>
  </div>

  <div class="kpi">
    <span class="label">{t('kDebt')} <Info text={t('tip_debt')} /></span>
    {#if r.debtRatio}
      <span class="value num">{fmt.pct(r.debtRatio.value, 1)}</span>
      <span class="sub">{t('kDebtSub')}</span>
      {#if r.duration}
        <span class="pill {r.debtRatio.ok ? 'ok' : 'bad'}">{t(r.debtRatio.ok ? 'debtOk' : 'debtBad')}</span>
      {:else}
        <span class="pill {r.debtRatio.ok ? 'ok' : 'warn'}">{t(r.debtRatio.ok ? 'debtOk' : 'debtInfo')}</span>
      {/if}
      {#if r.duration && !r.duration.ok}<span class="pill warn">{t('durBad')}</span>{/if}
    {:else}
      <span class="value num muted">–</span>
      <span class="sub">{t('kDebtNone')}</span>
    {/if}
  </div>
</section>

<style>
  .kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media (max-width: 460px) { .kpis { grid-template-columns: minmax(0, 1fr); } }
  .kpi {
    background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 20px 22px; display: grid; gap: 4px; align-content: start; min-width: 0;
  }
  .kpi.lead { background: var(--accent); color: var(--on-accent); }
  .kpi.lead .label, .kpi.lead .sub { color: inherit; opacity: 0.85; }
  .label { font-size: 14px; font-weight: 500; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
  .value { font-family: var(--font-display); font-size: clamp(30px, 3.6vw, 40px); white-space: nowrap; font-weight: 600; letter-spacing: -0.03em; line-height: 1.15; }
  .sub { font-size: 13px; color: var(--text-2); letter-spacing: -0.01em; }
  .pill { margin-top: 6px; }
</style>
