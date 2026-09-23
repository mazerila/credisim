<script lang="ts">
  import { CREDIT_TYPES, usesProject, type Inputs, type Result } from '../lib/engine';
  import { fmt, i18n, t, type Key } from '../lib/i18n/index.svelte';

  let { inp, r }: { inp: Inputs; r: Result } = $props();
  const spec = $derived(CREDIT_TYPES[inp.type]);
  const today = $derived(new Date().toLocaleDateString(i18n.lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  const items = $derived.by(() => {
    const out: [string, string][] = [[t('typeTitle'), t(`type_${inp.type}` as Key)]];
    if (usesProject(inp)) out.push([t(inp.type === 'car' ? 'price_car' : 'price_mortgage'), fmt.eur(inp.price)], [t('downPayment'), fmt.eur(inp.downPayment)]);
    else out.push([t('amount'), fmt.eur(inp.amount)]);
    out.push([t('rate'), fmt.pct(inp.rate / 100)], [t('duration'), fmt.duration(inp.months, spec.durationUnit)]);
    if (inp.type === 'mortgage' && inp.amortization !== 'annuity') out.push([t('amortization'), t(`am_${inp.amortization}` as Key)]);
    if (inp.type === 'mortgage' && inp.deferralType !== 'none') out.push([t('deferral'), `${t(`df_${inp.deferralType}` as Key)} · ${t('months', { n: inp.deferralMonths })}`]);
    if (r.insuranceMonthly > 0) out.push([t('opt_insurance'), `${fmt.pct(inp.insuranceRate / 100)} · ${t(inp.insuranceBase === 'initial' ? 'base_initial' : 'base_remaining')}`]);
    if (r.ptz) out.push([t('opt_ptz'), fmt.eur(r.ptz.amount)]);
    if (inp.income > 0) out.push([t('income'), fmt.eur(inp.income)]);
    return out;
  });
</script>

<section class="print-only">
  <h1>{t('printTitle')}</h1>
  <p class="date">{t('printDate', { d: today })} · credisim</p>
  <h2>{t('printInputs')}</h2>
  <dl>
    {#each items as [k, v] (k)}<div><dt>{k}</dt><dd>{v}</dd></div>{/each}
  </dl>
</section>

<style>
  .print-only { display: none; }
  h1 { font-size: 24px; margin: 0; }
  .date { margin: 2px 0 14px; color: #555; font-size: 12px; }
  h2 { font-size: 15px; margin: 0 0 6px; }
  dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 24px; margin: 0; font-size: 12px; }
  dl div { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 3px 0; }
  dt { color: #555; } dd { margin: 0; font-weight: 600; }
  @media print { .print-only { display: block; margin-bottom: 12px; } }
</style>
