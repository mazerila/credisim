<script lang="ts">
  import { i18n, LANGS, setLang, t, type Lang } from '../../lib/i18n/index.svelte';

  // Each language written in itself, so everyone finds theirs.
  const NAMES: Record<Lang, string> = { en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español', it: 'Italiano' };
  let open = $state(false);
  let root: HTMLDivElement;

  function pick(l: Lang) {
    setLang(l);
    open = false;
  }
</script>

<svelte:document onclick={(e) => open && root && !root.contains(e.target as Node) && (open = false)} onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<div class="lang" bind:this={root}>
  <button type="button" class="btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`${t('lang')}: ${NAMES[i18n.lang]}`} onclick={() => (open = !open)}>
    {i18n.lang.toUpperCase()}
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </button>
  {#if open}
    <ul role="listbox" aria-label={t('lang')}>
      {#each LANGS as l (l)}
        <li><button type="button" role="option" aria-selected={l === i18n.lang} lang={l} onclick={() => pick(l)}><span class="code">{l.toUpperCase()}</span>{NAMES[l]}</button></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .lang { position: relative; }
  .btn {
    display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 10px;
    border: 1px solid transparent; border-radius: 9px; background: var(--fill); color: var(--text);
    font-size: 13px; font-weight: 600;
  }
  .btn:hover { border-color: var(--accent); color: var(--accent); }
  ul {
    position: absolute; right: 0; top: calc(100% + 6px); z-index: 30; min-width: 170px; list-style: none; margin: 0; padding: 6px;
    background: var(--surface); border: 1px solid var(--sep); border-radius: 12px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  }
  li button {
    width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: 8px;
    background: none; color: var(--text); font-size: 15px; text-align: left;
  }
  li button:hover { background: var(--fill-2); }
  li button[aria-selected='true'] { color: var(--accent); font-weight: 600; }
  .code { width: 22px; font-size: 12px; font-weight: 600; color: var(--text-3); }
</style>
