<script lang="ts">
  import { CREDIT_TYPES, simulate, type Inputs } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { inp }: { inp: Inputs } = $props();
  const spec = $derived(CREDIT_TYPES[inp.type]);

  const round = (v: number) => Math.round(v * 100) / 100;
  const rates = $derived([-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((d) => round(inp.rate + d)).filter((x) => x >= 0));
  const durations = $derived.by(() => {
    const base = inp.type === 'mortgage' ? [180, 240, 300] : inp.type === 'works' ? [60, 96, 120, 180] : [24, 36, 48, 60, 72, 84];
    return [...new Set([...base, inp.months])].filter((m) => m >= spec.months.min && m <= spec.months.max).sort((a, b) => a - b);
  });
  const grid = $derived(
    rates.map((rate) => ({
      rate,
      cells: durations.map((months) => {
        const r = simulate({ ...inp, rate, months });
        const ok = r.usury.ok && (!r.debtRatio || r.debtRatio.ok);
        return { months, value: r.monthlyMax, ok };
      }),
    })),
  );
</script>

<section class="card">
  <h2 class="card-title">{t('sensTitle')}</h2>
  <div class="scroll">
    <table>
      <thead>
        <tr><th>{t('sensRate')}</th>{#each durations as m (m)}<th class:cur-col={m === inp.months}>{fmt.duration(m, spec.durationUnit)}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each grid as row (row.rate)}
          <tr>
            <th class:cur-row={row.rate === round(inp.rate)}>{fmt.pct(row.rate / 100)}</th>
            {#each row.cells as c (c.months)}
              <td class:ok={c.ok} class:bad={!c.ok} class:here={row.rate === round(inp.rate) && c.months === inp.months}>{fmt.eur(c.value)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="muted small">{t('sensHint')}</p>
</section>

<style>
  .scroll { overflow-x: auto; }
  table { border-collapse: separate; border-spacing: 4px; margin: -4px; width: calc(100% + 8px); }
  th { font-size: 13px; font-weight: 600; color: var(--text-2); padding: 6px 8px; white-space: nowrap; text-align: right; }
  thead th:first-child, tbody th { text-align: left; }
  .cur-col, .cur-row { color: var(--accent); }
  td { text-align: right; padding: 9px 10px; border-radius: 8px; font-size: 14px; font-weight: 500; white-space: nowrap; }
  td.ok { background: var(--ok-soft); }
  td.bad { background: var(--bad-soft); color: var(--bad); }
  td.here { outline: 2px solid var(--accent); outline-offset: -2px; font-weight: 700; }
  p { margin: 12px 0 0; }
</style>
