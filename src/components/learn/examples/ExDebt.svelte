<script lang="ts">
  import { principalFromPayment } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';
  import SliderField from '../../ui/SliderField.svelte';

  let income = $state(4000);
  const max = $derived(income * 0.35);
  // insurance ≈ 0.30 %/yr on the initial capital
  const loan = $derived(Math.floor(max / (1 / principalFromPayment(1, 0.032, 300) + 0.003 / 12) / 1000) * 1000);
</script>

<div class="ex">
  <SliderField id="ex-debt-income" label={t('exIncome')} bind:value={income} min={1500} max={15000} step={100} unit="€" decimals={0} integer />
  <div class="out">
    <div><span>{t('exMaxPayment')}</span><b class="num">{fmt.eur(max)}</b></div>
    <div><span>{t('exMaxLoan')}</span><b class="num">{fmt.eur(loan)}</b></div>
  </div>
</div>

<style>
  .out { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--sep); }
  @media (max-width: 520px) { .out { grid-template-columns: minmax(0, 1fr); } }
  .out div { display: grid; gap: 2px; }
  span { font-size: 13px; color: var(--text-2); }
  b { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
</style>
