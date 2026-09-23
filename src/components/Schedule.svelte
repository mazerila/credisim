<script lang="ts">
  import type { Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';
  import Segmented from './ui/Segmented.svelte';

  let { r }: { r: Result } = $props();
  let view = $state<'year' | 'month'>('year');
  let expanded = $state(false);
  const LIMIT = 12;

  const lines = $derived(
    view === 'year'
      ? r.years.map((y) => ({ n: y.year, pay: y.payment + y.insurance, i: y.interest, c: y.capital, ins: y.insurance, bal: y.balance }))
      : r.rows.map((m) => ({ n: m.k, pay: m.payment + m.insurance, i: m.interest, c: m.capital, ins: m.insurance, bal: m.balance })),
  );
  const shown = $derived(expanded ? lines : lines.slice(0, LIMIT));
  const hasIns = $derived(r.totalInsurance > 0);
</script>

<section class="card">
  <div class="head">
    <h2 class="card-title">{t('schedTitle')}</h2>
    <Segmented size="sm" label={t('schedTitle')} options={[{ value: 'year', label: t('byYear') }, { value: 'month', label: t('byMonth') }]} bind:value={view} />
  </div>
  <div class="scroll">
    <table>
      <thead>
        <tr>
          <th>{t(view === 'year' ? 'colYear' : 'colMonth')}</th><th>{t('colPayment')}</th><th>{t('colInterest')}</th><th>{t('colCapital')}</th>
          {#if hasIns}<th>{t('colInsurance')}</th>{/if}<th>{t('colBalance')}</th>
        </tr>
      </thead>
      <tbody>
        {#each shown as l (l.n)}
          <tr>
            <td>{l.n}</td><td>{fmt.eur(l.pay, 2)}</td><td>{fmt.eur(l.i, 2)}</td><td>{fmt.eur(l.c, 2)}</td>
            {#if hasIns}<td>{fmt.eur(l.ins, 2)}</td>{/if}<td>{fmt.eur(l.bal, 2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if lines.length > LIMIT}
    <button type="button" class="link-btn more" onclick={() => (expanded = !expanded)}>
      {expanded ? t('showLess') : t('showAll', { n: lines.length })}
    </button>
  {/if}
</section>

<style>
  .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .head .card-title { margin: 0; }
  .scroll { overflow-x: auto; }
  th, td { padding: 9px 12px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--sep); font-size: 15px; }
  th { font-size: 13px; font-weight: 600; color: var(--text-2); }
  th:first-child, td:first-child { text-align: left; padding-left: 0; }
  td:first-child { color: var(--text-2); }
  .more { margin-top: 14px; }
</style>
