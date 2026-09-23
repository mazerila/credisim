<script lang="ts">
  import type { Inputs, Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';
  import Info from './ui/Info.svelte';

  let { r, inp }: { r: Result; inp: Inputs } = $props();
  // Show the first month big, and the later steps (deferral, PTZ, smoothing) below.
  const phases = $derived(r.phases);
</script>

<section class="kpis" aria-live="polite">
  <div class="kpi lead">
    <span class="label">{t('kMonthly')}</span>
    <span class="value num">{fmt.eur(r.monthlyTotal)}</span>
    <span class="sub">{r.insuranceMonthly > 0 ? t('kMonthlySub', { ins: fmt.eur(r.insuranceMonthly) }) : t('kMonthlySubNoIns')}</span>
    {#if phases.length === 2 || phases.length === 3}
      <ul class="phases">
        {#each phases as p, i (p.from)}
          <li><span>{t('kFromTo', { from: p.from, to: p.to })}</span><b class="num">{fmt.eur(p.amount)}</b></li>
        {/each}
      </ul>
    {:else if phases.length > 3}
      <span class="sub">{t('kVarying', { a: fmt.eur(phases[0].amount), b: fmt.eur(phases[phases.length - 1].amount) })}</span>
    {/if}
  </div>

  <div class="kpi">
    <span class="label">{t('kTaeg')} <Info text={t('tip_taeg')} learn="taeg" /></span>
    <span class="value num">{fmt.pct(r.taeg)}</span>
    <span class="sub">{t('kTaegSub', { rate: fmt.pct(inp.rate / 100) })}</span>
    <span class="pill {r.usury.ok ? 'ok' : 'bad'}">{t(r.usury.ok ? 'usuryOk' : 'usuryBad', { u: fmt.pct(r.usury.limit) })}</span>
    {#if r.usury.stale}<span class="pill warn">{t('usuryStale', { q: r.usury.quarter })}</span>{/if}
  </div>

  <div class="kpi">
    <span class="label">{t('kCost')} <Info text={t('tip_cost')} learn="taeg" /></span>
    <span class="value num">{fmt.eur(r.creditCost)}</span>
    <span class="sub">{t('kCostSub', { amount: fmt.eur(r.principal) })}</span>
  </div>

  <div class="kpi">
    <span class="label">{t('kDebt')} <Info text={t('tip_debt')} learn="debt-ratio" /></span>
    {#if r.debtRatio}
      <span class="value num">{fmt.pct(r.debtRatio.value, 1)}</span>
      <span class="sub">{t('kDebtSub')}</span>
      {#if r.duration}
        <span class="pill {r.debtRatio.ok ? 'ok' : 'bad'}">{t(r.debtRatio.ok ? 'debtOk' : 'debtBad')}</span>
      {:else}
        <span class="pill {r.debtRatio.ok ? 'ok' : 'warn'}">{t(r.debtRatio.ok ? 'debtOk' : 'debtInfo')}</span>
      {/if}
      {#if r.duration && !r.duration.ok}<span class="pill warn">{t('durBad')}</span>{/if}
      {#if r.moneyLeft}
        <span class="left">{t('moneyLeft', { v: fmt.eur(r.moneyLeft.total) })}{#if inp.persons > 1} · {t('moneyLeftPer', { p: fmt.eur(r.moneyLeft.perPerson) })}{/if}
          <Info text={t('tip_moneyLeft')} learn="debt-ratio" /></span>
      {/if}
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
    background: var(--surface); border: 1px solid var(--card-border); border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 20px 22px; display: grid; gap: 4px; align-content: start; min-width: 0;
  }
  .kpi.lead { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  .kpi.lead .label, .kpi.lead .sub { color: inherit; opacity: 0.85; }
  .label { font-size: 14px; font-weight: 500; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
  .value { font-family: var(--font-display); font-size: clamp(30px, 3.6vw, 40px); white-space: nowrap; font-weight: 600; letter-spacing: -0.03em; line-height: 1.15; }
  .sub { font-size: 13px; color: var(--text-2); letter-spacing: -0.01em; }
  .pill { margin-top: 6px; }
  .phases { list-style: none; margin: 8px 0 0; padding: 8px 0 0; border-top: 1px solid rgba(255, 255, 255, 0.25); display: grid; gap: 2px; font-size: 13px; }
  .phases li { display: flex; justify-content: space-between; gap: 10px; }
  .phases span { opacity: 0.85; }
  .left { font-size: 13px; color: var(--text-2); margin-top: 6px; display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
</style>
