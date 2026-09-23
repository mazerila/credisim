<script lang="ts">
  import { bnpl } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import NumberField from '../ui/NumberField.svelte';
  import Segmented from '../ui/Segmented.svelte';

  let price = $state(600);
  let n = $state('4');
  let feePct = $state(2.2);
  let feeFixed = $state(0);
  const r = $derived(bnpl(price, Number(n), feePct / 100, feeFixed));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <NumberField id="bn-price" label={t('purchase')} step={10} bind:value={price} />
    <Segmented label={t('instalments')} options={['2', '3', '4', '6', '10'].map((v) => ({ value: v, label: v + '×' }))} bind:value={n} />
    <div class="two">
      <NumberField id="bn-pct" label={t('feePct')} unit="%" step={0.1} bind:value={feePct} />
      <NumberField id="bn-fixed" label={t('feeFixed')} step={1} bind:value={feeFixed} />
    </div>
  </div>
  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('kTaeg')}</span><span class="fig-value">{fmt.pct(r.taeg)}</span><span class="fig-sub">{t('taegMax', { u: fmt.pct(r.usuryLimit) })}</span></div>
      <div class="fig"><span class="fig-label">{t('bnplToday')}</span><span class="fig-value">{fmt.eur(r.today, 2)}</span><span class="fig-sub">{t('bnplThen', { n: Number(n) - 1, v: fmt.eur(r.instalment, 2) })}</span></div>
      <div class="fig"><span class="fig-label">{t('bnplTotal')}</span><span class="fig-value" class:bad={r.fees > 0}>{fmt.eur(r.total, 2)}</span><span class="fig-sub">{t('bnplFees')} {fmt.eur(r.fees, 2)}</span></div>
    </div>
    {#if r.fees === 0}<p class="hint-box">{t('bnplFree')}</p>{/if}
    {#if r.taeg > r.usuryLimit}<p class="pill bad">{t('usuryBad', { u: fmt.pct(r.usuryLimit) })}</p>{/if}
    <p class="hint-box">{t('bnplHint')}</p>
  </div>
</div>
