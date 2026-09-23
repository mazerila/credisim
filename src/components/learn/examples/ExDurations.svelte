<script lang="ts">
  import { monthlyPayment } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';

  const rows = [10, 15, 20, 25].map((y) => {
    const pay = Math.round(monthlyPayment(200000, 0.032, y * 12) * 100) / 100;
    return { y, pay, interest: pay * y * 12 - 200000 };
  });
</script>

<div class="ex scroll">
  <table>
    <thead><tr><th>{t('exYears')}</th><th>{t('exPayment')}</th><th>{t('exInterest')}</th></tr></thead>
    <tbody>
      {#each rows as r (r.y)}<tr><td>{t('years', { n: r.y })}</td><td>{fmt.eur(r.pay)}</td><td>{fmt.eur(r.interest)}</td></tr>{/each}
    </tbody>
  </table>
</div>

<style>
  .scroll { overflow-x: auto; }
  th, td { padding: 9px 10px; text-align: right; border-bottom: 1px solid var(--sep); white-space: nowrap; }
  th { font-size: 13px; color: var(--text-2); font-weight: 600; }
  th:first-child, td:first-child { text-align: left; padding-left: 0; }
  tr:last-child td { border-bottom: 0; }
</style>
