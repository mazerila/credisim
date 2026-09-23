<script lang="ts">
  import { CREDIT_TYPES, notaryBreakdown, principalOf, usesProject } from '../lib/engine';
  import { fmt, t } from '../lib/i18n/index.svelte';
  import { addScenarioB, app, current, removeScenarioB, type ScenarioId } from '../lib/state.svelte';
  import NumberField from './ui/NumberField.svelte';
  import Segmented from './ui/Segmented.svelte';
  import SelectField from './ui/SelectField.svelte';
  import SliderField from './ui/SliderField.svelte';
  import Switch from './ui/Switch.svelte';

  const inp = $derived(current());
  const spec = $derived(CREDIT_TYPES[inp.type]);
  const has = (c: (typeof spec.components)[number]) => spec.components.includes(c);
  const expert = $derived(app.mode === 'expert');
  const project = $derived(usesProject(inp));
  const id = (name: string) => `${app.active}-${name}`;
  const notary = $derived(notaryBreakdown(inp.price, inp.propertyKind, inp.transferTaxZone, inp.firstTimeBuyer));
  const notaryPctAuto = $derived(inp.price > 0 ? notary.total / inp.price : 0);
  const guaranteeAuto = $derived(principalOf({ ...inp, useGuarantee: true, guaranteeAuto: true }));

  // Switching an estimate off starts the manual field from the current estimate.
  function toggleNotaryAuto(e: Event) {
    if (!(e.target as HTMLInputElement).checked) inp.notaryPct = Math.round(notaryPctAuto * 10000) / 100;
  }
  function toggleGuaranteeAuto(e: Event) {
    if (!(e.target as HTMLInputElement).checked) inp.guaranteeAmount = Math.round(guaranteeAuto.guarantee);
  }
</script>

