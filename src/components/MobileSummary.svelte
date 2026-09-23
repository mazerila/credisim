<script lang="ts">
  import type { Result } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';

  let { r }: { r: Result } = $props();
</script>

<div class="bar no-print" aria-hidden="true">
  <div><span>{t('kMonthly')}</span><b class="num">{fmt.eur(r.monthlyTotal)}</b></div>
  <div><span>{t('kTaeg')}</span><b class="num" class:bad={!r.usury.ok}>{fmt.pct(r.taeg)}</b></div>
  <div><span>{t('kCost')}</span><b class="num">{fmt.eur(r.creditCost)}</b></div>
</div>

<style>
  .bar { display: none; }
  @media (max-width: 900px) {
    .bar {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 15;
      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;
      padding: 10px 20px calc(10px + env(safe-area-inset-bottom, 0px));
      background: var(--nav); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
      border-top: 1px solid var(--sep);
    }
    div { display: grid; min-width: 0; }
    span { font-size: 11px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    b { font-size: 17px; font-weight: 600; white-space: nowrap; }
    b.bad { color: var(--bad); }
  }
</style>
