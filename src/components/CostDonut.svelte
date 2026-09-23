<script lang="ts">
  import type { Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { r }: { r: Result } = $props();

  const segs = $derived(
    [
      { key: 'dInterest' as const, v: r.totalInterest, c: 'var(--c-interest)' },
      { key: 'dInsurance' as const, v: r.totalInsurance, c: 'var(--c-insurance)' },
      { key: 'dNotary' as const, v: r.notary, c: 'var(--c-notary)' },
      { key: 'dGuarantee' as const, v: r.guarantee, c: 'var(--c-guarantee)' },
      { key: 'dFees' as const, v: r.fees, c: 'var(--c-fees)' },
    ].filter((s) => s.v > 0),
  );
  const total = $derived(segs.reduce((s, x) => s + x.v, 0));
  const R = 70;
  const C = 2 * Math.PI * R;
  const arcs = $derived.by(() => {
    let off = 0;
    return segs.map((s) => {
      const len = total ? (s.v / total) * C : 0;
      const a = { ...s, dash: Math.max(0, len - (segs.length > 1 ? 2 : 0)), off };
      off += len;
      return a;
    });
  });
</script>

<section class="card">
  <h2 class="card-title">{t('donutTitle')}</h2>
  <div class="wrap">
    <svg viewBox="0 0 180 180" role="img" aria-label={t('donutTitle')}>
      <circle cx="90" cy="90" r={R} fill="none" stroke="var(--fill)" stroke-width="20" />
      {#each arcs as a (a.key)}
        <circle cx="90" cy="90" r={R} fill="none" stroke={a.c} stroke-width="20"
          stroke-dasharray="{a.dash} {C}" stroke-dashoffset={-a.off} transform="rotate(-90 90 90)" />
      {/each}
      <text x="90" y="88" text-anchor="middle" class="big">{fmt.compact(total)} €</text>
      <text x="90" y="108" text-anchor="middle" class="cap">{t('donutCenter')}</text>
    </svg>
    <ul>
      {#each segs as s (s.key)}
        <li><i style="background:{s.c}"></i><span>{t(s.key)}</span><b class="num">{fmt.eur(s.v)}</b></li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
  svg { width: 170px; max-width: 100%; height: auto; flex: none; }
  .big { fill: var(--text); font: 600 19px var(--font-display); letter-spacing: -0.02em; }
  .cap { fill: var(--text-2); font: 12px var(--font); }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; flex: 1; min-width: 200px; }
  li { display: flex; align-items: center; gap: 10px; font-size: 15px; }
  i { width: 10px; height: 10px; border-radius: 3px; flex: none; }
  b { margin-left: auto; font-weight: 500; }
</style>
