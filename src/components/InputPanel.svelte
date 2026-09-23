<script lang="ts">
  import { COUNTRIES, COUNTRY_CODES, CREDIT_TYPES, notaryBreakdown, principalOf, purchaseCosts, regionsOf, usesProject, type Amortization, type Country, type DeferralType, type RateScenario, type RateType } from '../lib/engine';
  import { i18n, type Key } from '../lib/i18n/index.svelte';
  import { fmt, t } from '../lib/i18n/index.svelte';
  import { addScenario, app, current, removeScenario, setCountry } from '../lib/state.svelte';
  import { MAX_SCENARIOS, SCENARIO_NAMES } from '../lib/share';
  import { track } from '../lib/analytics';
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
  const fr = $derived(inp.country === 'FR');
  const notary = $derived(notaryBreakdown(inp.price, inp.propertyKind, inp.transferTaxZone, inp.firstTimeBuyer));
  const costs = $derived(purchaseCosts(inp));
  const notaryPctAuto = $derived(inp.price > 0 ? (fr ? notary.total : costs.total) / inp.price : 0);
  const regions = $derived(regionsOf(inp.country).filter((r) => r !== 'all'));
  const countryName = (c: string) => { try { return new Intl.DisplayNames([i18n.lang], { type: 'region' }).of(c) ?? c; } catch { return c; } };
  const regionLabel = (c: Country, r: string) => (c === 'DE' ? GERMAN_LANDS[r] ?? r : t(`region_${r}` as Key));
  const GERMAN_LANDS: Record<string, string> = { BW: 'Baden-Württemberg', BY: 'Bayern', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg', HE: 'Hessen', MV: 'Mecklenburg-Vorpommern', NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen', RP: 'Rheinland-Pfalz', SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thüringen' };
  const guaranteeAuto = $derived(principalOf({ ...inp, useGuarantee: true, guaranteeAuto: true }));
  const funding = $derived(principalOf(inp));
  const ptzEst = $derived(funding.ptzEstimate);
  const homeLoan = $derived(inp.type === 'mortgage');
  const years = (m: number) => fmt.duration(m, 'years');

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
      onchange={(v) => track('mode_changed', { mode: v })}
    />
  </div>

  {#if app.scenarios.length > 1}
    <div class="scen">
      <Segmented
        label="Scenario"
        options={app.scenarios.map((_, i) => ({ value: String(i), label: t('scenario', { n: SCENARIO_NAMES[i] }) }))}
        value={String(app.active)}
        onchange={(v) => (app.active = Number(v))}
      />
      <div class="scen-actions">
        {#if app.scenarios.length < MAX_SCENARIOS}
          <button type="button" class="link-btn small" onclick={addScenario}>+ {t('addScenarioShort')}</button>
        {/if}
        <button type="button" class="link-btn small" onclick={() => removeScenario()}>{t('removeScenarioN', { n: SCENARIO_NAMES[app.active] })}</button>
      </div>
    </div>
  {/if}

  <fieldset>
    <legend>{t('secProject')}</legend>
    <SelectField id={id('country')} label={t('country')} value={inp.country} onchange={(v) => setCountry(v as Country)}
      options={COUNTRY_CODES.map((c) => ({ value: c, label: `${COUNTRIES[c].flag}  ${countryName(c)}` }))} />
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
        {#if fr}
          <SelectField id={id('zone')} label={t('transferTaxZone')} bind:value={inp.transferTaxZone}
            options={[{ value: 'raised', label: t('zone_raised') }, { value: 'standard', label: t('zone_standard') }, { value: 'indre', label: t('zone_indre') }]} />
        {:else if regions.length}
          <SelectField id={id('region')} label={t('region')} bind:value={inp.region}
            options={regions.map((r) => ({ value: r, label: regionLabel(inp.country, r) }))} />
        {/if}
      </div>
      {#if inp.country === 'BE' || inp.country === 'IT' || inp.country === 'NL'}
        <label class="check"><input type="checkbox" bind:checked={inp.mainHome} /> {t(inp.country === 'IT' ? 'mainHomeIT' : 'mainHome')}</label>
      {/if}
      {#if inp.country === 'NL' && inp.mainHome}
        <label class="check"><input type="checkbox" bind:checked={inp.firstTimeBuyer} /> {t('starterNL')}</label>
      {/if}
    {/if}
  </fieldset>

  <fieldset>
    <legend>{t('secLoan')}</legend>
    {#if homeLoan && (expert || inp.rateType !== 'fixed')}
      <div class="rate-type">
        <span class="lbl">{t('rateType')}</span>
        <Segmented size="sm" label={t('rateType')} options={(['fixed', 'variable', 'capped'] as RateType[]).map((v) => ({ value: v, label: t(`rt_${v}`) }))} bind:value={inp.rateType} />
      </div>
    {/if}
    {#if homeLoan && inp.rateType !== 'fixed'}
      <div class="two">
        <NumberField id={id('index')} label={t('indexRate')} unit="%" step={0.05} max={15} bind:value={inp.indexRate} />
        <NumberField id={id('margin')} label={t('margin')} unit="%" step={0.05} max={10} bind:value={inp.margin} />
      </div>
      <div class="two">
        {#if inp.rateType === 'capped'}
          <NumberField id={id('cap')} label={t('cap')} unit="pt" step={0.5} min={0.5} max={5} bind:value={inp.cap} />
        {/if}
        <SelectField id={id('scenario')} label={t('rateScenario')} tip={t('tip_scenario')} learn="variable-rates" bind:value={inp.scenario}
          options={(['down1', 'stable', 'up1', 'up2', 'up3'] as RateScenario[]).map((v) => ({ value: v, label: t(`sc_${v}`) }))} />
      </div>
    {:else}
      <SliderField id={id('rate')} label={t('rate')} tip={t('tip_rate')} learn="monthly-payment" bind:value={inp.rate}
        min={spec.rate.min} max={spec.rate.max} step={spec.rate.step} unit="%" decimals={2} />
    {/if}
    <SliderField id={id('months')} label={t('duration')} bind:value={inp.months}
      min={spec.months.min} max={spec.months.max} step={spec.months.step} integer
      unit={t(spec.durationUnit === 'years' ? 'unitYears' : 'unitMonths')}
      factor={spec.durationUnit === 'years' ? 12 : 1} decimals={spec.durationUnit === 'years' ? 1 : 0} />
    {#if expert && homeLoan}
      <SelectField id={id('amort')} label={t('amortization')} tip={t('tip_amortization')} learn="amortization" bind:value={inp.amortization}
        options={(['annuity', 'linear', 'inFine'] as Amortization[]).map((v) => ({ value: v, label: t(`am_${v}`) }))} />
      <div class="two">
        <SelectField id={id('deferral')} label={t('deferral')} tip={t('tip_deferral')} learn="loan-types" bind:value={inp.deferralType}
          options={(['none', 'partial', 'total'] as DeferralType[]).map((v) => ({ value: v, label: t(`df_${v}`) }))} />
        {#if inp.deferralType !== 'none'}
          <NumberField id={id('deferral-m')} label={t('deferralMonths')} unit={t('unitMonths')} step={1} min={1} max={Math.max(1, inp.months - 12)} bind:value={inp.deferralMonths} />
        {/if}
      </div>
    {/if}
  </fieldset>

  <fieldset>
    <legend>{t('secHousehold')}</legend>
    <NumberField id={id('income')} label={t('income')} tip={t('tip_debt')} learn="debt-ratio" bind:value={inp.income} step={100} />
    {#if expert}
      <NumberField id={id('persons')} label={t('persons')} unit="" step={1} min={1} max={12} bind:value={inp.persons} />
    {/if}
  </fieldset>

  {#if expert}
    <fieldset>
      <legend>{t('secOptions')}</legend>
      <div class="switches">
        {#if has('insurance')}
          <Switch id={id('use-ins')} label={t('opt_insurance')} tip={t('tip_insurance')} learn="insurance" bind:checked={inp.useInsurance}>
            <Segmented size="sm" label={t('borrowers')} options={[{ value: '1', label: '1 ' + t('borrowers').toLowerCase() }, { value: '2', label: '2 ' + t('borrowers').toLowerCase() }]}
              value={String(inp.borrowers)} onchange={(v) => (inp.borrowers = Number(v))} />
            {#if inp.borrowers >= 2}<p class="sub-label">{t('borrowerN', { n: 1 })}</p>{/if}
            <div class="two">
              <NumberField id={id('ins-rate')} label={t('insuranceRate')} unit="%" step={0.01} max={3} bind:value={inp.insuranceRate} />
              <NumberField id={id('ins-cover')} label={t('insuranceCover')} tip={t('tip_insuranceCover')} learn="insurance" unit="%" step={10} max={100} bind:value={inp.insuranceCover} />
            </div>
            {#if inp.borrowers >= 2}
              <p class="sub-label">{t('borrowerN', { n: 2 })}</p>
              <div class="two">
                <NumberField id={id('ins-rate2')} label={t('insuranceRate')} unit="%" step={0.01} max={3} bind:value={inp.insuranceRate2} />
                <NumberField id={id('ins-cover2')} label={t('insuranceCover')} unit="%" step={10} max={100} bind:value={inp.insuranceCover2} />
              </div>
            {/if}
            <SelectField id={id('ins-base')} label={t('insuranceBase')} tip={t('tip_insuranceBase')} learn="insurance" bind:value={inp.insuranceBase}
              options={[{ value: 'initial', label: t('base_initial') }, { value: 'remaining', label: t('base_remaining') }]} />
          </Switch>
        {/if}
        {#if has('guarantee')}
          <Switch id={id('use-guar')} label={t('opt_guarantee')} tip={t('tip_guarantee')} learn="guarantee" bind:checked={inp.useGuarantee}>
            <SelectField id={id('guar')} label={t('guarantee')} bind:value={inp.guarantee}
              options={COUNTRIES[inp.country].guarantees.map((g) => ({ value: g, label: t(`g_${g}` as Key) }))} />
            {#if inp.guarantee === 'nhg' && inp.guaranteeAuto && guaranteeAuto.guarantee === 0}<p class="muted small">{t('nhgOver')}</p>{/if}
            <label class="check"><input type="checkbox" bind:checked={inp.guaranteeAuto} onchange={toggleGuaranteeAuto} />
              <span>{t('notaryAuto')}{#if inp.guaranteeAuto}&nbsp;· <span class="num">{fmt.eur(guaranteeAuto.guarantee)}</span>
                <span class="muted num">({t('ofLoan', { p: fmt.pct(guaranteeAuto.principal ? guaranteeAuto.guarantee / guaranteeAuto.principal : 0) })})</span>{/if}</span></label>
            {#if !inp.guaranteeAuto}
              <NumberField id={id('guar-amount')} label={t('guaranteeAmount')} step={100} bind:value={inp.guaranteeAmount} />
            {/if}
          </Switch>
        {/if}
        {#if has('ptz') && project && fr}
          <Switch id={id('use-ptz')} label={t('opt_ptz')} tip={t('tip_ptz')} learn="ptz" bind:checked={inp.usePtz}>
            <div class="two">
              <SelectField id={id('ptz-zone')} label={t('ptzZone')} tip={t('tip_zone')} bind:value={inp.ptzZone}
                options={[{ value: 'A', label: 'A bis / A' }, { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'C', label: 'C' }]} />
              <SelectField id={id('ptz-kind')} label={t('ptzKind')} bind:value={inp.ptzKind}
                options={[{ value: 'newFlat', label: t('pk_newFlat') }, { value: 'newHouse', label: t('pk_newHouse') }, { value: 'oldWithWorks', label: t('pk_oldWithWorks') }]} />
            </div>
            <div class="two">
              <NumberField id={id('ptz-persons')} label={t('persons')} unit="" step={1} min={1} max={12} bind:value={inp.persons} />
              <NumberField id={id('ptz-income')} label={t('taxIncome')} tip={t('tip_taxIncome')} step={1000} bind:value={inp.taxIncome} />
            </div>
            {#if ptzEst}
              <div class="ptz-status" class:bad={!ptzEst.eligible}>
                {#if ptzEst.eligible}
                  <b>{t('ptzEligible', { b: ptzEst.band + 1, amount: fmt.eur(ptzEst.amount), share: fmt.pct(ptzEst.share, 0), cost: fmt.eur(ptzEst.costRetained) })}</b>
                  <span>{ptzEst.deferralMonths
                    ? t('ptzTerms', { d: years(ptzEst.deferralMonths), r: years(ptzEst.totalMonths - ptzEst.deferralMonths), t: years(ptzEst.totalMonths) })
                    : t('ptzTermsNoDeferral', { t: years(ptzEst.totalMonths) })}</span>
                {:else}
                  <b>{t(ptzEst.issue === 'zone' ? 'ptzZoneIssue' : ptzEst.issue === 'noCost' ? 'ptzNoCost' : 'ptzOverIncome')}</b>
                {/if}
              </div>
            {/if}
            <label class="check"><input type="checkbox" bind:checked={inp.ptzAuto} onchange={(e) => { if (!(e.target as HTMLInputElement).checked) inp.ptzAmount = funding.ptz || ptzEst?.amount || inp.ptzAmount; }} />
              <span>{t('notaryAuto')}</span></label>
            {#if !inp.ptzAuto}
              <NumberField id={id('ptz-amount')} label={t('ptzAmount')} step={1000} bind:value={inp.ptzAmount} />
            {/if}
            {#if funding.ptz > 0 && funding.ptz < (inp.ptzAuto ? (ptzEst?.amount ?? 0) : inp.ptzAmount)}
              <p class="muted small">{t('ptzCapped')}</p>
            {/if}
            <label class="check"><input type="checkbox" bind:checked={inp.smoothing} /> <span>{t('smoothing')}</span></label>
            {#if inp.smoothing && (inp.amortization !== 'annuity' || inp.deferralType !== 'none')}
              <p class="muted small">{t('smoothingOff')}</p>
            {/if}
          </Switch>
        {/if}
        {#if has('notary') && project}
          <Switch id={id('use-notary')} label={t(fr ? 'opt_notary' : 'purchaseCosts')} tip={fr ? t('tip_notary') : undefined} learn={fr ? 'notary' : undefined} bind:checked={inp.useNotary}>
            {#if fr}<label class="check"><input type="checkbox" bind:checked={inp.firstTimeBuyer} /> {t('firstTimeBuyer')}</label>{/if}
            <label class="check"><input type="checkbox" bind:checked={inp.notaryAuto} onchange={toggleNotaryAuto} />
              <span>{t('notaryAuto')}{#if inp.notaryAuto}&nbsp;· <span class="num">{fmt.eur(fr ? notary.total : costs.total)}</span>
                <span class="muted num">({t('ofPrice', { p: fmt.pct(notaryPctAuto) })})</span>{/if}</span></label>
            {#if inp.notaryAuto && fr}
              <p class="muted small detail num">{t('notaryDetail', { tax: fmt.eur(notary.taxes), emol: fmt.eur(notary.emoluments), other: fmt.eur(notary.other) })}</p>
            {:else if inp.notaryAuto}
              <p class="muted small detail num">{t('purchaseDetail', { tax: fmt.eur(costs.taxes), notary: fmt.eur(costs.notary) })}</p>
            {/if}
            {#if !inp.notaryAuto}
              <NumberField id={id('notary-pct')} label={t(fr ? 'notaryPct' : 'purchaseCosts')} unit="%" step={0.1} max={15} bind:value={inp.notaryPct} />
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

  {#if app.scenarios.length === 1}
    <button type="button" class="add" onclick={addScenario}>
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
  .scen-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .rate-type { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .rate-type .lbl { font-size: 14px; color: var(--text-2); }
  .sub-label { margin: 2px 0 -4px; font-size: 13px; font-weight: 600; color: var(--text-2); }
  .ptz-status { display: grid; gap: 4px; padding: 10px 12px; border-radius: 10px; background: var(--ok-soft); font-size: 14px; line-height: 1.4; }
  .ptz-status b { color: var(--ok); font-weight: 600; }
  .ptz-status span { color: var(--text-2); }
  .ptz-status.bad { background: var(--warn-soft); }
  .ptz-status.bad b { color: var(--warn); }
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
