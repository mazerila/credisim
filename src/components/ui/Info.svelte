<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte';
  import type { TopicId } from '../../lib/learn';
  import { isEmbed, siteHref } from '../../lib/embed';

  let { text, learn, label = 'More information' }: { text: string; learn?: TopicId; label?: string } = $props();
  let open = $state(false);
  let root: HTMLSpanElement;

  function onDocClick(e: MouseEvent) {
    if (open && root && !root.contains(e.target as Node)) open = false;
  }
</script>

<svelte:document onclick={onDocClick} onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<span class="info" bind:this={root}>
  <button type="button" class="dot" aria-label={label} aria-expanded={open} onclick={() => (open = !open)}>i</button>
  {#if open}
    <span class="bubble" role="tooltip">{text}{#if learn}<a href={siteHref(`#learn/${learn}`)} target={isEmbed ? '_blank' : undefined} rel={isEmbed ? 'noopener' : undefined} onclick={() => (open = false)}>{t('learnMore')} ›</a>{/if}</span>
  {/if}
</span>

<style>
  .info { position: relative; display: inline-flex; vertical-align: middle; }
  .dot {
    width: 17px; height: 17px; border-radius: 50%;
    border: 1.5px solid var(--text-3); background: none; color: var(--text-3);
    font: 700 11px/1 var(--font); font-style: italic; letter-spacing: 0;
    display: inline-grid; place-items: center; padding: 0;
  }
  .dot:hover, .dot[aria-expanded='true'] { border-color: var(--accent); color: var(--accent); }
  .bubble {
    position: absolute; z-index: 30; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
    width: min(300px, 80vw); padding: 12px 14px; border-radius: 12px;
    background: var(--surface); color: var(--text); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    border: 1px solid var(--sep);
    font-size: 14px; font-weight: 400; line-height: 1.45; letter-spacing: -0.01em; text-transform: none;
  }
  .bubble a { display: block; margin-top: 8px; color: var(--accent); text-decoration: none; font-weight: 500; }
  .bubble a:hover { text-decoration: underline; }
  @media (max-width: 600px) { .bubble { left: auto; right: -40px; transform: none; } }
</style>
