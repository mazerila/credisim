<script lang="ts">
  import { schedule } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';

  const mk = (base: 'initial' | 'remaining') => {
    const rows = schedule(200000, 0.032, 240, { rate: 0.003, base, cover: 1 });
    return { first: rows[0].insurance, total: rows.reduce((s, r) => s + r.insurance, 0) };
  };
  const initial = mk('initial');
  const remaining = mk('remaining');
</script>

<div class="ex">
  <p class="setup">{t('exInsSetup')}</p>
  <div class="cols">
    <div><span>{t('exInsInitial')}</span><b class="num">{fmt.eur(initial.total)}</b><small>{t('exTotalIns')} · {t('exPerMonthStart', { v: fmt.eur(initial.first, 2) })}</small></div>
    <div><span>{t('exInsRemaining')}</span><b class="num good">{fmt.eur(remaining.total)}</b><small>{t('exTotalIns')} · {t('exPerMonthStart', { v: fmt.eur(remaining.first, 2) })}</small></div>
  </div>
</div>

<style>
  .setup { margin: 0 0 14px; font-size: 13px; color: var(--text-2); }
  .cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 520px) { .cols { grid-template-columns: minmax(0, 1fr); } }
  .cols div { display: grid; gap: 2px; }
  span { font-size: 14px; color: var(--text-2); }
  b { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
  .good { color: var(--ok); }
  small { font-size: 13px; color: var(--text-3); }
</style>