<div class="panel card">
  <div class="top">
    <Segmented
      label="Mode"
      options={[{ value: 'quick', label: t('quick') }, { value: 'expert', label: t('expert') }]}
      bind:value={app.mode}
    />
  </div>

  {#if app.b}
    <div class="scen">
      <Segmented
        label="Scenario"
        options={[{ value: 'a' as ScenarioId, label: t('scenario', { n: 'A' }) }, { value: 'b' as ScenarioId, label: t('scenario', { n: 'B' }) }]}
        bind:value={app.active}
      />
      <button type="button" class="link-btn small" onclick={removeScenarioB}>{t('removeScenario')}</button>
    </div>
  {/if}

  <fieldset>
    <legend>{t('secProject')}</legend>
    {#if inp.type === 'mortgage'}
      <Segmented
        label={t('secProject')}
        options={[{ value: 'project', label: t('modeProject') }, { value: 'amount', label: t('modeAmount') }]}
        value={inp.amountOnly ? 'amount' : 'project'}
        onchange={(v) => (inp.amountOnly = v === 'amount')}
      />
      {#if inp.amountOnly}<p class="muted small note">{t('modeAmountHint')}</p>{/if}
    {/if}
    {#if project}
      <NumberField id={id('price')} label={t(inp.type === 'car' ? 'price_car' : 'price_mortgage')} bind:value={inp.price} step={1000} />
      <NumberField id={id('down')} label={t('downPayment')} bind:value={inp.downPayment} step={1000} />
    {:else}
      <NumberField id={id('amount')} label={t('amount')} bind:value={inp.amount} step={500} />
    {/if}
    {#if expert && inp.type === 'mortgage' && project}
      <div class="two">
        <SelectField id={id('kind')} label={t('propertyKind')} bind:value={inp.propertyKind}
          options={[{ value: 'old', label: t('old') }, { value: 'new', label: t('new') }]} />
        <SelectField id={id('zone')} label={t('transferTaxZone')} bind:value={inp.transferTaxZone}
          options={[{ value: 'raised', label: t('zone_raised') }, { value: 'standard', label: t('zone_standard') }, { value: 'indre', label: t('zone_indre') }]} />
      </div>
    {/if}
  </fieldset>

  <fieldset>
    <legend>{t('secLoan')}</legend>
    <SliderField id={id('rate')} label={t('rate')} tip={t('tip_rate')} learn="monthly-payment" bind:value={inp.rate}
      min={spec.rate.min} max={spec.rate.max} step={spec.rate.step} unit="%" decimals={2} />
    <SliderField id={id('months')} label={t('duration')} bind:value={inp.months}
      min={spec.months.min} max={spec.months.max} step={spec.months.step} integer
      unit={t(spec.durationUnit === 'years' ? 'unitYears' : 'unitMonths')}
      factor={spec.durationUnit === 'years' ? 12 : 1} decimals={spec.durationUnit === 'years' ? 1 : 0} />
  </fieldset>

  <fieldset>
    <legend>{t('secHousehold')}</legend>
    <NumberField id={id('income')} label={t('income')} tip={t('tip_debt')} learn="debt-ratio" bind:value={inp.income} step={100} />
  </fieldset>

  {#if expert}
    <fieldset>
      <legend>{t('secOptions')}</legend>
      <div class="switches">
        {#if has('insurance')}
          <Switch id={id('use-ins')} label={t('opt_insurance')} tip={t('tip_insurance')} learn="insurance" bind:checked={inp.useInsurance}>
            <div class="two">
              <NumberField id={id('ins-rate')} label={t('insuranceRate')} unit="%" step={0.01} max={3} bind:value={inp.insuranceRate} />
              <NumberField id={id('ins-cover')} label={t('insuranceCover')} tip={t('tip_insuranceCover')} learn="insurance" unit="%" step={10} max={200} bind:value={inp.insuranceCover} />
            </div>
            <SelectField id={id('ins-base')} label={t('insuranceBase')} tip={t('tip_insuranceBase')} learn="insurance" bind:value={inp.insuranceBase}
              options={[{ value: 'initial', label: t('base_initial') }, { value: 'remaining', label: t('base_remaining') }]} />
          </Switch>
        {/if}
        {#if has('guarantee')}
          <Switch id={id('use-guar')} label={t('opt_guarantee')} tip={t('tip_guarantee')} learn="guarantee" bind:checked={inp.useGuarantee}>
            <SelectField id={id('guar')} label={t('guarantee')} bind:value={inp.guarantee}
              options={[{ value: 'caution', label: t('g_caution') }, { value: 'hypo', label: t('g_hypo') }, { value: 'ppd', label: t('g_ppd') }]} />
            <label class="check"><input type="checkbox" bind:checked={inp.guaranteeAuto} onchange={toggleGuaranteeAuto} />
              <span>{t('notaryAuto')}{#if inp.guaranteeAuto}&nbsp;· <span class="num">{fmt.eur(guaranteeAuto.guarantee)}</span>
                <span class="muted num">({t('ofLoan', { p: fmt.pct(guaranteeAuto.principal ? guaranteeAuto.guarantee / guaranteeAuto.principal : 0) })})</span>{/if}</span></label>
            {#if !inp.guaranteeAuto}
              <NumberField id={id('guar-amount')} label={t('guaranteeAmount')} step={100} bind:value={inp.guaranteeAmount} />
            {/if}
          </Switch>
        {/if}
        {#if has('notary') && project}
          <Switch id={id('use-notary')} label={t('opt_notary')} tip={t('tip_notary')} learn="notary" bind:checked={inp.useNotary}>
            <label class="check"><input type="checkbox" bind:checked={inp.firstTimeBuyer} /> {t('firstTimeBuyer')}</label>
            <label class="check"><input type="checkbox" bind:checked={inp.notaryAuto} onchange={toggleNotaryAuto} />
              <span>{t('notaryAuto')}{#if inp.notaryAuto}&nbsp;· <span class="num">{fmt.eur(notary.total)}</span>
                <span class="muted num">({t('ofPrice', { p: fmt.pct(notaryPctAuto) })})</span>{/if}</span></label>
            {#if inp.notaryAuto}
              <p class="muted small detail num">{t('notaryDetail', { tax: fmt.eur(notary.taxes), emol: fmt.eur(notary.emoluments), other: fmt.eur(notary.other) })}</p>
            {/if}
            {#if !inp.notaryAuto}
              <NumberField id={id('notary-pct')} label={t('notaryPct')} unit="%" step={0.1} max={15} bind:value={inp.notaryPct} />
            {/if}
          </Switch>
        {/if}
        {#if has('works') && project}
          <Switch id={id('use-works')} label={t('opt_works')} bind:checked={inp.useWorks}>
            <NumberField id={id('works')} label={t('works')} step={1000} bind:value={inp.works} />
          </Switch>
        {/if}
        {#if has('fileFee')}
          <Switch id={id('use-file')} label={t('opt_fileFee')} tip={t('tip_fileFee')} learn="taeg" bind:checked={inp.useFileFee}>
            <NumberField id={id('file')} label={t('fileFee')} step={50} bind:value={inp.fileFee} />
          </Switch>
        {/if}
        {#if has('brokerFee')}
          <Switch id={id('use-broker')} label={t('opt_brokerFee')} tip={t('tip_brokerFee')} learn="taeg" bind:checked={inp.useBrokerFee}>
            <NumberField id={id('broker')} label={t('brokerFee')} step={100} bind:value={inp.brokerFee} />
          </Switch>
        {/if}
        {#if has('otherLoans')}
          <Switch id={id('use-other')} label={t('opt_otherLoans')} tip={t('tip_otherLoans')} learn="debt-ratio" bind:checked={inp.useOtherLoans}>
            <NumberField id={id('other')} label={t('otherLoans')} step={50} bind:value={inp.otherLoans} />
          </Switch>
        {/if}
      </div>
    </fieldset>
  {/if}

  {#if !expert}
    <p class="muted small hint">{t('quickHint')}</p>
  {/if}

  {#if !app.b}
    <button type="button" class="add" onclick={addScenarioB}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      {t('addScenario')}
    </button>
  {/if}
</div>

<style>
  .panel { display: grid; gap: 22px; }
  .top { display: flex; }
  .top :global(.seg) { width: 100%; }
  .scen { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: 14px; min-width: 0; }
  legend { font-family: var(--font-display); font-size: 19px; font-weight: 600; letter-spacing: -0.02em; padding: 0; margin-bottom: 12px; }
  .two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
  @media (max-width: 380px) { .two { grid-template-columns: minmax(0, 1fr); } }
  .switches { display: grid; }
  .hint { margin: -8px 0 0; }
  .note { margin: -4px 0 0; }
  .check { display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer; }
  .check input { width: 18px; height: 18px; accent-color: var(--accent); margin: 0; flex: none; }
  .detail { margin: -4px 0 0 26px; line-height: 1.4; }
  .add {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: 1.5px dashed var(--sep); background: none; color: var(--accent); border-radius: var(--radius-sm);
    padding: 12px; font-size: 15px; font-weight: 500;
  }
  .add:hover { border-color: var(--accent); background: var(--accent-soft); }
</style>
