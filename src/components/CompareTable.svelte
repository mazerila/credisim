<script lang="ts">
  import { CREDIT_TYPES, type Inputs, type Result } from '../lib/engine';
  import { fmt, t, type Key } from '../lib/i18n/index.svelte';
  import { SCENARIO_NAMES } from '../lib/share';
  import { app } from '../lib/state.svelte';

  let { list }: { list: { inp: Inputs; r: Result }[] } = $props();
  const unit = $derived(CREDIT_TYPES[list[0].inp.type].durationUnit);

  type Kind = 'money' | 'pct' | 'months' | 'rate';
  const lines: { key: Key; kind: Kind; get: (x: { inp: Inputs; r: Result }) => number; lowerIsBetter?: boolean }[] = [
    { key: 'cPrincipal', kind: 'money', get: (x) => x.r.totalBorrowed },
    { key: 'cDuration', kind: 'months', get: (x) => x.inp.months },
    { key: 'sensRate', kind: 'rate', get: (x) => x.inp.rate / 100, lowerIsBetter: true },
    { key: 'cMonthly', kind: 'money', get: (x) => x.r.monthlyMax, lowerIsBetter: true },
    { key: 'cInterest', kind: 'money', get: (x) => x.r.totalInterest, lowerIsBetter: true },
    { key: 'cInsurance', kind: 'money', get: (x) => x.r.totalInsurance, lowerIsBetter: true },
    { key: 'cCost', kind: 'money', get: (x) => x.r.creditCost, lowerIsBetter: true },
    { key: 'cTaeg', kind: 'pct', get: (x) => x.r.taeg, lowerIsBetter: true },
    { key: 'cDebt', kind: 'pct', get: (x) => x.r.debtRatio?.value ?? 0, lowerIsBetter: true },
  ];
  const show = (kind: Kind, v: number) =>
    kind === 'money' ? fmt.eur(v) : kind === 'months' ? fmt.duration(v, unit) : kind === 'rate' ? fmt.pct(v) : fmt.pct(v, v < 0.2 ? 2 : 1);
  const diff = (kind: Kind, d: number) => {
    const same = kind === 'money' ? Math.abs(d) < 0.5 : kind === 'months' ? d === 0 : Math.abs(d) < 0.00005;
    if (same) return '=';
    return (d > 0 ? '+' : '−') + show(kind, Math.abs(d));
  };
</script>

<section class="card">
  <h2 class="card-title">{t('compareTitle')}</h2>
  <div class="scroll">
    <table>
      <thead>
        <tr><th></th>{#each list as _, i (i)}<th class:cur={i === app.active}>{SCENARIO_NAMES[i]}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each lines as l (l.key)}
          {#if l.key !== 'cInsurance' || list.some((x) => x.r.totalInsurance > 0)}
            <tr>
              <td>{t(l.key)}</td>
              {#each list as x, i (i)}
                {@const v = l.get(x)}
                {@const d = v - l.get(list[0])}
                <td class:cur={i === app.active}>
                  <span class="v">{show(l.kind, v)}</span>
                  {#if i > 0}
                    <span class="d" class:better={l.lowerIsBetter && d < 0 && diff(l.kind, d) !== '='} class:worse={l.lowerIsBetter && d > 0 && diff(l.kind, d) !== '='}>{diff(l.kind, d)}</span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .scroll { overflow-x: auto; }
  th, td { padding: 9px 12px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--sep); font-size: 15px; vertical-align: top; }
  th { font-weight: 600; font-family: var(--font-display); font-size: 17px; }
  th:first-child, td:first-child { text-align: left; color: var(--text-2); font-weight: 400; padding-left: 0; }
  tr:last-child td { border-bottom: 0; }
  .cur { background: var(--accent-soft); }
  .v { display: block; font-weight: 500; }
  .d { display: block; font-size: 12px; color: var(--text-3); }
  .better { color: var(--ok); font-weight: 600; }
  .worse { color: var(--bad); font-weight: 600; }
</style>
