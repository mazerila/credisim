<script lang="ts">
  import { notaryFees, rentalAdvanced, rentalInvestment, TAX_REGIMES, isFurnished, type ExtraCost, type TaxRegime } from '../../lib/engine';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import { track } from '../../lib/analytics';
  import NumberField from '../ui/NumberField.svelte';
  import Segmented from '../ui/Segmented.svelte';
  import SelectField from '../ui/SelectField.svelte';
  import SliderField from '../ui/SliderField.svelte';
  import Info from '../ui/Info.svelte';

  let mode = $state<'simple' | 'advanced'>('simple');
  let price = $state(200000);
  let extra = $state(Math.round(notaryFees(200000, 'old', 'raised', false)));
  let down = $state(20000);
  let rate = $state(3.4);
  let months = $state(240);
  let insurance = $state(50);
  let rent = $state(900);
  let vacancy = $state(1);
  let charges = $state(60);
  let tax = $state(1000);
  let mgmt = $state(7);
  let pno = $state(150);
  // Advanced
  let years = $state(20);
  let rentGrowth = $state(1.5);
  let priceGrowth = $state(1.5);
  let costGrowth = $state(2);
  let selling = $state(5);
  let oppRate = $state(3);
  let regime = $state<TaxRegime>('lmnp-reel');
  let tmi = $state('30');
  let premium = $state(10);
  let furniture = $state(5000);
  let land = $state(15);
  let extras = $state<ExtraCost[]>([
    { label: t('rlExampleWorks'), amount: 6000, kind: 'once', year: 10 },
    { label: t('rlExampleAccountant'), amount: 360, kind: 'yearly', year: 0 },
  ]);

  const total = $derived(price + extra);
  const r = $derived(rentalInvestment({ totalCost: total, price, loanAmount: Math.max(0, total - down), rate: rate / 100, months, insurance, rent, vacancyMonths: vacancy, charges, propertyTax: tax, managementPct: mgmt / 100, ownerInsurance: pno }));

  const all = $derived(
    mode === 'advanced'
      ? rentalAdvanced({
          price, purchaseCosts: extra, downPayment: down, rate: rate / 100, months, insurance,
          rent, vacancyMonths: vacancy, charges, propertyTax: tax, managementPct: mgmt / 100, ownerInsurance: pno,
          extras: extras.filter((e) => e.amount > 0), years, rentGrowth: rentGrowth / 100, costGrowth: costGrowth / 100,
          priceGrowth: priceGrowth / 100, sellingCosts: selling / 100, opportunityRate: oppRate / 100,
          taxRate: Number(tmi) / 100, furnishedPremium: premium / 100, furniture, landShare: land / 100,
        })
      : [],
  );
  const a = $derived(all.find((x) => x.regime === regime));
  const best = $derived(all.filter((x) => x.available).reduce<(typeof all)[number] | null>((b, x) => (!b || x.gainVsPlacement > b.gainVsPlacement ? x : b), null));
  const toppedUp = $derived(a ? a.rows.reduce((s, y) => s + Math.max(0, -y.cashFlow), 0) : 0);
  const nYears = $derived(t('years', { n: years }));
  const signed = (v: number, d = 0) => (v >= 0 ? '+' : '−') + fmt.eur(Math.abs(v), d);
  const pctOrDash = (v: number | null) => (v === null ? '—' : fmt.pct(v));

  function addExtra() {
    extras.push({ label: '', amount: 0, kind: 'yearly', year: 1 });
  }
  function setMode(v: 'simple' | 'advanced') {
    track('rental_mode_changed', { mode: v });
  }
</script>

<div class="mode">
  <Segmented label={t('rlMode')} options={[{ value: 'simple', label: t('rlSimple') }, { value: 'advanced', label: t('rlAdvanced') }]} bind:value={mode} onchange={setMode} />
