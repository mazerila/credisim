<script lang="ts">
  import { byYear, schedule } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';

  // €200,000 over 20 years at 3.2 %
  const rows = schedule(200000, 0.032, 240);
  const years = byYear(rows);
  const picks = [1, 5, 10, 15, 20].map((n) => years[n - 1]);
  const first = rows[0], last = rows[rows.length - 1];
</script>

<div class="ex">
  <p class="setup">200 000 € · 3,2 % · 20 {t('unitYears')}</p>
  <div class="bars">
    {#each picks as y (y.year)}
      {@const share = y.interest / (y.interest + y.capital)}
      <div class="row">
        <span class="lab">{t('exYear', { n: y.year })}</span>
        <div class="bar" role="img" aria-label="{t('lInterest')} {fmt.pct(share, 0)}">
          <div class="i" style="width:{share * 100}%"></div><div class="c" style="width:{(1 - share) * 100}%"></div>
        </div>
        <span class="pct num">{fmt.pct(share, 0)}</span>
      </div>
    {/each}
  </div>
  <div class="legend">
    <span><i class="i"></i>{t('lInterest')}</span><span><i class="c"></i>{t('lCapital')}</span>
    <span class="muted">% = {t('lInterest').toLowerCase()} {t('exOfPayment')}</span>
  </div>
  <div class="months">
    <div><span>{t('exMonth1')}</span><b class="num">{fmt.eur(first.interest, 2)}</b> {t('lInterest').toLowerCase()} · <b class="num">{fmt.eur(first.capital, 2)}</b> {t('lCapital').toLowerCase()}</div>
    <div><span>{t('exMonthLast')}</span><b class="num">{fmt.eur(last.interest, 2)}</b> {t('lInterest').toLowerCase()} · <b class="num">{fmt.eur(last.capital, 2)}</b> {t('lCapital').toLowerCase()}</div>
  </div>
</div>

<style>
  .setup { margin: 0 0 12px; font-size: 13px; color: var(--text-2); }
  .bars { display: grid; gap: 10px; }
  .row { display: grid; grid-template-columns: 70px minmax(0, 1fr) 44px; gap: 10px; align-items: center; }
  .lab { font-size: 14px; color: var(--text-2); }
  .bar { display: flex; height: 16px; border-radius: 8px; overflow: hidden; }
  .i { background: var(--c-interest); } .c { background: var(--c-capital); }
  .pct { font-size: 14px; text-align: right; font-weight: 500; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 13px; margin-top: 12px; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  .months { display: grid; gap: 6px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--sep); font-size: 15px; }
  .months span { display: inline-block; min-width: 110px; color: var(--text-2); font-size: 13px; }
  b { font-weight: 600; }
</style>
