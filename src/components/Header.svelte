<script lang="ts">
  import { t } from '../lib/i18n/index.svelte';
  import { route } from '../lib/router.svelte';
  import SharePanel from './SharePanel.svelte';
  import ThemeButton from './ui/ThemeButton.svelte';
  import LangMenu from './ui/LangMenu.svelte';

  let sharing = $state(false);

</script>

<header class="nav">
  <div class="container bar">
    <a class="brand" href="./" aria-label="Credisim">
      <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden="true"><rect width="64" height="64" rx="14" fill="var(--accent)" /><path d="M14 46 L26 32 L36 38 L50 20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <span>Credisim</span>
    </a>
    <nav class="links">
      <a href="#sim" aria-current={route.view === 'sim' ? 'page' : undefined}>{t('navSim')}</a>
      <a href="#tools" aria-current={route.view === 'tools' ? 'page' : undefined}>{t('navTools')}</a>
      <a href="#learn" aria-current={route.view === 'learn' ? 'page' : undefined}>{t('navLearn')}</a>
    </nav>
    <div class="tools">
      <ThemeButton />
      <LangMenu />
      <div class="share-wrap">
      <button type="button" class="share" onclick={() => (sharing = !sharing)} aria-expanded={sharing} hidden={route.view !== 'sim'}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>{t('share')}</span>
      </button>
      {#if sharing && route.view === 'sim'}<SharePanel onclose={() => (sharing = false)} />{/if}
      </div>
    </div>
  </div>
</header>

<style>
  .nav {
    position: sticky; top: 0; z-index: 20;
    padding-top: env(safe-area-inset-top, 0px);
    background: var(--nav);
    backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--sep);
  }
  .bar { height: 52px; display: flex; align-items: center; gap: 16px; }
  .brand { display: flex; align-items: center; gap: 8px; color: var(--text); text-decoration: none; font-weight: 600; font-size: 19px; letter-spacing: -0.02em; }
  .links { display: flex; gap: 4px; margin-left: 12px; }
  .links a { color: var(--text-2); text-decoration: none; font-size: 14px; padding: 6px 10px; border-radius: 8px; white-space: nowrap; cursor: pointer; }
  .links a:hover { color: var(--text); }
  .links a[aria-current='page'] { color: var(--text); font-weight: 600; }
  @media (max-width: 560px) { .links { margin-left: 0; } .links a { padding: 6px; font-size: 13px; } .brand span { display: none; } }
  .tools { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .share-wrap { position: relative; }
  .share {
    display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px;
    background: var(--accent); color: var(--on-accent); padding: 6px 14px; font-size: 14px; font-weight: 500;
  }
  .share:hover { background: var(--accent-hover); }
  @media (max-width: 560px) { .share span { display: none; } .share { padding: 7px 9px; } }
</style>