</div>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('secProject')}</h3>
    <div class="two">
      <NumberField id="rl-price" label={t('rentalPrice')} step={5000} bind:value={price} />
      <NumberField id="rl-extra" label={t('rentalCosts')} step={1000} bind:value={extra} />
    </div>
    <NumberField id="rl-down" label={t('downPayment')} step={1000} bind:value={down} />
    <div class="two">
      <NumberField id="rl-rate" label={t('loanRate')} unit="%" step={0.05} bind:value={rate} />
      <NumberField id="rl-months" label={t('loanMonths')} unit={t('unitMonths')} step={12} min={12} bind:value={months} />
    </div>
    <NumberField id="rl-ins" label={t('insPerMonth')} step={5} bind:value={insurance} />
    <h3>{t('rent')}</h3>
    <div class="two">
      <NumberField id="rl-rent" label={mode === 'advanced' ? t('rlRentUnfurnished') : t('rent')} step={10} bind:value={rent} />
      <NumberField id="rl-vac" label={t('vacancy')} unit="" step={0.5} max={12} bind:value={vacancy} />
    </div>
    <div class="two">
      <NumberField id="rl-charges" label={t('ownerCharges')} step={10} bind:value={charges} />
      <NumberField id="rl-tax" label={t('propertyTax')} step={50} bind:value={tax} />
    </div>
    <div class="two">
      <NumberField id="rl-mgmt" label={t('management')} unit="%" step={0.5} bind:value={mgmt} />
      <NumberField id="rl-pno" label={t('ownerIns')} step={10} bind:value={pno} />
    </div>

    {#if mode === 'advanced'}
      <h3>{t('rlTax')}</h3>
      <SelectField id="rl-regime" label={t('rlRegime')} tip={t('rlRegimeTip')} learn="rental-investment" bind:value={regime}
        options={TAX_REGIMES.map((v) => ({ value: v, label: t(`reg_${v}`) }))} />
      <SelectField id="rl-tmi" label={t('rlTmi')} tip={t('rlTmiTip')} bind:value={tmi}
        options={['0', '11', '30', '41', '45'].map((v) => ({ value: v, label: `${v} %` }))} />
      {#if isFurnished(regime)}
        <div class="two">
          <NumberField id="rl-prem" label={t('rlPremium')} unit="%" step={1} bind:value={premium} />
          <NumberField id="rl-furn" label={t('rlFurniture')} step={500} bind:value={furniture} />
        </div>
        {#if regime === 'lmnp-reel'}
          <NumberField id="rl-land" label={t('rlLand')} unit="%" step={1} max={60} tip={t('rlLandTip')} bind:value={land} />
        {/if}
      {/if}

      <h3>{t('rlMoney')}</h3>
      <NumberField id="rl-opp" label={t('rlOppRate')} unit="%" step={0.25} tip={t('rlOppTip')} bind:value={oppRate} />

      <h3>{t('rlMarket')}</h3>
      <SliderField id="rl-years" label={t('rlYears')} bind:value={years} min={1} max={30} step={1} unit={t('unitYears')} decimals={0} integer />
      <div class="two">
        <NumberField id="rl-rg" label={t('rlRentGrowth')} unit="%" step={0.5} min={-5} bind:value={rentGrowth} />
        <NumberField id="rl-pg" label={t('rlPriceGrowth')} unit="%" step={0.5} min={-10} bind:value={priceGrowth} />
      </div>
      <div class="two">
        <NumberField id="rl-cg" label={t('rlCostGrowth')} unit="%" step={0.5} min={-5} bind:value={costGrowth} />
        <NumberField id="rl-sell" label={t('rlSelling')} unit="%" step={0.5} bind:value={selling} />
      </div>

      <h3>{t('rlExtras')}</h3>
      <p class="muted small">{t('rlExtrasHint')}</p>
      {#each extras as e, i (i)}
        <div class="extra">
          <div class="extra-top">
            <input class="name" type="text" aria-label={t('rlExtraLabel')} placeholder={t('rlExtraLabel')} bind:value={e.label} />
            <button type="button" class="remove" aria-label={t('rlExtraRemove')} onclick={() => extras.splice(i, 1)}>×</button>
          </div>
          <div class="two">
            <NumberField id="rl-x{i}-amt" label={t('rlExtraAmount')} step={50} bind:value={e.amount} />
            <SelectField id="rl-x{i}-kind" label={t('rlExtraKind')} bind:value={e.kind}
              options={(['once', 'monthly', 'yearly'] as const).map((v) => ({ value: v, label: t(`kind_${v}`) }))} />
          </div>
          {#if e.kind === 'once'}
            <NumberField id="rl-x{i}-year" label={t('rlExtraYear')} unit="" step={1} max={years} bind:value={e.year} />
          {/if}
        </div>
      {/each}
      <button type="button" class="add" onclick={addExtra}>+ {t('rlExtraAdd')}</button>
    {/if}
  </div>

  <div class="tool-results">
    {#if mode === 'simple' || !a}
      <div class="figs">
        <div class="fig lead"><span class="fig-label">{t('cashFlow')}</span><span class="fig-value">{signed(r.cashFlow)}</span>
          <span class="fig-sub">{r.cashFlow < 0 ? t('cashNeg', { v: fmt.eur(-r.cashFlow) }) : t('cashPos', { v: fmt.eur(r.cashFlow) })}</span></div>
        <div class="fig"><span class="fig-label">{t('grossYield')}</span><span class="fig-value">{fmt.pct(r.grossYield)}</span></div>
        <div class="fig"><span class="fig-label">{t('netYield')}</span><span class="fig-value">{fmt.pct(r.netYield)}</span></div>
      </div>
      <section class="card">
        <table class="compare-rows">
          <tbody>
            <tr><td>{t('rent')} × {12 - vacancy}</td><td>{fmt.eur(r.rentsPerYear)}</td></tr>
            <tr><td>{t('ownerCharges')}, {t('propertyTax').toLowerCase()}, {t('management').toLowerCase()}, PNO</td><td>− {fmt.eur(r.costsPerYear)}</td></tr>
            <tr><td><b>{t('netYield')}</b></td><td><b>{fmt.eur(r.netRentPerYear)}</b></td></tr>
            <tr><td>{t('rPayment')} + {t('colInsurance').toLowerCase()}</td><td>{fmt.eur(r.payment + insurance, 2)} / {t('unitMonths').replace(/s$/, '')}</td></tr>
          </tbody>
        </table>
      </section>
      <p class="hint-box">{t('rentalHint')} {t('rlTryAdvanced')}</p>
    {:else}
      <div class="figs">
        <div class="fig lead"><span class="fig-label">{t('rlCashAfterTax')}</span><span class="fig-value">{signed(a.rows[0].cashFlow / 12)}</span>
          <span class="fig-sub">{t('rlYear1')} · {t('rlTaxYear1', { v: fmt.eur(a.rows[0].tax / 12) })}</span></div>
        <div class="fig"><span class="fig-label">{t('rlIrr')}</span>
          <span class="fig-value" class:good={a.irr !== null && a.irr > oppRate / 100} class:bad={a.irr !== null && a.irr < oppRate / 100}>{pctOrDash(a.irr)}</span>
          <span class="fig-sub">{t('rlIrrSub', { r: fmt.pct(oppRate / 100) })}</span></div>
        <div class="fig"><span class="fig-label">{t('rlVs')}</span>
          <span class="fig-value" class:good={a.gainVsPlacement > 0} class:bad={a.gainVsPlacement < 0}>{signed(a.gainVsPlacement)}</span>
          <span class="fig-sub">{t(a.gainVsPlacement >= 0 ? 'rlVsMore' : 'rlVsLess', { r: fmt.pct(oppRate / 100), n: nYears })}</span></div>
      </div>

      {#if !a.available}<p class="warn">{t('rlNA')}</p>{/if}

      <section class="card">
        <h4>{t('rlCompare', { n: nYears })}</h4>
        <div class="scroll">
          <table class="compare-rows regimes">
            <thead><tr><th>{t('rlRegime')}</th><th>{t('rlColCash')}</th><th>{t('rlColTax')}</th><th>{t('rlIrr')}</th><th>{t('rlVs')}</th></tr></thead>
            <tbody>
              {#each all as x (x.regime)}
                <tr class:sel={x.regime === regime} class:na={!x.available}>
                  <td><button type="button" class="pick" onclick={() => (regime = x.regime)} aria-pressed={x.regime === regime}>{t(`reg_${x.regime}`)}</button>
                    {#if best && x.regime === best.regime}<span class="best">{t('rlBest')}</span>{/if}
                    {#if !x.available}<span class="muted small"> · {t('rlNAShort')}</span>{/if}</td>
                  <td>{signed(x.rows[0].cashFlow / 12)}</td>
                  <td>{fmt.eur(x.totalTax + x.capitalGainTax)}</td>
                  <td>{pctOrDash(x.irr)}</td>
                  <td class:good={x.gainVsPlacement > 0} class:bad={x.gainVsPlacement < 0}>{signed(x.gainVsPlacement)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <div class="duo">
        <section class="card">
          <h4>{t('rlMoney')}<Info text={t('rlOppTip')} /></h4>
          <table class="compare-rows">
            <tbody>
              <tr><td>{t('rlAtStart')}</td><td>{fmt.eur(a.equity)}</td></tr>
              <tr><td>{t('rlToppedUp', { n: nYears })}</td><td>{fmt.eur(toppedUp)}</td></tr>
              <tr><td>{t('rlGivenUp', { r: fmt.pct(oppRate / 100), n: nYears })}</td><td>{fmt.eur(a.opportunityCost)}</td></tr>
            </tbody>
          </table>
        </section>
        <section class="card">
          <h4>{t('rlSale', { n: nYears })}</h4>
          <table class="compare-rows">
            <tbody>
              <tr><td>{t('rlSaleValue')}</td><td>{fmt.eur(a.saleValue)}</td></tr>
              <tr><td>{t('rlSelling')}</td><td>− {fmt.eur(a.saleValue * selling / 100)}</td></tr>
              <tr><td>{t('rlOwed')}</td><td>{a.rows[a.rows.length - 1].balance > 0 ? '− ' : ''}{fmt.eur(a.rows[a.rows.length - 1].balance)}</td></tr>
              <tr><td>{t('rlCgt')}</td><td>− {fmt.eur(a.capitalGainTax)}</td></tr>
              <tr><td><b>{t('rlNetSale')}</b></td><td><b>{fmt.eur(a.netSale)}</b></td></tr>
            </tbody>
          </table>
        </section>
      </div>

      <details class="card">
        <summary>{t('rlByYear')}</summary>
        <div class="scroll">
          <table class="years">
            <thead><tr><th>{t('colYear')}</th><th>{t('rlColRents')}</th><th>{t('rlColCosts')}</th><th>{t('rlColLoan')}</th><th>{t('rlColTaxY')}</th><th>{t('rlColCashY')}</th><th>{t('rlColOpp')}</th></tr></thead>
            <tbody>
              {#each a.rows as y (y.year)}
                <tr><td>{y.year}</td><td>{fmt.eur(y.rents)}</td><td>{fmt.eur(y.costs)}</td><td>{fmt.eur(y.loanPayments)}</td><td>{fmt.eur(y.tax)}</td>
                  <td class:bad={y.cashFlow < 0}>{signed(y.cashFlow)}</td><td>{fmt.eur(y.opportunityCost)}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </details>

      <p class="hint-box">{t('rlAdvHint')}</p>
    {/if}
  </div>
</div>

<style>
  .mode { max-width: 360px; margin-bottom: 16px; }
  h4 { font-family: var(--font-display); font-size: 17px; font-weight: 600; margin: 0 0 10px; letter-spacing: -0.02em; display: flex; align-items: center; gap: 6px; }
  .scroll { overflow-x: auto; }
  .regimes { width: 100%; min-width: 560px; border-collapse: collapse; }
  .regimes tr.sel td { background: var(--accent-soft); }
  .regimes tr.sel td:first-child { border-radius: 8px 0 0 8px; }
  .regimes tr.sel td:last-child { border-radius: 0 8px 8px 0; }
  .regimes td { padding-inline: 6px; }
  .regimes tr.na td:not(:first-child) { color: var(--text-3); }
  .pick { background: none; border: 0; padding: 0; font: inherit; color: var(--text); cursor: pointer; text-align: left; }
  .pick:hover { color: var(--accent); }
  .best { display: inline-block; margin-left: 6px; font-size: 12px; font-weight: 600; color: var(--ok); background: color-mix(in srgb, var(--ok) 14%, transparent); padding: 1px 8px; border-radius: 999px; }
  td.good { color: var(--ok); } td.bad { color: var(--bad); }
  .duo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; }
  @media (max-width: 1080px) { .duo { grid-template-columns: minmax(0, 1fr); } }
  .compare-rows { width: 100%; border-collapse: collapse; }
  details summary { cursor: pointer; font-weight: 600; font-size: 16px; }
  details[open] summary { margin-bottom: 12px; }
  .years { width: 100%; min-width: 620px; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
  .years th { font-size: 12px; color: var(--text-2); font-weight: 600; text-align: right; padding: 6px 8px; border-bottom: 1px solid var(--sep); }
  .years td { text-align: right; padding: 6px 8px; border-bottom: 1px solid var(--sep); }
  .years th:first-child, .years td:first-child { text-align: left; }
  .years td.bad { color: var(--bad); }
  .warn { margin: 0; padding: 10px 14px; border-radius: var(--radius-sm); background: color-mix(in srgb, var(--bad) 12%, transparent); font-size: 14px; }
  .extra { display: grid; gap: 10px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--sep); }
  .extra-top { display: flex; gap: 8px; }
  .name { flex: 1; min-width: 0; font: inherit; font-size: 15px; color: var(--text); background: var(--fill-2); border: 1px solid transparent; border-radius: var(--radius-sm); padding: 8px 12px; }
  .name:focus { outline: none; border-color: var(--accent); }
  .remove { flex: none; width: 36px; border: 0; border-radius: var(--radius-sm); background: var(--fill-2); color: var(--text-2); font-size: 20px; cursor: pointer; }
  .remove:hover { color: var(--bad); }
  .add { justify-self: start; background: none; border: 1px dashed var(--sep); color: var(--accent); border-radius: var(--radius-sm); padding: 8px 14px; font: inherit; font-size: 15px; cursor: pointer; }
  .add:hover { border-color: var(--accent); }
  .muted { color: var(--text-2); } .small { font-size: 13px; margin: -6px 0 0; line-height: 1.45; }
</style>
