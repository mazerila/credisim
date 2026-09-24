<script lang="ts">
  import Logo from './components/ui/Logo.svelte';
  import { simulate, type CreditType } from './lib/engine';
  import { i18n, t } from './lib/i18n/index.svelte';
  import { app, current, setType, toHash } from './lib/state.svelte';
  import { reportHeight } from './lib/embed';
  import { initAnalytics, track, trackPageview } from './lib/analytics';
  import InputPanel from './components/InputPanel.svelte';
  import Kpis from './components/Kpis.svelte';
  import CostDonut from './components/CostDonut.svelte';
  import Segmented from './components/ui/Segmented.svelte';

  const TYPES: CreditType[] = ['mortgage', 'personal', 'car', 'works'];
  const q = new URLSearchParams(location.search);

  // The host page picks the theme; the visitor's saved Credisim theme is left alone.
  const theme = q.get('theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;

  initAnalytics(i18n.lang);
  trackPageview('/embed');
  let host = '';
  try { host = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* no referrer */ }
  track('embed_loaded', { host, credit_type: app.scenarios[0].type });

  let type = $state<CreditType>(app.scenarios[0].type);
  const inp = $derived(current());
  const r = $derived(simulate(inp));

  // "Open in Credisim" carries the whole simulation, like a share link.
  let openHref = $state('/');
  $effect(() => {
    const pending = toHash();
    void pending.then((h) => (openHref = `${location.origin}/${h}`));
  });

  let root: HTMLElement;
  $effect(() => reportHeight(root));
  $effect(() => {
    document.documentElement.lang = i18n.lang;
    document.title = `Credisim · ${t('heroTitle')}`;
  });
</script>

<div class="embed" bind:this={root}>
  <Segmented
    label={t('typeTitle')}
    options={TYPES.map((v) => ({ value: v, label: t(`type_${v}`) }))}
    bind:value={type}
    onchange={(v) => { setType(v); track('credit_type_selected', { credit_type: v, embed: true }); }}
  />
  <div class="grid">
    <div class="inputs"><InputPanel /></div>
    <div class="results">
      <Kpis {r} {inp} />
      <CostDonut {r} country={inp.country} />
      <a class="open" href={openHref} target="_blank" rel="noopener" onclick={() => track('embed_opened', { host })}>
        <span class="brand">
          <Logo size={28} />
          <span><b>{t('embedOpen')} ›</b><small>{t('embedOpenSub')}</small></span>
        </span>
      </a>
    </div>
  </div>
</div>

<style>
  :global(body) { background: var(--bg); }
  .embed { display: grid; gap: 14px; padding: 14px; }
  .grid { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 14px; align-items: start; }
  .results { display: grid; gap: 14px; min-width: 0; }
  .open {
    display: block; padding: 14px 16px; border-radius: var(--radius); background: var(--card);
    border: 1px solid var(--card-border); color: var(--text); text-decoration: none;
  }
  .open:hover { border-color: var(--accent); }
  .open:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .brand { display: flex; gap: 12px; align-items: center; }
  .brand b { display: block; color: var(--accent); font-size: 15px; font-weight: 600; }
  .brand small { display: block; color: var(--text-2); font-size: 13px; margin-top: 2px; }
  @media (max-width: 720px) { .grid { grid-template-columns: minmax(0, 1fr); } }
</style>
