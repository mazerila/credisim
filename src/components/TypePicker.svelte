<script lang="ts">
  import type { CreditType } from '../lib/engine';
  import { t } from '../lib/i18n/index.svelte';
  import { app, setType } from '../lib/state.svelte';

  const TYPES: CreditType[] = ['mortgage', 'personal', 'car', 'works'];
  const ICONS: Record<CreditType, string> = {
    mortgage: 'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-6h4v6',
    personal: 'M3 7h18v12H3zM3 11h18M7 15h4',
    car: 'M5 16h14M4 16v-3l2-5h12l2 5v3M4 16v2h3v-2M17 16v2h3v-2M7.5 13h.01M16.5 13h.01',
    works: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  };
</script>

<section class="picker no-print" aria-labelledby="type-title">
  <h2 id="type-title" class="visually">{t('typeTitle')}</h2>
  <div class="grid" role="radiogroup" aria-labelledby="type-title">
    {#each TYPES as type (type)}
      <button type="button" role="radio" aria-checked={app.scenarios[0].type === type} onclick={() => app.scenarios[0].type !== type && setType(type)}>
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d={ICONS[type]} fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span class="name">{t(`type_${type}`)}</span>
        <span class="hint">{t(`typeHint_${type}`)}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .visually { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  @media (max-width: 860px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  button {
    display: grid; justify-items: start; gap: 4px; text-align: left;
    background: var(--surface); border: 2px solid var(--card-border); border-radius: var(--radius);
    padding: 16px 18px; box-shadow: var(--shadow); color: var(--text);
    transition: border-color 0.2s, transform 0.2s;
  }
  button:hover { transform: translateY(-1px); }
  button[aria-checked='true'] { border-color: var(--accent); }
  button[aria-checked='true'] svg { color: var(--accent); }
  svg { color: var(--text-2); margin-bottom: 4px; }
  .name { font-size: 17px; font-weight: 600; }
  .hint { font-size: 13px; color: var(--text-2); line-height: 1.35; letter-spacing: -0.01em; }
  @media (max-width: 520px) { .hint { display: none; } button { padding: 14px; } }
</style>
