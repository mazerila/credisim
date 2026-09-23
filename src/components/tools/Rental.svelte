<script lang="ts">
  import { monthlyPayment, notaryFees, rentalInvestment } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import NumberField from '../ui/NumberField.svelte';

  let price = $state(200000);
  let extra = $state(Math.round(notaryFees(200000, 'old', 'raised', false)));
  let down = $state(20000);
  let rate = $state(3.4);
  let months = $state(240);
  let insurance = $state(50);
  let rent = $state(900);
  let vacancy = $state(1);
  let charges = $state(60);
  let tax = $state(1000);
  let mgmt = $state(7);
  let pno = $state(150);
  const total = $derived(price + extra);
  const r = $derived(rentalInvestment({ totalCost: total, price, loanAmount: Math.max(0, total - down), rate: rate / 100, months, insurance, rent, vacancyMonths: vacancy, charges, propertyTax: tax, managementPct: mgmt / 100, ownerInsurance: pno }));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('secProject')}</h3>
    <div class="two">
      <NumberField id="rl-price" label={t('rentalPrice')} step={5000} bind:value={price} />
      <NumberField id="rl-extra" label={t('rentalCosts')} step={1000} bind:value={extra} />
    </div>
    <NumberField id="rl-down" label={t('downPayment')} step={1000} bind:value={down} />
    <div class="two">
      <NumberField id="rl-rate" label={t('loanRate')} unit="%" step={0.05} bind:value={rate} />
      <NumberField id="rl-months" label={t('loanMonths')} unit={t('unitMonths')} step={12} min={12} bind:value={months} />
    </div>
    <NumberField id="rl-ins" label={t('insPerMonth')} step={5} bind:value={insurance} />
    <h3>{t('rent')}</h3>
    <div class="two">
      <NumberField id="rl-rent" label={t('rent')} step={10} bind:value={rent} />
      <NumberField id="rl-vac" label={t('vacancy')} unit="" step={0.5} max={12} bind:value={vacancy} />
    </div>
    <div class="two">
      <NumberField id="rl-charges" label={t('ownerCharges')} step={10} bind:value={charges} />
      <NumberField id="rl-tax" label={t('propertyTax')} step={50} bind:value={tax} />
    </div>
    <div class="two">
      <NumberField id="rl-mgmt" label={t('management')} unit="%" step={0.5} bind:value={mgmt} />
      <NumberField id="rl-pno" label={t('ownerIns')} step={10} bind:value={pno} />
    </div>
  </div>
  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('cashFlow')}</span><span class="fig-value">{r.cashFlow >= 0 ? '+' : '−'}{fmt.eur(Math.abs(r.cashFlow))}</span>
        <span class="fig-sub">{r.cashFlow < 0 ? t('cashNeg', { v: fmt.eur(-r.cashFlow) }) : t('cashPos', { v: fmt.eur(r.cashFlow) })}</span></div>
      <div class="fig"><span class="fig-label">{t('grossYield')}</span><span class="fig-value">{fmt.pct(r.grossYield)}</span></div>
      <div class="fig"><span class="fig-label">{t('netYield')}</span><span class="fig-value">{fmt.pct(r.netYield)}</span></div>
    </div>
    <section class="card">
      <table class="compare-rows">
        <tbody>
          <tr><td>{t('rent')} × {12 - vacancy}</td><td>{fmt.eur(r.rentsPerYear)}</td></tr>
          <tr><td>{t('ownerCharges')}, {t('propertyTax').toLowerCase()}, {t('management').toLowerCase()}, PNO</td><td>− {fmt.eur(r.costsPerYear)}</td></tr>
          <tr><td><b>{t('netYield')}</b></td><td><b>{fmt.eur(r.netRentPerYear)}</b></td></tr>
          <tr><td>{t('rPayment')} + {t('colInsurance').toLowerCase()}</td><td>{fmt.eur(r.payment + insurance, 2)} / {t('unitMonths').replace(/s$/, '')}</td></tr>
        </tbody>
      </table>
    </section>
    <p class="hint-box">{t('rentalHint')}</p>
  </div>
</div>
