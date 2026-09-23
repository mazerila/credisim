<script lang="ts">
  import { usuryTable } from '../../../lib/engine';
  import { fmt, i18n, t, type Key } from '../../../lib/i18n/index.svelte';

  const { table } = usuryTable();
  const rows = [
    ...Object.entries(table.mortgage).map(([k, v]) => ({ k, v })),
    ...Object.entries(table.consumer).map(([k, v]) => ({ k, v })),
  ];
  const date = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString(i18n.lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<div class="ex scroll">
  <table>
    <thead><tr><th>{t('exCategory')}</th><th>{t('exUsury')}</th></tr></thead>
    <tbody>
      {#each rows as r (r.k)}<tr><td>{t(`u_${r.k}` as Key)}</td><td>{fmt.pct(r.v)}</td></tr>{/each}
    </tbody>
  </table>
  <p class="src">{t('exValid', { from: date(table.validFrom), to: date(table.validTo) })}</p>
</div>

<style>
  .scroll { overflow-x: auto; }
  th, td { padding: 8px 0; border-bottom: 1px solid var(--sep); font-size: 15px; }
  th { font-size: 13px; color: var(--text-2); font-weight: 600; text-align: left; }
  th:last-child, td:last-child { text-align: right; white-space: nowrap; padding-left: 12px; }
  .src { margin: 10px 0 0; font-size: 13px; color: var(--text-3); }
</style>
