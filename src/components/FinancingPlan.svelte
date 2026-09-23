<script lang="ts">
  import { CREDIT_TYPES, usesProject, type Inputs, type Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { r, inp }: { r: Result; inp: Inputs } = $props();
  const spec = $derived(CREDIT_TYPES[inp.type]);
  const project = $derived(usesProject(inp));
  const financed = $derived(project && spec.feesFinanced);
</script>

<section class="card">
  <h2 class="card-title">{t('planTitle')}</h2>
  <table>
    <tbody>
      {#if project}
        <tr><td>{t('planPrice')}</td><td>{fmt.eur(inp.price)}</td></tr>
        {#if r.notary}<tr><td>{t('planNotary')} <span class="pct">{fmt.pct(r.notary / inp.price)}</span></td><td>{fmt.eur(r.notary)}</td></tr>{/if}
        {#if r.works}<tr><td>{t('planWorks')}</td><td>{fmt.eur(r.works)}</td></tr>{/if}
        {#if r.fees && financed}<tr><td>{t('planFees')}</td><td>{fmt.eur(r.fees)}</td></tr>{/if}
        {#if r.guarantee}<tr><td>{t('planGuarantee')} <span class="pct">{fmt.pct(r.guarantee / r.principal)}</span></td><td>{fmt.eur(r.guarantee)}</td></tr>{/if}
        <tr class="sum"><td>{t('planTotal')}</td><td>{fmt.eur(inp.price + r.notary + r.works + (financed ? r.fees : 0) + r.guarantee)}</td></tr>
        <tr class="minus"><td>{t('planDown')}</td><td>− {fmt.eur(inp.downPayment)}</td></tr>
      {:else}
        <tr><td>{t('planAmount')}</td><td>{fmt.eur(inp.amount)}</td></tr>
      {/if}
      {#if r.fees && !financed}<tr class="minus"><td>{t('planFeesUpfront')}</td><td>{fmt.eur(r.fees)}</td></tr>{/if}
      {#if r.guarantee && !project}<tr class="minus"><td>{t('planGuaranteeUpfront')}</td><td>{fmt.eur(r.guarantee)}</td></tr>{/if}
      <tr class="total"><td>{t('planLoan')}</td><td>{fmt.eur(r.principal)}</td></tr>
    </tbody>
  </table>
</section>

<style>
  td { padding: 9px 0; border-bottom: 1px solid var(--sep); font-size: 16px; }
  td:last-child { text-align: right; font-weight: 500; }
  tr.sum td { font-weight: 600; }
  .pct { color: var(--text-3); font-size: 14px; margin-left: 4px; font-variant-numeric: tabular-nums; }
  tr.minus td { color: var(--text-2); }
  tr.total td { border-bottom: 0; padding-top: 14px; font-size: 19px; font-weight: 600; }
</style>
