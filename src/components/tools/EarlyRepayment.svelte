<script lang="ts">
  import { earlyRepayment, simulate } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import { current } from '../../lib/state.svelte';
  import NumberField from '../ui/NumberField.svelte';
  import Segmented from '../ui/Segmented.svelte';
  import SliderField from '../ui/SliderField.svelte';

  const start = current();
  const sim = simulate(start);
  let principal = $state(Math.round(sim.principal));
  let rate = $state(start.rate);
  let months = $state(start.months);
  let paid = $state(Math.min(60, Math.round(start.months / 3)));
  let amount = $state(Math.round(sim.principal / 10 / 1000) * 1000 || 10000);
  let mode = $state<'shorten' | 'lower'>('shorten');
  let noPenalty = $state(false);

  const r = $derived(earlyRepayment({ principal, rate: rate / 100, months, paidMonths: paid, amount, mode, noPenalty }));
  const dur = (m: number) => (m >= 24 ? fmt.years(m) : t('months', { n: m }));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('yourLoan')}</h3>
    <NumberField id="er-principal" label={t('loanAmount')} step={1000} bind:value={principal} />
    <div class="two">
      <NumberField id="er-rate" label={t('loanRate')} unit="%" step={0.05} bind:value={rate} />
      <NumberField id="er-months" label={t('loanMonths')} unit={t('unitMonths')} step={12} min={12} bind:value={months} />
    </div>
    <h3>{t('repayAmount')}</h3>
    <SliderField id="er-paid" label={t('paidMonths')} bind:value={paid} min={0} max={Math.max(1, months - 1)} step={1} unit={t('unitMonths')} decimals={0} integer />
    <NumberField id="er-amount" label={t('repayAmount')} step={1000} bind:value={amount} />
    <Segmented label={t('afterRepay')} options={[{ value: 'shorten', label: t('mode_shorten') }, { value: 'lower', label: t('mode_lower') }]} bind:value={mode} />
    <label class="check"><input type="checkbox" bind:checked={noPenalty} /> <span>{t('noPenalty')}</span></label>
  </div>

  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('rNetSaving')}</span><span class="fig-value">{fmt.eur(r.netSaving)}</span><span class="fig-sub">{t('rInterestSaved')} {fmt.eur(r.interestSaved)}</span></div>
      <div class="fig"><span class="fig-label">{t('rPenalty')}</span><span class="fig-value">{fmt.eur(r.penalty)}</span><span class="fig-sub">{t('rBalance')} {fmt.eur(r.balanceBefore)}</span></div>
    </div>
    <section class="card">
      {#if r.full}
        <p class="full">{t('rFull')}</p>
      {:else}
        <table class="compare-rows">
          <thead><tr><th></th><th>{t('rBefore')}</th><th>{t('rAfter')}</th></tr></thead>
          <tbody>
            <tr><td>{t('rPayment')}</td><td>{fmt.eur(r.payment, 2)}</td><td>{fmt.eur(r.newPayment, 2)}</td></tr>
            <tr><td>{t('rDuration')}</td><td>{dur(r.remainingMonths)}</td><td>{dur(r.newRemainingMonths)}{#if r.newRemainingMonths < r.remainingMonths} <span class="muted small">({t('rEarlier', { n: dur(r.remainingMonths - r.newRemainingMonths) })})</span>{/if}</td></tr>
            <tr><td>{t('cInterest')}</td><td>{fmt.eur(r.interestBefore)}</td><td>{fmt.eur(r.interestAfter)}</td></tr>
          </tbody>
        </table>
      {/if}
    </section>
    <p class="hint-box">{t('penaltyHint')}</p>
  </div>
</div>

<style>
  .full { margin: 0; font-size: 17px; font-weight: 600; color: var(--ok); }
</style>
