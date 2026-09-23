<script lang="ts">
  import { balanceAfter, insuranceSwitch, simulate, type InsuranceBase } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import { current } from '../../lib/state.svelte';
  import NumberField from '../ui/NumberField.svelte';
  import SelectField from '../ui/SelectField.svelte';

  const start = current();
  const sim = simulate(start);
  const paid = Math.min(36, Math.round(start.months / 4));
  let initial = $state(Math.round(sim.principal));
  let balance = $state(Math.round(balanceAfter(sim.principal, start.rate / 100, start.months, paid)));
  let remaining = $state(start.months - paid);
  let loanRate = $state(start.rate);
  let cover = $state(start.insuranceCover);
  let curRate = $state(start.insuranceRate || 0.34);
  let curBase = $state<InsuranceBase>('initial');
  let newRate = $state(0.12);
  let newBase = $state<InsuranceBase>('remaining');

  const r = $derived(insuranceSwitch({
    initialPrincipal: initial, balance, remainingMonths: remaining, loanRate: loanRate / 100, cover: cover / 100,
    current: { rate: curRate / 100, base: curBase }, next: { rate: newRate / 100, base: newBase },
  }));
  const bases = $derived([{ value: 'initial' as InsuranceBase, label: t('base_initial') }, { value: 'remaining' as InsuranceBase, label: t('base_remaining') }]);
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('yourLoan')}</h3>
    <NumberField id="is-initial" label={t('initialAmount')} step={1000} bind:value={initial} />
    <div class="two">
      <NumberField id="is-balance" label={t('balance')} step={1000} bind:value={balance} />
      <NumberField id="is-rem" label={t('remainingMonths')} unit={t('unitMonths')} step={12} min={12} bind:value={remaining} />
    </div>
    <div class="two">
      <NumberField id="is-rate" label={t('loanRate')} unit="%" step={0.05} bind:value={loanRate} />
      <NumberField id="is-cover" label={t('insuranceCover')} unit="%" step={10} max={200} bind:value={cover} />
    </div>
    <h3>{t('currentIns')}</h3>
    <NumberField id="is-cur-rate" label={t('insuranceRate')} unit="%" step={0.01} bind:value={curRate} />
    <SelectField id="is-cur-base" label={t('insuranceBase')} bind:value={curBase} options={bases} />
    <h3>{t('newIns')}</h3>
    <NumberField id="is-new-rate" label={t('insuranceRate')} unit="%" step={0.01} bind:value={newRate} />
    <SelectField id="is-new-base" label={t('insuranceBase')} bind:value={newBase} options={bases} />
  </div>

  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('rSaving')}</span><span class="fig-value">{fmt.eur(r.saving)}</span><span class="fig-sub">{t('rUntilEnd')}</span></div>
      <div class="fig"><span class="fig-label">{t('rInsCurrent')}</span><span class="fig-value">{fmt.eur(r.current.total)}</span><span class="fig-sub">{t('rFirstMonth', { v: fmt.eur(r.current.first, 2) })}</span></div>
      <div class="fig"><span class="fig-label">{t('rInsNew')}</span><span class="fig-value" class:good={r.saving > 0}>{fmt.eur(r.next.total)}</span><span class="fig-sub">{t('rFirstMonth', { v: fmt.eur(r.next.first, 2) })}</span></div>
    </div>
    <p class="hint-box">{t('lemoineHint')}</p>
  </div>
</div>
