<script lang="ts">
  import { revolving } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import NumberField from '../ui/NumberField.svelte';

  let drawn = $state(4000);
  let rate = $state(19);
  let pay = $state(120);
  let loanRate = $state(6);
  const r = $derived(revolving(drawn, rate / 100, pay, loanRate / 100));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <NumberField id="rv-drawn" label={t('amountDrawn')} step={100} bind:value={drawn} />
    <NumberField id="rv-rate" label={t('revRate')} unit="%" step={0.1} bind:value={rate} />
    <NumberField id="rv-pay" label={t('monthlyPayment')} step={10} bind:value={pay} />
    <p class="muted small">{t('revMin', { v: fmt.eur(r.minimumPayment, 2) })}</p>
    <NumberField id="rv-loan" label={t('loanRateCompare')} unit="%" step={0.1} bind:value={loanRate} />
  </div>
  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('revInterest')}</span><span class="fig-value">{fmt.eur(r.totalInterest)}</span><span class="fig-sub">{t('revMonths')} {fmt.duration(r.months, 'months')}</span></div>
      <div class="fig"><span class="fig-label">{t('kTaeg')}</span><span class="fig-value" class:bad={r.taeg > r.usuryLimit}>{fmt.pct(r.taeg)}</span><span class="fig-sub">{t('taegMax', { u: fmt.pct(r.usuryLimit) })}</span></div>
      <div class="fig"><span class="fig-label">{t('revExtra')}</span><span class="fig-value bad">+{fmt.eur(Math.max(0, r.extraCost))}</span><span class="fig-sub">{t('revVsLoan')}</span></div>
    </div>
    <section class="card">
      <table class="compare-rows">
        <thead><tr><th></th><th>{t('tool_revolving')}</th><th>{t('type_personal')} ({fmt.pct(r.loan.rate, 1)})</th></tr></thead>
        <tbody>
          <tr><td>{t('rPayment')}</td><td>{fmt.eur(r.payment, 2)}</td><td>{fmt.eur(r.loan.payment, 2)}</td></tr>
          <tr><td>{t('revMonths')}</td><td>{t('months', { n: r.months })}</td><td>{t('months', { n: r.months })}</td></tr>
          <tr><td>{t('revInterest')}</td><td>{fmt.eur(r.totalInterest)}</td><td>{fmt.eur(r.loan.totalInterest)}</td></tr>
        </tbody>
      </table>
    </section>
    <p class="hint-box">{t('revHint')}</p>
  </div>
</div>

<style>p { margin: 0; }</style>
