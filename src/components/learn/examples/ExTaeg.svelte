<script lang="ts">
  import { DEFAULTS, simulate } from '../../../lib/engine';
  import { fmt, t } from '../../../lib/i18n/index.svelte';

  // Same €200,000 loan at 3.2 % over 20 years, adding costs one at a time.
  const base = { ...DEFAULTS.mortgage, type: 'personal' as const, amount: 200000, rate: 3.2, months: 240, useInsurance: false, useFileFee: false };
  const steps = [
    { key: 'exNominal' as const, r: simulate(base) },
    { key: 'exWithIns' as const, r: simulate({ ...base, useInsurance: true, insuranceRate: 0.3, insuranceBase: 'initial' }) },
    { key: 'exWithFees' as const, r: simulate({ ...base, useInsurance: true, insuranceRate: 0.3, insuranceBase: 'initial', useFileFee: true, fileFee: 1000 + 1800 }) },
  ];
  const max = Math.max(...steps.map((s) => s.r.taeg)) * 1.08;
</script>

<div class="ex">
  <p class="setup">200 000 € · 3,2 % · 20 {t('unitYears')}</p>
  {#each steps as s (s.key)}
    <div class="row">
      <span class="lab">{t(s.key)}</span>
      <div class="bar"><div style="width:{(s.r.taeg / max) * 100}%"></div></div>
      <b class="num">{fmt.pct(s.r.taeg)}</b>
    </div>
  {/each}
</div>

<style>
  .setup { margin: 0 0 12px; font-size: 13px; color: var(--text-2); }
  .row { display: grid; grid-template-columns: minmax(0, 190px) minmax(0, 1fr) 60px; gap: 12px; align-items: center; padding: 6px 0; }
  @media (max-width: 520px) { .row { grid-template-columns: minmax(0, 1fr) 60px; } .bar { display: none; } }
  .lab { font-size: 14px; }
  .bar { height: 10px; background: var(--fill); border-radius: 5px; overflow: hidden; }
  .bar div { height: 100%; background: var(--accent); border-radius: 5px; }
  b { text-align: right; font-weight: 600; }
</style>
