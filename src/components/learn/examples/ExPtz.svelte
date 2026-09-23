<script lang="ts">
  import { t } from '../../../lib/i18n/index.svelte';

  // PTZ 2025–2027: deferral and total duration by income band (source: calculer-ptz.fr, Pretto).
  const rows = [
    { band: 'T1', deferral: 10, total: 25 },
    { band: 'T2', deferral: 8, total: 20 },
    { band: 'T3', deferral: 2, total: 15 },
    { band: 'T4', deferral: 0, total: 10 },
  ];
</script>

<div class="ex scroll">
  <table>
    <thead><tr><th>{t('exTranche')}</th><th>{t('exDeferral')}</th><th>{t('exTotalDur')}</th></tr></thead>
    <tbody>
      {#each rows as r (r.band)}
        <tr><td>{r.band}</td><td>{r.deferral ? t('years', { n: r.deferral }) : t('exNone')}</td><td>{t('years', { n: r.total })}</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .scroll { overflow-x: auto; }
  th, td { padding: 8px 12px; border-bottom: 1px solid var(--sep); font-size: 15px; text-align: right; white-space: nowrap; }
  th { font-size: 13px; color: var(--text-2); font-weight: 600; }
  th:first-child, td:first-child { text-align: left; padding-left: 0; font-weight: 600; }
  tr:last-child td { border-bottom: 0; }
</style>
