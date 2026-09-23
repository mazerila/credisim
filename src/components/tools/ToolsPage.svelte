<script lang="ts">
  import { t, type Key } from '../../lib/i18n/index.svelte';
  import { route, TOOL_GROUPS, TOOLS } from '../../lib/router.svelte';
  import Bnpl from './Bnpl.svelte';
  import BridgeLoan from './BridgeLoan.svelte';
  import CarLease from './CarLease.svelte';
  import Consolidation from './Consolidation.svelte';
  import Rental from './Rental.svelte';
  import RentVsBuy from './RentVsBuy.svelte';
  import Revolving from './Revolving.svelte';
  import CheckOffer from './CheckOffer.svelte';
  import EarlyRepayment from './EarlyRepayment.svelte';
  import InsuranceSwitch from './InsuranceSwitch.svelte';
  import Renegotiation from './Renegotiation.svelte';

  // Tools that start from the current simulation's figures.
  const PREFILLED: string[] = ['early-repayment', 'renegotiation', 'insurance-switch', 'check-offer', 'rent-vs-buy'];

  const ICONS: Record<string, string> = {
    'early-repayment': 'M12 3v14M6 11l6 6 6-6M5 21h14',
    renegotiation: 'M4 7h13l-3-3M20 17H7l3 3',
    'insurance-switch': 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
    'check-offer': 'M5 12l4 4L19 6',
    revolving: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
    bnpl: 'M3 7h18v12H3zM3 11h18M7 15h2M11 15h2M15 15h2',
    'car-lease': 'M5 16h14M4 16v-3l2-5h12l2 5v3M4 16v2h3v-2M17 16v2h3v-2',
    consolidation: 'M4 6h7M4 12h7M4 18h7M11 6l5 6-5 6M16 12h4',
    'bridge-loan': 'M3 18h18M5 18v-6a7 7 0 0 1 14 0v6M9 18v-4M15 18v-4',
    rental: 'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 14h4v6h-4z',
    'rent-vs-buy': 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  };
</script>

{#if route.tool}
  <div class="tool-page">
    <nav class="tabs" aria-label={t('allTools')}>
      <a href="#tools" class="back">‹ {t('allTools')}</a>
      {#each (TOOL_GROUPS.find((g) => (g.tools as readonly string[]).includes(route.tool!))?.tools ?? TOOLS) as id (id)}
        <a href="#tools/{id}" aria-current={route.tool === id ? 'page' : undefined}>{t(`tool_${id}` as Key)}</a>
      {/each}
    </nav>
    <h1>{t(`tool_${route.tool}` as Key)}</h1>
    <p class="lead">{t(`toolDesc_${route.tool}` as Key)}{#if PREFILLED.includes(route.tool)} <span class="muted">{t('prefilled')}</span>{/if}</p>
    {#key route.tool}
      {#if route.tool === 'early-repayment'}<EarlyRepayment />
      {:else if route.tool === 'renegotiation'}<Renegotiation />
      {:else if route.tool === 'insurance-switch'}<InsuranceSwitch />
      {:else if route.tool === 'revolving'}<Revolving />
      {:else if route.tool === 'bnpl'}<Bnpl />
      {:else if route.tool === 'car-lease'}<CarLease />
      {:else if route.tool === 'consolidation'}<Consolidation />
      {:else if route.tool === 'bridge-loan'}<BridgeLoan />
      {:else if route.tool === 'rental'}<Rental />
      {:else if route.tool === 'rent-vs-buy'}<RentVsBuy />
      {:else}<CheckOffer />{/if}
    {/key}
  </div>
{:else}
  <section class="hero">
    <h1>{t('toolsTitle')}</h1>
    <p>{t('toolsLead')}</p>
  </section>
  {#each TOOL_GROUPS as g (g.key)}
    <section class="group">
      <h2>{t(`toolGroup_${g.key}` as Key)}</h2>
      <div class="grid">
        {#each g.tools as id (id)}
          <a class="tool" href="#tools/{id}">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d={ICONS[id]} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <span class="title">{t(`tool_${id}` as Key)}</span>
            <span class="desc">{t(`toolDesc_${id}` as Key)}</span>
          </a>
        {/each}
      </div>
    </section>
  {/each}
{/if}

<style>
  .hero { text-align: center; padding-block: 56px 32px; }
  .hero h1 { font-family: var(--font-display); font-size: clamp(34px, 5.5vw, 56px); font-weight: 700; letter-spacing: -0.035em; line-height: 1.07; margin: 0 0 12px; }
  .hero p { margin: 0 auto; max-width: 36ch; font-size: clamp(19px, 2.2vw, 22px); color: var(--text-2); letter-spacing: -0.02em; text-wrap: balance; }
  .group { margin-top: 32px; }
  .group h2 { font-family: var(--font-display); font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  .tool {
    display: grid; gap: 6px; align-content: start; text-decoration: none; color: var(--text);
    background: var(--surface); border: 1px solid var(--card-border); border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 22px; transition: transform 0.2s;
  }
  .tool:hover { transform: translateY(-2px); }
  .tool svg { color: var(--accent); margin-bottom: 6px; }
  .title { font-size: 19px; font-weight: 600; letter-spacing: -0.02em; }
  .desc { font-size: 15px; color: var(--text-2); line-height: 1.45; }
  .tool-page { padding-top: 28px; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
  .tabs a { font-size: 14px; padding: 6px 12px; border-radius: 999px; color: var(--text-2); text-decoration: none; background: var(--fill-2); }
  .tabs a:hover { color: var(--text); }
  .tabs a[aria-current='page'] { background: var(--accent); color: var(--on-accent); }
  .tabs .back { background: none; color: var(--accent); padding-left: 0; }
  .tool-page h1 { font-family: var(--font-display); font-size: clamp(30px, 4vw, 42px); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 8px; }
  .lead { font-size: 18px; color: var(--text-2); margin: 0 0 24px; max-width: 70ch; }
  .lead .muted { font-size: 15px; }
</style>
