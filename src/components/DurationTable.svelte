<script lang="ts">
  import { CREDIT_TYPES, simulate, type Inputs } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { inp }: { inp: Inputs } = $props();
  const spec = $derived(CREDIT_TYPES[inp.type]);
  const options = $derived.by(() => {
    const base = inp.type === 'mortgage' ? [120, 180, 240, 300] : inp.type === 'works' ? [36, 60, 96, 120] : [24, 36, 48, 60, 72];
    return [...new Set([...base, inp.months])].filter((m) => m >= spec.months.min && m <= spec.months.max).sort((a, b) => a - b);
  });
  const cols = $derived(options.map((m) => ({ m, r: simulate({ ...inp, months: m }) })));
  type Col = (typeof cols)[number];
  const rows: { key: 'cMonthly' | 'cInterest' | 'cInsurance' | 'cCost' | 'cTaeg' | 'cDebt'; fmt: (c: Col) => string; bad?: (c: Col) => boolean }[] = [
    { key: 'cMonthly', fmt: (c) => fmt.eur(c.r.monthlyTotal) },
    { key: 'cInterest', fmt: (c) => fmt.eur(c.r.totalInterest) },
    { key: 'cInsurance', fmt: (c) => fmt.eur(c.r.totalInsurance) },
    { key: 'cCost', fmt: (c) => fmt.eur(c.r.creditCost) },
    { key: 'cTaeg', fmt: (c) => fmt.pct(c.r.taeg), bad: (c) => !c.r.usury.ok },
    { key: 'cDebt', fmt: (c) => (c.r.debtRatio ? fmt.pct(c.r.debtRatio.value, 1) : '–'), bad: (c) => !!c.r.debtRatio && !c.r.debtRatio.ok },
  ];
</script>

<section class="card">
  <h2 class="card-title">{t('durTitle')}</h2>
  <div class="scroll">
    <table>
      <thead>
        <tr><th></th>{#each cols as c (c.m)}<th class:cur={c.m === inp.months}>{fmt.duration(c.m, spec.durationUnit)}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each rows as row (row.key)}
          {#if row.key !== 'cInsurance' || cols[0].r.totalInsurance > 0}
            <tr>
              <td>{t(row.key)}</td>
              {#each cols as c (c.m)}<td class:cur={c.m === inp.months} class:bad={row.bad?.(c)}>{row.fmt(c)}</td>{/each}
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .scroll { overflow-x: auto; margin: 0 -8px; }
  th, td { padding: 10px 12px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--sep); font-size: 15px; }
  th { font-weight: 600; font-size: 15px; }
  th:first-child, td:first-child { text-align: left; color: var(--text-2); font-weight: 400; }
  tr:last-child td { border-bottom: 0; }
  .cur { background: var(--accent-soft); }
  th.cur { color: var(--accent); border-radius: 10px 10px 0 0; }
  .bad { color: var(--bad); font-weight: 600; }
</style>
