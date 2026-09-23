<script lang="ts">
  import { notaryFees, rentVsBuy } from '../../lib/engine';
  import { niceMax, ticks } from '../../lib/chart';
  import { fmt, t } from '../../lib/i18n/index.svelte';
  import { current } from '../../lib/state.svelte';
  import NumberField from '../ui/NumberField.svelte';
  import SliderField from '../ui/SliderField.svelte';

  const start = current();
  const startPrice = start.type === 'mortgage' ? start.price : 300000;
  let price = $state(startPrice);
  let costs = $state(Math.round(notaryFees(startPrice, 'old', 'raised', false) + 3000));
  let down = $state(start.type === 'mortgage' ? start.downPayment : 60000);
  let rate = $state(start.type === 'mortgage' ? start.rate : 3.2);
  let loanYears = $state(25);
  let insurance = $state(60);
  let ownerCosts = $state(2500);
  let growth = $state(2);
  let selling = $state(5);
  let rent = $state(1100);
  let rentGrowth = $state(1.5);
  let savings = $state(3);
  let years = $state(20);
  const r = $derived(rentVsBuy({ price, buyingCosts: costs, downPayment: down, rate: rate / 100, months: loanYears * 12, insurance, ownerCostsPerYear: ownerCosts, priceGrowth: growth / 100, sellingCosts: selling / 100, rent, rentGrowth: rentGrowth / 100, savingsReturn: savings / 100, years }));

  const W = 560, H = 240, L = 56, RP = 10, T = 12, B = 28;
  const lo = $derived(Math.min(0, ...r.years.map((y) => Math.min(y.buyer, y.renter))));
  const hi = $derived(niceMax(Math.max(1, ...r.years.map((y) => Math.max(y.buyer, y.renter)))));
  const x = (yr: number) => L + ((W - L - RP) * yr) / Math.max(1, years);
  const y = (v: number) => H - B - ((H - T - B) * (v - lo)) / (hi - lo || 1);
  const line = (f: 'buyer' | 'renter') => r.years.map((p, i) => `${i ? 'L' : 'M'}${x(p.year).toFixed(1)} ${y(p[f]).toFixed(1)}`).join('');
</script>

<div class="tool-layout">
  <div class="card tool-form">
    <h3>{t('rvbBuyer')}</h3>
    <div class="two">
      <NumberField id="rb-price" label={t('price_mortgage')} step={5000} bind:value={price} />
      <NumberField id="rb-costs" label={t('rentalCosts')} step={1000} bind:value={costs} />
    </div>
    <div class="two">
      <NumberField id="rb-down" label={t('downPayment')} step={1000} bind:value={down} />
      <NumberField id="rb-rate" label={t('loanRate')} unit="%" step={0.05} bind:value={rate} />
    </div>
    <div class="two">
      <NumberField id="rb-ly" label={t('loanMonths')} unit={t('unitYears')} step={1} min={5} max={30} bind:value={loanYears} />
      <NumberField id="rb-ins" label={t('insPerMonth')} step={5} bind:value={insurance} />
    </div>
    <div class="two">
      <NumberField id="rb-oc" label={t('rvbOwnerCosts')} step={100} bind:value={ownerCosts} />
      <NumberField id="rb-g" label={t('rvbPriceGrowth')} unit="%" step={0.5} min={-10} bind:value={growth} />
    </div>
    <NumberField id="rb-sell" label={t('rvbSelling')} unit="%" step={0.5} bind:value={selling} />
    <h3>{t('rvbRenter')}</h3>
    <div class="two">
      <NumberField id="rb-rent" label={t('rvbRent')} step={50} bind:value={rent} />
      <NumberField id="rb-rg" label={t('rvbRentGrowth')} unit="%" step={0.5} bind:value={rentGrowth} />
    </div>
    <NumberField id="rb-ret" label={t('rvbReturn')} unit="%" step={0.5} bind:value={savings} />
    <SliderField id="rb-years" label={t('rvbHorizon')} bind:value={years} min={3} max={30} step={1} unit={t('unitYears')} decimals={0} integer />
  </div>
  <div class="tool-results">
    <div class="figs">
      <div class="fig lead"><span class="fig-label">{t('rvbBuyer')}</span><span class="fig-value">{fmt.eur(r.final.buyer)}</span><span class="fig-sub">{t('years', { n: years })}</span></div>
      <div class="fig"><span class="fig-label">{t('rvbRenter')}</span><span class="fig-value">{fmt.eur(r.final.renter)}</span><span class="fig-sub">{t('years', { n: years })}</span></div>
    </div>
    <section class="card">
      <p class="verdict">{r.breakEvenYear ? t('rvbBreakEven', { n: t('years', { n: r.breakEvenYear }) }) : t('rvbNever')}</p>
      <svg viewBox="0 0 {W} {H}" role="img" aria-label={t('tool_rent-vs-buy')}>
        {#each ticks(hi - lo) as v (v)}
          <line x1={L} x2={W - RP} y1={y(v + lo)} y2={y(v + lo)} stroke="var(--sep)" />
          <text x={L - 8} y={y(v + lo) + 4} text-anchor="end" class="axis">{fmt.compact(v + lo)}</text>
        {/each}
        {#each r.years.filter((p) => p.year === 1 || p.year % 5 === 0) as p (p.year)}
          <text x={x(p.year)} y={H - 8} text-anchor="middle" class="axis">{p.year}</text>
        {/each}
        <path d={line('buyer')} fill="none" stroke="var(--c-capital)" stroke-width="2.5" />
        <path d={line('renter')} fill="none" stroke="var(--c-interest)" stroke-width="2.5" stroke-dasharray="6 5" />
      </svg>
      <ul class="legend"><li><i style="background:var(--c-capital)"></i>{t('rvbBuyer')}</li><li><i style="background:var(--c-interest)"></i>{t('rvbRenter')}</li></ul>
    </section>
    <p class="hint-box">{t('rvbHint')}</p>
  </div>
</div>

<style>
  svg { width: 100%; height: auto; display: block; overflow: visible; }
  .axis { fill: var(--text-3); font: 12px var(--font); }
  .verdict { margin: 0 0 12px; font-weight: 600; }
  .legend { list-style: none; padding: 0; margin: 10px 0 0; display: flex; gap: 18px; font-size: 14px; }
  .legend li { display: flex; align-items: center; gap: 6px; }
  .legend i { width: 14px; height: 3px; border-radius: 2px; }
</style>
