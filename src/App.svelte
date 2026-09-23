<script lang="ts">
  import { simulate } from './lib/engine';
  import { i18n, t } from './lib/i18n/index.svelte';
  import { app, current, loadHash, setTheme, toHash } from './lib/state.svelte';
  import BalanceChart from './components/BalanceChart.svelte';
  import Capacity from './components/Capacity.svelte';
  import CompareTable from './components/CompareTable.svelte';
  import CostDonut from './components/CostDonut.svelte';
  import DurationTable from './components/DurationTable.svelte';
  import FinancingPlan from './components/FinancingPlan.svelte';
  import Footer from './components/Footer.svelte';
  import Header from './components/Header.svelte';
  import InputPanel from './components/InputPanel.svelte';
  import Kpis from './components/Kpis.svelte';
  import MobileSummary from './components/MobileSummary.svelte';
  import Schedule from './components/Schedule.svelte';
  import TaegBreakdown from './components/TaegBreakdown.svelte';
  import TypePicker from './components/TypePicker.svelte';
  import YearBars from './components/YearBars.svelte';

  loadHash();
  setTheme(app.theme);

  // A shared link opened in a tab where Credisim is already running only changes the fragment.
  let lastHash = location.hash;
  function onHashChange() {
    if (location.hash !== lastHash) loadHash();
  }

  const inp = $derived(current());
  const r = $derived(simulate(inp));
  const ra = $derived(simulate(app.a));
  const rb = $derived(app.b ? simulate(app.b) : null);

  // Keep the URL in sync so the address bar is always a shareable link.
  let timer: ReturnType<typeof setTimeout>;
  $effect(() => {
    const hash = toHash();
    clearTimeout(timer);
    timer = setTimeout(() => {
      lastHash = hash;
      history.replaceState(null, '', hash);
    }, 300);
  });
  $effect(() => {
    document.documentElement.lang = i18n.lang;
    document.title = `Credisim · ${t('heroTitle')}`;
  });
</script>

<svelte:window onhashchange={onHashChange} />

<Header />

<main class="container">
  <section class="hero">
    <h1>{t('heroTitle')}</h1>
    <p>{t('tagline')}</p>
  </section>

  <TypePicker />

  <div class="layout">
    <aside><InputPanel /></aside>
    <div class="results">
      <Kpis {r} {inp} />
      {#if app.b && rb}
        <CompareTable a={app.a} b={app.b} {ra} {rb} />
      {/if}
      <div class="two">
        <FinancingPlan {r} {inp} />
        <TaegBreakdown {r} />
      </div>
      <div class="two">
        <CostDonut {r} />
        <BalanceChart
          series={app.b && rb
            ? [
                { label: t('scenario', { n: 'A' }), color: 'var(--c-capital)', principal: ra.principal, rows: ra.rows },
                { label: t('scenario', { n: 'B' }), color: 'var(--c-interest)', principal: rb.principal, rows: rb.rows },
              ]
            : [{ label: 'A', color: 'var(--c-capital)', principal: r.principal, rows: r.rows }]}
        />
      </div>
      <YearBars years={r.years} />
      <Capacity {inp} />
      <DurationTable {inp} />
      <Schedule {r} />
    </div>
  </div>
</main>

<Footer />
<MobileSummary {r} />

<style>
  .hero { text-align: center; padding-block: 56px 36px; }
  h1 {
    font-family: var(--font-display); font-size: clamp(34px, 5.5vw, 56px); font-weight: 700;
    letter-spacing: -0.035em; line-height: 1.07; margin: 0 auto 12px; max-width: 16ch; text-wrap: balance;
  }
  .hero p { margin: 0; font-size: clamp(19px, 2.2vw, 24px); color: var(--text-2); letter-spacing: -0.02em; }
  .layout { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 20px; align-items: start; margin-top: 20px; }
  aside { position: sticky; top: 72px; max-height: calc(100vh - 88px); overflow-y: auto; border-radius: var(--radius); scrollbar-width: thin; }
  .results { display: grid; gap: 20px; min-width: 0; }
  .two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; }
  @media (max-width: 1080px) { .two { grid-template-columns: minmax(0, 1fr); } }
  @media (max-width: 900px) {
    .layout { grid-template-columns: minmax(0, 1fr); }
    aside { position: static; max-height: none; overflow: visible; }
    .hero { padding-block: 36px 24px; }
    main { padding-bottom: 72px; }
  }
</style>
