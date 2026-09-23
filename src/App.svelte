<script lang="ts">
  import { simulate } from './lib/engine';
  import { i18n, t } from './lib/i18n/index.svelte';
  import { parseRoute, route } from './lib/router.svelte';
  import { app, current, loadHash, setTheme, toHash } from './lib/state.svelte';
  import { SCENARIO_NAMES } from './lib/share';
  import LearnPage from './components/learn/LearnPage.svelte';
  import ToolsPage from './components/tools/ToolsPage.svelte';
  import ConsentBanner from './components/ConsentBanner.svelte';
  import { startAnalytics, track } from './lib/firebase/analytics.svelte';
  import BalanceChart from './components/BalanceChart.svelte';
  import Capacity from './components/Capacity.svelte';
  import CompareTable from './components/CompareTable.svelte';
  import CostDonut from './components/CostDonut.svelte';
  import DurationTable from './components/DurationTable.svelte';
  import FinancingPlan from './components/FinancingPlan.svelte';
  import Footer from './components/Footer.svelte';
  import Header from './components/Header.svelte';
  import InputPanel from './components/InputPanel.svelte';
  import ActionsBar from './components/ActionsBar.svelte';
  import Kpis from './components/Kpis.svelte';
  import PrintSummary from './components/PrintSummary.svelte';
  import MobileSummary from './components/MobileSummary.svelte';
  import Schedule from './components/Schedule.svelte';
  import SensitivityGrid from './components/SensitivityGrid.svelte';
  import TaegBreakdown from './components/TaegBreakdown.svelte';
  import TypePicker from './components/TypePicker.svelte';
  import YearBars from './components/YearBars.svelte';
  import VariableRateCard from './components/VariableRateCard.svelte';

  parseRoute();
  setTheme(app.theme);
  startAnalytics();

  // Hash navigation: Learn pages, or a shared simulation opened in a tab where Credisim is already running.
  let lastHash = location.hash;
  function onHashChange() {
    const wasView = route.view, wasTopic = route.topic, wasTool = route.tool;
    if (parseRoute()) {
      if (wasView !== route.view || wasTopic !== route.topic || wasTool !== route.tool) window.scrollTo({ top: 0 });
    } else {
      if (location.hash !== lastHash && /[#&][cs]=/.test(location.hash)) void loadHash();
      if (wasView !== 'sim') window.scrollTo({ top: 0 });
    }
  }

  const inp = $derived(current());
  const r = $derived(simulate(inp));
  const all = $derived(app.scenarios.map((x) => ({ inp: x, r: x === inp ? r : simulate(x) })));
  const SERIES_COLORS = ['var(--c-capital)', 'var(--c-interest)', 'var(--c-insurance)', 'var(--c-notary)'];

  // Keep the URL in sync so the address bar is always a shareable link.
  let timer: ReturnType<typeof setTimeout>;
  $effect(() => {
    if (route.view !== 'sim') return;
    const pending = toHash();
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const hash = await pending;
      if (route.view !== 'sim') return;
      lastHash = hash;
      history.replaceState(null, '', hash);
    }, 300);
  });
  // Page views: only the route (never the simulation, which lives in #s=…).
  $effect(() => {
    const path = route.view === 'sim' ? '/' : `/${route.view}${route.topic ? '/' + route.topic : route.tool ? '/' + route.tool : ''}`;
    track('page_view', { page_path: path, page_title: path, language: i18n.lang });
  });
  $effect(() => {
    document.documentElement.lang = i18n.lang;
    document.title = `Credisim · ${t('heroTitle')}`;
  });
</script>

<svelte:window onhashchange={onHashChange} />

<Header />

<main class="container">
  {#if route.view === 'learn'}
    <LearnPage />
  {:else if route.view === 'tools'}
    <ToolsPage />
  {:else}
  <section class="hero">
    <h1>{t('heroTitle')}</h1>
    <p>{t('tagline')}</p>
  </section>

  <TypePicker />

  <div class="layout">
    <aside><InputPanel /></aside>
    <div class="results">
      <PrintSummary {inp} {r} />
      <ActionsBar {r} />
      <Kpis {r} {inp} />
      {#if all.length > 1}
        <CompareTable list={all} />
      {/if}
      <div class="two">
        <FinancingPlan {r} {inp} />
        <TaegBreakdown {r} />
      </div>
      <div class="two">
        <CostDonut {r} />
        <BalanceChart
          series={all.length > 1
            ? all.map((x, i) => ({ label: t('scenario', { n: SCENARIO_NAMES[i] }), color: SERIES_COLORS[i], principal: x.r.totalBorrowed, rows: x.r.rows }))
            : [{ label: 'A', color: 'var(--c-capital)', principal: r.totalBorrowed, rows: r.rows }]}
        />
      </div>
      {#if r.variable}<VariableRateCard {r} />{/if}
      <YearBars years={r.years} />
      <Capacity {inp} />
      <DurationTable {inp} />
      <SensitivityGrid {inp} />
      <Schedule {r} />
      <a class="how" href="#learn/calculator">{t('howCalculated')} ›</a>
    </div>
  </div>
  {/if}
</main>

<Footer />
{#if route.view === 'sim'}<MobileSummary {r} />{/if}
<ConsentBanner />

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
  .how { justify-self: start; color: var(--accent); text-decoration: none; font-size: 15px; }
  .how:hover { text-decoration: underline; }
  .two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; }
  @media (max-width: 1080px) { .two { grid-template-columns: minmax(0, 1fr); } }
  @media (max-width: 900px) {
    .layout { grid-template-columns: minmax(0, 1fr); }
    aside { position: static; max-height: none; overflow: visible; }
    .hero { padding-block: 36px 24px; }
    main { padding-bottom: 72px; }
  }
</style>
