<script lang="ts">
  import { balanceAfter, renegotiate, simulate } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import { current } from '../../lib/state.svelte';
  import NumberField from '../ui/NumberField.svelte';

  const start = current();
  const sim = simulate(start);
  const paid = Math.min(60, Math.round(start.months / 3));
  // Pretend the loan was taken 1 point higher than today's rate, some years ago.
  const startRate = Math.round((start.rate + 1) * 100) / 100;
  const startBalance = Math.round(balanceAfter(sim.principal, startRate / 100, start.months, paid));
  let balance = $state(startBalance);
  let remaining = $state(start.months - paid);
  let currentRate = $state(startRate);
  let currentIns = $state(Math.round(sim.insuranceMonthly * 100) / 100);
  let newRate = $state(start.rate);
  let newMonths = $state(start.months - paid);
  let newIns = $state(Math.round(sim.insuranceMonthly * 100) / 100);
  let fees = $state(1000);
  let guarantee = $state(Math.round(startBalance * 0.0075 + 300));
  let penalty = $state(true);
  let financeCosts = $state(false);

  const r = $derived(renegotiate({
    balance, remainingMonths: remaining, currentRate: currentRate / 100, newRate: newRate / 100, newMonths,
    currentInsurance: currentIns, newInsurance: newIns, fees, guarantee, penalty, financeCosts,
  }));
  const dur = (m: number) => (m >= 24 ? fmt.years(m) : t('months', { n: m }));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('currentLoan')}</h3>
    <NumberField id="rn-balance" label={t('balance')} step={1000} bind:value={balance} />
    <div class="two">
      <NumberField id="rn-rem" label={t('remainingMonths')} unit={t('unitMonths')} step={12} min={12} bind:value={remaining} />
      <NumberField id="rn-rate" label={t('currentRate')} unit="%" step={0.05} bind:value={currentRate} />
    </div>
    <NumberField id="rn-ins" label={t('insPerMonth')} step={5} bind:value={currentIns} />
    <h3>{t('newOffer')}</h3>
    <div class="two">
      <NumberField id="rn-nrate" label={t('newRate')} unit="%" step={0.05} bind:value={newRate} />
      <NumberField id="rn-nmonths" label={t('newDuration')} unit={t('unitMonths')} step={12} min={12} bind:value={newMonths} />
    </div>
    <NumberField id="rn-nins" label={t('insPerMonth')} step={5} bind:value={newIns} />
    <div class="two">
      <NumberField id="rn-fees" label={t('newFees')} step={100} bind:value={fees} />
      <NumberField id="rn-guar" label={t('newGuarantee')} step={100} bind:value={guarantee} />
    </div>
    <label class="check"><input type="checkbox" bind:checked={penalty} /> <span>{t('applyPenalty')}</span></label>
    <label class="check"><input type="checkbox" bind:checked={financeCosts} /> <span>{t('financeCosts')}</span></label>
  </div>

  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('rSaving')}</span><span class="fig-value">{fmt.eur(r.saving)}</span>
        <span class="fig-sub">{r.breakEvenMonth ? t('rBreakEven', { n: dur(r.breakEvenMonth) }) : t('rNotWorth')}</span></div>
      <div class="fig"><span class="fig-label">{t('rPerMonth')}</span><span class="fig-value" class:good={r.monthlyDifference > 0} class:bad={r.monthlyDifference < 0}>{r.monthlyDifference > 0 ? '−' : '+'}{fmt.eur(Math.abs(r.monthlyDifference))}</span>
        <span class="fig-sub">{fmt.eur(r.currentPayment + currentIns)} → {fmt.eur(r.newPayment + newIns)}</span></div>
      <div class="fig"><span class="fig-label">{t('rCosts')}</span><span class="fig-value">{fmt.eur(r.costs)}</span>
        <span class="fig-sub">{t('rPenalty')} {fmt.eur(r.penaltyAmount)}</span></div>
    </div>
    <section class="card">
      <table class="compare-rows">
        <thead><tr><th></th><th>{t('rToday')}</th><th>{t('rWithOffer')}</th></tr></thead>
        <tbody>
          <tr><td>{t('rPayment')}</td><td>{fmt.eur(r.currentPayment, 2)}</td><td>{fmt.eur(r.newPayment, 2)}</td></tr>
          <tr><td>{t('rDuration')}</td><td>{dur(remaining)}</td><td>{dur(newMonths)}</td></tr>
          <tr><td>{t('loanAmount')}</td><td>{fmt.eur(balance)}</td><td>{fmt.eur(r.newPrincipal)}</td></tr>
          <tr><td>{t('rStillToPay')}</td><td>{fmt.eur(r.currentTotal)}</td><td>{fmt.eur(r.newTotal)}</td></tr>
        </tbody>
      </table>
    </section>
    <p class="hint-box">{t('renegoHint')}</p>
  </div>
</div>
