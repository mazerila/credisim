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
      ? r.years.map((y) => ({ n: y.year, pay: y.payment + y.insurance, i: y.interest, c: y.capital, ins: y.insurance, bal: y.balance, ptz: ptzByYear[y.year - 1] ?? 0 }))
      : r.rows.map((m) => ({ n: m.k, pay: m.payment + m.insurance, i: m.interest + (m.accrued ?? 0), c: m.capital, ins: m.insurance, bal: m.balance, ptz: m.ptz ?? 0 })),
  );
  const hasIns = $derived(r.totalInsurance > 0);
  const hasPtz = $derived(!!r.ptz);
  const ptzByYear = $derived.by(() => {
    const out: number[] = [];
    for (const m of r.rows) out[Math.floor((m.k - 1) / 12)] = (out[Math.floor((m.k - 1) / 12)] ?? 0) + (m.ptz ?? 0);
    return out;
  });
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
          {#if hasIns}<th>{t('colInsurance')}</th>{/if}{#if hasPtz}<th>{t('colPtz')}</th>{/if}<th>{t('colBalance')}</th>
        </tr>
      </thead>
      <tbody>
        {#each lines as l, i (l.n)}
          <tr class:more={!expanded && i >= LIMIT}>
            <td>{l.n}</td><td>{fmt.eur(l.pay, 2)}</td><td>{fmt.eur(l.i, 2)}</td><td>{fmt.eur(l.c, 2)}</td>
            {#if hasIns}<td>{fmt.eur(l.ins, 2)}</td>{/if}{#if hasPtz}<td>{fmt.eur(l.ptz, 2)}</td>{/if}<td>{fmt.eur(l.bal, 2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if lines.length > LIMIT}
    <button type="button" class="link-btn more-btn" onclick={() => (expanded = !expanded)}>
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
  .more-btn { margin-top: 14px; }
  tr.more { display: none; }
  @media print { tr.more { display: table-row; } .more-btn, .head :global(.seg) { display: none; } }
</style>
