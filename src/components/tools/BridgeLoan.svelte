<script lang="ts">
  import { bridgeLoan } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import NumberField from '../ui/NumberField.svelte';
  import Segmented from '../ui/Segmented.svelte';
  import SliderField from '../ui/SliderField.svelte';

  let value = $state(300000);
  let share = $state(70);
  let owed = $state(50000);
  let rate = $state(4.8);
  let months = $state(18);
  let mode = $state<'partial' | 'total'>('partial');
  const r = $derived(bridgeLoan({ value, share: share / 100, owed, rate: rate / 100, months, mode }));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <NumberField id="br-value" label={t('homeValue')} step={5000} bind:value={value} />
    <SliderField id="br-share" label={t('bridgeShare')} bind:value={share} min={50} max={80} step={5} unit="%" decimals={0} />
    <NumberField id="br-owed" label={t('owed')} step={1000} bind:value={owed} />
    <div class="two">
      <NumberField id="br-rate" label={t('bridgeRate')} unit="%" step={0.05} bind:value={rate} />
      <NumberField id="br-months" label={t('bridgeMonths')} unit={t('unitMonths')} step={3} min={3} max={36} bind:value={months} />
    </div>
    <Segmented label={t('bridgeMode')} options={[{ value: 'partial', label: t('bm_partial') }, { value: 'total', label: t('bm_total') }]} bind:value={mode} />
  </div>
  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('bridgeAmount')}</span><span class="fig-value">{fmt.eur(r.amount)}</span><span class="fig-sub">{mode === 'partial' ? `${t('bridgeMonthly')} ${fmt.eur(r.monthly, 2)}` : t('bm_total')}</span></div>
      <div class="fig"><span class="fig-label">{t('bridgeInterest')}</span><span class="fig-value">{fmt.eur(r.interest)}</span><span class="fig-sub">{fmt.pct(rate / 100)} · {t('months', { n: months })}</span></div>
      <div class="fig"><span class="fig-label">{t('bridgeLeft')}</span><span class="fig-value">{fmt.eur(r.leftFromSale)}</span>
        <span class="fig-sub" class:bad={r.leftIfTenPctLower < 0}>{t('bridgeLower', { v: fmt.eur(r.leftIfTenPctLower) })}</span></div>
    </div>
    {#if rate / 100 > r.usuryLimit}<p class="pill bad">{t('usuryBad', { u: fmt.pct(r.usuryLimit) })}</p>{/if}
    <p class="hint-box">{t('bridgeHint', { u: fmt.pct(r.usuryLimit) })}</p>
  </div>
</div>

<style>.bad { color: var(--bad); font-weight: 600; }</style>
