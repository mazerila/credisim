<script lang="ts">
  import { CREDIT_TYPES, type Inputs, type Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { a, b, ra, rb }: { a: Inputs; b: Inputs; ra: Result; rb: Result } = $props();
  const unit = $derived(CREDIT_TYPES[a.type].durationUnit);

  type Line = { key: 'cPrincipal' | 'cDuration' | 'cMonthly' | 'cInterest' | 'cInsurance' | 'cCost' | 'cTaeg' | 'cDebt'; va: string; vb: string; d: number; money: boolean; pct?: boolean };
  const lines = $derived<Line[]>([
    { key: 'cPrincipal', va: fmt.eur(ra.principal), vb: fmt.eur(rb.principal), d: rb.principal - ra.principal, money: true },
    { key: 'cDuration', va: fmt.duration(a.months, unit), vb: fmt.duration(b.months, unit), d: b.months - a.months, money: false },
    { key: 'cMonthly', va: fmt.eur(ra.monthlyTotal), vb: fmt.eur(rb.monthlyTotal), d: rb.monthlyTotal - ra.monthlyTotal, money: true },
    { key: 'cInterest', va: fmt.eur(ra.totalInterest), vb: fmt.eur(rb.totalInterest), d: rb.totalInterest - ra.totalInterest, money: true },
    { key: 'cInsurance', va: fmt.eur(ra.totalInsurance), vb: fmt.eur(rb.totalInsurance), d: rb.totalInsurance - ra.totalInsurance, money: true },
    { key: 'cCost', va: fmt.eur(ra.creditCost), vb: fmt.eur(rb.creditCost), d: rb.creditCost - ra.creditCost, money: true },
    { key: 'cTaeg', va: fmt.pct(ra.taeg), vb: fmt.pct(rb.taeg), d: rb.taeg - ra.taeg, money: false, pct: true },
  ]);
  const sign = (d: number) => (d > 0 ? '+' : d < 0 ? '−' : '');
  const diff = (l: Line) =>
    Math.abs(l.d) < 0.005 && !l.pct ? '=' : Math.abs(l.d) < 0.00005 && l.pct ? '=' :
    l.money ? sign(l.d) + fmt.eur(Math.abs(l.d)) :
    l.pct ? sign(l.d) + fmt.pct(Math.abs(l.d)) :
    sign(l.d) + fmt.duration(Math.abs(l.d), unit);
</script>

<section class="card">
  <h2 class="card-title">{t('compareTitle')}</h2>
  <div class="scroll">
    <table>
      <thead><tr><th></th><th>A</th><th>B</th><th>{t('cDiff')}</th></tr></thead>
      <tbody>
        {#each lines as l (l.key)}
          <tr>
            <td>{t(l.key)}</td><td>{l.va}</td><td>{l.vb}</td>
            <td class:up={l.d > 0 && l.key !== 'cPrincipal' && l.key !== 'cDuration'} class:down={l.d < 0 && l.key !== 'cPrincipal' && l.key !== 'cDuration'}>{diff(l)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .scroll { overflow-x: auto; }
  th, td { padding: 10px 12px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--sep); font-size: 15px; }
  th { font-weight: 600; }
  th:first-child, td:first-child { text-align: left; color: var(--text-2); font-weight: 400; padding-left: 0; }
  tr:last-child td { border-bottom: 0; }
  .up { color: var(--bad); font-weight: 600; }
  .down { color: var(--ok); font-weight: 600; }
</style>
