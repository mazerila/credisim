<script lang="ts">
  import { schedule, type Amortization } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';

  // €200,000 at 3.2 % over 20 years
  const types: Amortization[] = ['annuity', 'linear', 'inFine'];
  const rows = types.map((a) => {
    const s = schedule(200000, 0.032, 240, undefined, { amortization: a });
    return { a, first: s[0].payment, last: a === 'inFine' ? s[238].payment : s[239].payment, interest: s.reduce((x, r) => x + r.interest, 0) };
  });
</script>

<div class="ex scroll">
  <p class="setup">200 000 € · 3,2 % · 20 {t('unitYears')}</p>
  <table>
    <thead><tr><th></th><th>{t('exMonth1')}</th><th>{t('exMonthLast')}</th><th>{t('exInterest')}</th></tr></thead>
    <tbody>
      {#each rows as r (r.a)}
        <tr><td>{t(`am_${r.a}`)}</td><td>{fmt.eur(r.first)}</td><td>{fmt.eur(r.last)}{#if r.a === 'inFine'}<sup>*</sup>{/if}</td><td>{fmt.eur(r.interest)}</td></tr>
      {/each}
    </tbody>
  </table>
  <p class="note">* + 200 000 €</p>
</div>

<style>
  .scroll { overflow-x: auto; }
  .setup { margin: 0 0 10px; font-size: 13px; color: var(--text-2); }
  th, td { padding: 9px 10px; text-align: right; border-bottom: 1px solid var(--sep); white-space: nowrap; font-size: 15px; }
  th { font-size: 13px; color: var(--text-2); font-weight: 600; }
  th:first-child, td:first-child { text-align: left; padding-left: 0; white-space: normal; }
  tr:last-child td { border-bottom: 0; }
  .note { margin: 8px 0 0; font-size: 12px; color: var(--text-3); }
</style>
