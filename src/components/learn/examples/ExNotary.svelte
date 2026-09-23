<script lang="ts">
  import { notaryBreakdown } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import SliderField from '../../ui/SliderField.svelte';

  let price = $state(320000);
  let kind = $state<'old' | 'new'>('old');
  let first = $state(false);
  const b = $derived(notaryBreakdown(price, kind, 'raised', first));
</script>

<div class="ex">
  <SliderField id="ex-notary-price" label={t('exPrice')} bind:value={price} min={50000} max={1000000} step={10000} unit="€" decimals={0} integer />
  <div class="opts">
    <Segmented size="sm" label={t('propertyKind')} options={[{ value: 'old', label: t('exOld') }, { value: 'new', label: t('exNew') }]} bind:value={kind} />
    <label><input type="checkbox" bind:checked={first} /> {t('exFirst')}</label>
  </div>
  <table>
    <tbody>
      <tr><td>{t('exTaxes')}</td><td>{fmt.eur(b.taxes)}</td></tr>
      <tr><td>{t('exEmol')}</td><td>{fmt.eur(b.emoluments)}</td></tr>
      <tr><td>{t('exOther')}</td><td>{fmt.eur(b.other)}</td></tr>
      <tr class="total"><td>{t('exNotaryTotal')}</td><td>{fmt.eur(b.total)} <span class="muted">({t('ofPrice', { p: fmt.pct(b.total / price) })})</span></td></tr>
    </tbody>
  </table>
</div>

<style>
  .opts { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin: 14px 0 6px; }
  label { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer; }
  input { width: 18px; height: 18px; accent-color: var(--accent); margin: 0; }
  td { padding: 8px 0; border-bottom: 1px solid var(--sep); font-size: 15px; }
  td:last-child { text-align: right; font-weight: 500; }
  .total td { border-bottom: 0; font-weight: 600; font-size: 17px; }
  .muted { font-weight: 400; font-size: 14px; }
</style>
