<script lang="ts">
  import Logo from './ui/Logo.svelte';
  import { t } from '../lib/i18n/index.svelte';
  import { route } from '../lib/router.svelte';
  import SharePanel from './SharePanel.svelte';
  import ThemeButton from './ui/ThemeButton.svelte';
  import LangMenu from './ui/LangMenu.svelte';
  import AccountPanel from './AccountPanel.svelte';
  import { account } from '../lib/account.svelte';

  let sharing = $state(false);

</script>

<header class="nav">
  <div class="container bar">
    <a class="brand" href="./" aria-label="Credisim">
      <Logo />
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
      {#if account.enabled}
        <div class="share-wrap">
          <button type="button" class="account-btn" class:on={!!account.user} onclick={() => { account.panelOpen = !account.panelOpen; sharing = false; }}
            aria-expanded={account.panelOpen} aria-label={account.user ? t('accTitle') : t('accSignIn')} title={account.user ? account.user.email : t('accSignIn')}>
            {#if account.user}
              <span class="initial">{(account.user.name || account.user.email || '?').slice(0, 1).toUpperCase()}</span>
            {:else}
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
            {/if}
          </button>
          {#if account.panelOpen}<AccountPanel onclose={() => (account.panelOpen = false)} />{/if}
        </div>
      {/if}
      <div class="share-wrap">
      <button type="button" class="share" onclick={() => { sharing = !sharing; account.panelOpen = false; }} aria-expanded={sharing} hidden={route.view !== 'sim'}>
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
  /* Phones: the links get their own row under the logo and buttons. */
  @media (max-width: 560px) {
    .bar { height: auto; flex-wrap: wrap; row-gap: 0; padding-top: 8px; }
    .links { order: 3; width: 100%; margin: 0 0 0 -8px; padding: 2px 0 4px; }
    .links a { padding: 6px 8px; font-size: 14px; }
  }
  .tools { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .share-wrap { position: relative; }
  .share {
    display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px;
    background: var(--accent); color: var(--on-accent); padding: 6px 14px; font-size: 14px; font-weight: 500;
  }
  .share:hover { background: var(--accent-hover); }
  .account-btn {
    display: inline-grid; place-items: center; width: 34px; height: 30px; padding: 0; cursor: pointer;
    border: 1px solid transparent; border-radius: 9px; background: var(--fill); color: var(--text);
  }
  .account-btn:hover { color: var(--accent); }
  .account-btn.on { background: var(--accent-soft); color: var(--accent); }
  .initial { font-weight: 600; font-size: 15px; }
  @media (max-width: 560px) { .share span { display: none; } .share { padding: 7px 9px; } }
</style>
