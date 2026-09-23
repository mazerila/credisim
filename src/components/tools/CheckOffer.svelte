<script lang="ts">
  import { checkOffer, simulate, type OfferCheck } from '../../lib/engine';
  import { fmt, t, type Key } from '../../lib/i18n/index.svelte';
  import { current } from '../../lib/state.svelte';
  import NumberField from '../ui/NumberField.svelte';
  import Segmented from '../ui/Segmented.svelte';

  const start = current();
  const sim = simulate({ ...start, amortization: 'annuity', deferralType: 'none', usePtz: false });
  let home = $state(start.type === 'mortgage' ? 'home' : 'consumer');
  let amount = $state(sim.principal);
  let rate = $state(start.rate);
  let months = $state(start.months);
  let payment = $state(Math.round(sim.payment * 100) / 100);
  let insurance = $state(Math.round(sim.insuranceMonthly * 100) / 100);
  let fees = $state(sim.fees);
  let guarantee = $state(Math.round(sim.guarantee));
  let taeg = $state(Math.round(sim.taeg * 10000) / 100);
  let totalCost = $state(0);

  const res = $derived(checkOffer({ amount, rate: rate / 100, months, payment, insurance, fees, guarantee, taeg: taeg / 100, totalCost, home: home === 'home' }));
  const issues = $derived(res.checks.filter((c) => c.status !== 'ok').length);
  const show = (c: OfferCheck, v: number) => (c.key === 'payment' || c.key === 'cost' ? fmt.eur(v, 2) : fmt.pct(v, c.key === 'rate' ? 3 : 2));
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('offerFigures')}</h3>
    <Segmented label={t('offerKind')} options={[{ value: 'home', label: t('offerHome') }, { value: 'consumer', label: t('offerConsumer') }]} bind:value={home} />
    <NumberField id="co-amount" label={t('loanAmount')} step={1000} bind:value={amount} />
    <div class="two">
      <NumberField id="co-rate" label={t('loanRate')} unit="%" step={0.01} bind:value={rate} />
      <NumberField id="co-months" label={t('loanMonths')} unit={t('unitMonths')} step={12} min={3} bind:value={months} />
    </div>
    <div class="two">
      <NumberField id="co-pay" label={t('offerPayment')} step={1} bind:value={payment} />
      <NumberField id="co-ins" label={t('insPerMonth')} step={1} bind:value={insurance} />
    </div>
    <div class="two">
      <NumberField id="co-fees" label={t('newFees')} step={50} bind:value={fees} />
      <NumberField id="co-guar" label={t('planGuarantee')} step={50} bind:value={guarantee} />
    </div>
    <div class="two">
      <NumberField id="co-taeg" label={t('offerTaeg')} unit="%" step={0.01} bind:value={taeg} />
      <NumberField id="co-cost" label={t('offerCost')} step={100} bind:value={totalCost} />
    </div>
  </div>

  <div class="tool-results">
    <div class="figs">
      <div class="fig" class:lead={issues === 0}><span class="fig-label">{t('tool_check-offer')}</span>
        <span class="fig-value">{issues === 0 ? '✓' : issues}</span>
        <span class="fig-sub">{issues === 0 ? t('offerAllOk') : t('offerIssues', { n: issues })}</span></div>
    </div>
    <section class="card">
      <ul class="checks">
        {#each res.checks as c (c.key)}
          <li>
            <span class="pill {c.status}">{t(`st_${c.status}` as Key)}</span>
            <div>
              <b>{t(`chk_${c.key}` as Key)}</b>
              <span class="muted small num">
                {#if c.key === 'usury'}{t('statedV', { v: fmt.pct(c.stated) })} · {t('taegMax', { u: fmt.pct(c.expected) })} ({res.quarter})
                {:else if c.key === 'rate'}{t('statedV', { v: show(c, c.stated) })} · {t('impliedV', { v: show(c, c.expected) })}
                {:else}{t('expectedV', { v: show(c, c.expected) })} · {t('statedV', { v: show(c, c.stated) })}{/if}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    </section>
    <p class="hint-box">{t('offerTaegHint')}</p>
  </div>
</div>

<style>
  .checks { list-style: none; margin: 0; padding: 0; display: grid; }
  .checks li { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 12px; align-items: start; padding: 12px 0; border-bottom: 1px solid var(--sep); }
  .checks li:last-child { border-bottom: 0; }
  .checks li:first-child { padding-top: 0; }
  .checks div { display: grid; gap: 2px; }
  .checks b { font-weight: 600; }
  @media (max-width: 480px) { .checks li { grid-template-columns: minmax(0, 1fr); gap: 4px; } }
</style>
