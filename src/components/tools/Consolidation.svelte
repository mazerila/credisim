<script lang="ts">
  import { consolidate } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import { current } from '../../lib/state.svelte';
  import NumberField from '../ui/NumberField.svelte';

  let loans = $state([
    { balance: 8000, payment: 280, rate: 7 },
    { balance: 3000, payment: 150, rate: 19 },
    { balance: 12000, payment: 320, rate: 5.5 },
  ]);
  let rate = $state(6.5);
  let months = $state(84);
  let fees = $state(800);
  let income = $state(current().income || 3500);
  const r = $derived(consolidate(loans.map((l) => ({ ...l, rate: l.rate / 100 })), rate / 100, months, fees, income));
  const money = (v: number) => (Number.isFinite(v) ? fmt.eur(v) : '∞');
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('loansToGroup')}</h3>
    {#each loans as l, i (i)}
      <div class="loan">
        <div class="head"><b>{t('loanN', { n: i + 1 })}</b>{#if loans.length > 1}<button type="button" class="link-btn small" onclick={() => loans.splice(i, 1)}>{t('removeLoan')}</button>{/if}</div>
        <div class="three">
          <NumberField id="cs-b{i}" label={t('balanceShort')} step={500} bind:value={l.balance} />
          <NumberField id="cs-p{i}" label={t('paymentShort')} step={10} bind:value={l.payment} />
          <NumberField id="cs-r{i}" label={t('rateShort')} unit="%" step={0.1} bind:value={l.rate} />
        </div>
      </div>
    {/each}
    {#if loans.length < 6}<button type="button" class="link-btn" onclick={() => loans.push({ balance: 5000, payment: 150, rate: 8 })}>{t('addLoan')}</button>{/if}
    <h3>{t('newOffer')}</h3>
    <div class="two">
      <NumberField id="cs-rate" label={t('newRate')} unit="%" step={0.1} bind:value={rate} />
      <NumberField id="cs-months" label={t('newDuration')} unit={t('unitMonths')} step={12} min={12} bind:value={months} />
    </div>
    <div class="two">
      <NumberField id="cs-fees" label={t('consFees')} step={100} bind:value={fees} />
      <NumberField id="cs-income" label={t('income')} step={100} bind:value={income} />
    </div>
  </div>
  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('consMonthly')}</span><span class="fig-value">{fmt.eur(r.monthlyAfter)}</span><span class="fig-sub">{fmt.eur(r.monthlyBefore)} → {fmt.eur(r.monthlyAfter)}</span></div>
      <div class="fig"><span class="fig-label">{t('consExtra')}</span><span class="fig-value" class:bad={r.extraCost > 0} class:good={r.extraCost < 0}>{Number.isFinite(r.extraCost) ? (r.extraCost >= 0 ? '+' : '−') + fmt.eur(Math.abs(r.extraCost)) : '–'}</span></div>
    </div>
    <section class="card">
      <table class="compare-rows">
        <thead><tr><th></th><th>{t('consBefore')}</th><th>{t('consAfter')}</th></tr></thead>
        <tbody>
          <tr><td>{t('consMonthly')}</td><td>{fmt.eur(r.monthlyBefore)}</td><td>{fmt.eur(r.monthlyAfter)}</td></tr>
          <tr><td>{t('rDuration')}</td><td>{t('months', { n: Number.isFinite(r.longestBefore) ? r.longestBefore : '∞' })}</td><td>{t('months', { n: months })}</td></tr>
          <tr><td>{t('consTotal')}</td><td>{money(r.totalBefore)}</td><td>{fmt.eur(r.totalAfter)}</td></tr>
          {#if r.ratioBefore !== null && r.ratioAfter !== null}
            <tr><td>{t('consRatio')}</td><td>{fmt.pct(r.ratioBefore, 1)}</td><td>{fmt.pct(r.ratioAfter, 1)}</td></tr>
          {/if}
        </tbody>
      </table>
    </section>
    <p class="hint-box">{t('consHint')}</p>
  </div>
</div>

<style>
  .loan { display: grid; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid var(--sep); }
  .head { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
  .three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .three :global(input) { font-size: 15px; padding-inline: 8px; }
</style>
