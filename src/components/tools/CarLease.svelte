<script lang="ts">
  import { leaseVsLoan } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import NumberField from '../ui/NumberField.svelte';

  let price = $state(30000);
  let first = $state(3000);
  let rent = $state(350);
  let months = $state(48);
  let option = $state(12000);
  let valueAtEnd = $state(13000);
  let loanRate = $state(5.5);
  const r = $derived(leaseVsLoan({ price, firstPayment: first, rent, months, option, valueAtEnd, loanRate: loanRate / 100 }));
  const best = $derived(Math.min(r.net.loan, r.net.leaseBuy, r.net.leaseReturn));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <NumberField id="cl-price" label={t('carPrice')} step={500} bind:value={price} />
    <NumberField id="cl-first" label={t('firstPayment')} step={500} bind:value={first} />
    <div class="two">
      <NumberField id="cl-rent" label={t('rentMonthly')} step={10} bind:value={rent} />
      <NumberField id="cl-months" label={t('leaseMonths')} unit={t('unitMonths')} step={12} min={12} bind:value={months} />
    </div>
    <NumberField id="cl-option" label={t('purchaseOption')} step={500} bind:value={option} />
    <NumberField id="cl-value" label={t('valueAtEnd')} step={500} bind:value={valueAtEnd} />
    <NumberField id="cl-rate" label={t('leaseLoanRate')} unit="%" step={0.1} bind:value={loanRate} />
  </div>
  <div class="tool-results">
    <section class="card">
      <table class="compare-rows">
        <thead><tr><th></th><th>{t('optLoan')}</th><th>{t('optLeaseBuy')}</th><th>{t('optLeaseReturn')}</th></tr></thead>
        <tbody>
          <tr><td>{t('rPayment')}</td><td>{fmt.eur(r.loanPayment)}</td><td>{fmt.eur(rent)}</td><td>{fmt.eur(rent)}</td></tr>
          <tr><td>{t('paidTotal')}</td><td>{fmt.eur(r.loanTotal)}</td><td>{fmt.eur(r.leaseBuy)}</td><td>{fmt.eur(r.leaseReturn)}</td></tr>
          <tr class="net"><td>{t('netCost')}</td>
            <td class:best={r.net.loan === best}>{fmt.eur(r.net.loan)}</td>
            <td class:best={r.net.leaseBuy === best}>{fmt.eur(r.net.leaseBuy)}</td>
            <td class:best={r.net.leaseReturn === best}>{fmt.eur(r.net.leaseReturn)}</td></tr>
        </tbody>
      </table>
      <p class="muted small">{t('netCostHint')}</p>
      {#if r.leaseRate !== null}<p class="rate">{t('leaseRate', { v: fmt.pct(r.leaseRate) })}</p>{/if}
    </section>
    <p class="hint-box">{t('leaseHint')}</p>
  </div>
</div>

<style>
  .net td { font-weight: 600; }
  .best { color: var(--ok); }
  p { margin: 12px 0 0; }
  .rate { font-weight: 600; }
</style>
