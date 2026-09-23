<script lang="ts">
  import { borrowingCapacity, COUNTRIES, CREDIT_TYPES, notaryOf, usesProject, type Inputs } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { inp }: { inp: Inputs } = $props();
  const spec = $derived(CREDIT_TYPES[inp.type]);
  const cap = $derived(borrowingCapacity(inp));

  /** Highest price such that price + notary + financed fees − down payment ≈ capacity (guarantee ignored: rough bound). */
  const maxPrice = $derived.by(() => {
    if (!usesProject(inp)) return 0;
    const budget = cap + inp.downPayment;
    let lo = 0, hi = budget;
    for (let it = 0; it < 50; it++) {
      const mid = (lo + hi) / 2;
      const notary = notaryOf({ ...inp, price: mid });
      if (mid + notary <= budget) lo = mid; else hi = mid;
    }
    return Math.floor(lo / 1000) * 1000;
  });
</script>

<section class="card">
  <h2 class="card-title">{t('capacityTitle')}</h2>
  {#if inp.income > 0}
    <p class="muted small">{t('capacityText', { rate: fmt.pct(inp.rate / 100), dur: fmt.duration(inp.months, spec.durationUnit), p: fmt.pct(COUNTRIES[inp.country].debt.limit, 0) })}</p>
    <div class="figs">
      <div><span class="muted small">{t('capacityLoan')}</span><b class="num">{fmt.eur(cap)}</b></div>
      {#if usesProject(inp)}
        <div><span class="muted small">{t('capacityPrice')}</span><b class="num">{fmt.eur(maxPrice)}</b></div>
      {/if}
    </div>
  {:else}
    <p class="muted">{t('capacityNoIncome')}</p>
  {/if}
</section>

<style>
  p { margin: 0 0 14px; }
  .figs { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
  .figs div { display: grid; gap: 2px; }
  b { font-family: var(--font-display); font-size: 28px; font-weight: 600; letter-spacing: -0.03em; }
</style>
