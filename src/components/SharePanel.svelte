<script lang="ts">
  import { track } from '../lib/firebase/analytics.svelte';
  import { t } from '../lib/i18n/index.svelte';
  import { createShortUrl } from '../lib/shortlinks';
  import { toFullPayload, toHash } from '../lib/state.svelte';

  let { onclose }: { onclose: () => void } = $props();
  let url = $state('');
  let short = $state(false);
  let copied = $state(false);
  let input: HTMLInputElement | undefined = $state();
  let root: HTMLDivElement;

  // Create the link once, when the panel opens.
  (async () => {
    const shortUrl = await createShortUrl(await toFullPayload());
    short = !!shortUrl;
    url = shortUrl ?? `${location.origin}${location.pathname}${await toHash()}`;
    track('share', { short });
    queueMicrotask(() => input?.select());
  })();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      input?.select();
      document.execCommand?.('copy');
    }
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
  async function nativeShare() {
    try { await navigator.share({ title: 'Credisim', text: t('shareText'), url }); } catch { /* cancelled */ }
  }
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
</script>

<svelte:document
  onclick={(e) => root && !root.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('.share') && onclose()}
  onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="panel" bind:this={root} role="dialog" aria-label={t('shareTitle')}>
  <p class="title">{t('shareTitle')}</p>
  {#if !url}
    <p class="muted small">{t('shareCreating')}</p>
  {:else}
    <div class="row">
      <input bind:this={input} readonly value={url} aria-label={t('shareTitle')} onfocus={(e) => (e.target as HTMLInputElement).select()} />
      <button type="button" class="primary" onclick={copy}>{copied ? t('shareCopied') : t('shareCopy')}</button>
    </div>
    {#if canShare}<button type="button" class="link-btn" onclick={nativeShare}>{t('shareNative')}</button>{/if}
    <p class="muted small">{short ? t('shareNote') : t('shareLongNote')}</p>
  {/if}
</div>

<style>
  .panel {
    position: absolute; right: 0; top: calc(100% + 8px); z-index: 30; width: min(420px, calc(100vw - 32px));
    background: var(--surface); color: var(--text); border: 1px solid var(--sep); border-radius: var(--radius);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); padding: 16px; display: grid; gap: 10px;
  }
  .title { margin: 0; font-weight: 600; font-size: 16px; }
  p { margin: 0; line-height: 1.45; }
  .row { display: flex; gap: 8px; }
  input { flex: 1; min-width: 0; border: 1px solid var(--sep); background: var(--fill-2); border-radius: 10px; padding: 9px 12px; font-size: 15px; font-family: inherit; }
  .primary { border: 0; border-radius: 999px; background: var(--accent); color: var(--on-accent); padding: 8px 16px; font-size: 14px; font-weight: 500; white-space: nowrap; }
  .primary:hover { background: var(--accent-hover); }
  .link-btn { justify-self: start; }
</style>
