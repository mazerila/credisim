<script lang="ts">
  import { monthlyPayment } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';
  import SliderField from '../../ui/SliderField.svelte';

  let amount = $state(100000);
  let rate = $state(3);
  let years = $state(20);
  const pay = $derived(Math.round(monthlyPayment(amount, rate / 100, years * 12) * 100) / 100);
  const total = $derived(pay * years * 12);
</script>

<div class="ex">
  <div class="controls">
    <SliderField id="ex-pay-amount" label={t('exAmount')} bind:value={amount} min={10000} max={600000} step={5000} unit="€" factor={1} decimals={0} integer />
    <SliderField id="ex-pay-rate" label={t('exRate')} bind:value={rate} min={0} max={8} step={0.05} unit="%" />
    <SliderField id="ex-pay-years" label={t('exYears')} bind:value={years} min={1} max={30} step={1} unit={t('unitYears')} decimals={0} integer />
  </div>
  <div class="out">
    <div><span>{t('exPayment')}</span><b class="num big">{fmt.eur(pay, 2)}</b></div>
    <div><span>{t('exInterest')}</span><b class="num">{fmt.eur(total - amount)}</b></div>
    <div><span>{t('exTotal')}</span><b class="num">{fmt.eur(total)}</b></div>
  </div>
</div>

<style>
  .controls { display: grid; gap: 14px; }
  .out { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--sep); }
  @media (max-width: 520px) { .out { grid-template-columns: minmax(0, 1fr); } }
  .out div { display: grid; gap: 2px; }
  span { font-size: 13px; color: var(--text-2); }
  b { font-size: 19px; font-weight: 600; }
  .big { font-size: 24px; color: var(--accent); }
</style>
