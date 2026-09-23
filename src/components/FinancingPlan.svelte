<script lang="ts">
  import { CREDIT_TYPES, usesProject, type Inputs, type Result } from '../lib/engine';
  import { fmt, i18n, t } from '../lib/i18n/index.svelte';

  let { r, inp }: { r: Result; inp: Inputs } = $props();
  const spec = $derived(CREDIT_TYPES[inp.type]);
  const countryName = (c: string) => { try { return new Intl.DisplayNames([i18n.lang], { type: 'region' }).of(c) ?? c; } catch { return c; } };
  const project = $derived(usesProject(inp));
  const financed = $derived(project && spec.feesFinanced);
</script>

<section class="card">
  <h2 class="card-title">{t('planTitle')}</h2>
  <table>
    <tbody>
      {#if project}
        <tr><td>{t('planPrice')}</td><td>{fmt.eur(inp.price)}</td></tr>
        {#if r.notary}<tr><td>{t(inp.country === 'FR' ? 'planNotary' : 'purchaseCosts')} <span class="pct">{fmt.pct(r.notary / inp.price)}</span></td><td>{fmt.eur(r.notary)}</td></tr>{/if}
        {#if r.works}<tr><td>{t('planWorks')}</td><td>{fmt.eur(r.works)}</td></tr>{/if}
        {#if r.fees && financed}<tr><td>{t('planFees')}</td><td>{fmt.eur(r.fees)}</td></tr>{/if}
        {#if r.guarantee}<tr><td>{t('planGuarantee')} <span class="pct">{fmt.pct(r.guarantee / r.totalBorrowed)}</span></td><td>{fmt.eur(r.guarantee)}</td></tr>{/if}
        <tr class="sum"><td>{t('planTotal')}</td><td>{fmt.eur(inp.price + r.notary + r.works + (financed ? r.fees : 0) + r.guarantee)}</td></tr>
        <tr class="minus"><td>{t('planDown')}</td><td>− {fmt.eur(inp.downPayment)}</td></tr>
      {:else}
        <tr><td>{t('planAmount')}</td><td>{fmt.eur(inp.amount)}</td></tr>
      {/if}
      {#if r.fees && !financed}<tr class="minus"><td>{t('planFeesUpfront')}</td><td>{fmt.eur(r.fees)}</td></tr>{/if}
      {#if r.guarantee && !project}<tr class="minus"><td>{t('planGuaranteeUpfront')}</td><td>{fmt.eur(r.guarantee)}</td></tr>{/if}
      <tr class="total"><td>{t('planLoan')}</td><td>{fmt.eur(r.totalBorrowed)}</td></tr>
      {#if r.ptz}
        <tr class="split"><td>{t('planMain')}</td><td>{fmt.eur(r.principal)}</td></tr>
        <tr class="split"><td>{t('planPtz')}</td><td>{fmt.eur(r.ptz.amount)}</td></tr>
      {/if}
    </tbody>
  </table>
  {#if inp.country !== 'FR'}<p class="muted small cnote">{t('countryNote', { c: countryName(inp.country) })}</p>{/if}
</section>

<style>
  td { padding: 9px 0; border-bottom: 1px solid var(--sep); font-size: 16px; }
  td:last-child { text-align: right; font-weight: 500; }
  tr.sum td { font-weight: 600; }
  .pct { color: var(--text-3); font-size: 14px; margin-left: 4px; font-variant-numeric: tabular-nums; }
  tr.minus td { color: var(--text-2); }
  .cnote { margin: 12px 0 0; }
  tr.split td { color: var(--text-2); font-size: 15px; padding-left: 14px; border-bottom: 0; padding-block: 4px; }
  tr.split td:last-child { padding-left: 0; }
  tr.total td { border-bottom: 0; padding-top: 14px; font-size: 19px; font-weight: 600; }
</style>
