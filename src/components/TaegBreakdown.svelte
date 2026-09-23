<script lang="ts">
  import type { Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';
  import Info from './ui/Info.svelte';

  let { r }: { r: Result } = $props();
  const parts = $derived([
    { key: 'taegInterest' as const, v: r.taegParts.interest, c: 'var(--c-interest)' },
    { key: 'taegInsurance' as const, v: r.taegParts.insurance, c: 'var(--c-insurance)' },
    { key: 'taegFees' as const, v: r.taegParts.fees, c: 'var(--c-fees)' },
  ]);
  const scale = $derived(Math.max(r.usury.limit, r.taeg) * 1.1 || 1);
</script>

<section class="card">
  <h2 class="card-title">{t('taegTitle')} <Info text={t('tip_usury')} /></h2>
  <div class="track-wrap">
    <div class="limit" style="left:{(r.usury.limit / scale) * 100}%"><span>{t('taegMax', { u: fmt.pct(r.usury.limit) })}</span></div>
    <div class="track">
      {#each parts as p (p.key)}
        <div style="width:{(p.v / scale) * 100}%;background:{p.c}"></div>
      {/each}
    </div>
  </div>
  <ul class="legend">
    {#each parts.filter((p) => p.v > 0.00005 || p.key === 'taegInterest') as p (p.key)}
      <li><i style="background:{p.c}"></i>{t(p.key)}<b class="num">{fmt.pct(p.v)}</b></li>
    {/each}
    <li class="eq">TAEG<b class="num">{fmt.pct(r.taeg)}</b></li>
  </ul>
  <p class="muted small">{t('taegHint')}</p>
</section>

<style>
  .track-wrap { position: relative; padding-top: 26px; }
  .track { display: flex; height: 14px; border-radius: 7px; overflow: hidden; background: var(--fill); }
  .track div { height: 100%; transition: width 0.3s; }
  .limit { position: absolute; top: 20px; bottom: -6px; border-left: 2px solid var(--bad); }
  .limit span { position: absolute; bottom: calc(100% + 4px); right: -1px; font-size: 12px; font-weight: 600; color: var(--bad); white-space: nowrap; }
  .legend { list-style: none; padding: 0; margin: 16px 0 12px; display: grid; gap: 8px; }
  .legend li { display: flex; align-items: center; gap: 8px; font-size: 15px; }
  .legend i { width: 10px; height: 10px; border-radius: 3px; }
  .legend b { margin-left: auto; font-weight: 500; }
  .legend .eq { border-top: 1px solid var(--sep); padding-top: 8px; font-weight: 600; }
  .legend .eq b { font-weight: 600; }
  p { margin: 0; }
</style>
