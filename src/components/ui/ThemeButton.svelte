<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte';
  import { app, setTheme, type Theme } from '../../lib/state.svelte';

  // One button, three states, like HouseHunt's ◐ toggle: Auto → Light → Dark → Auto.
  const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
  const LABEL = { system: 'themeSystem', light: 'themeLight', dark: 'themeDark' } as const;
  const label = $derived(`${t('theme')}: ${t(LABEL[app.theme])} → ${t(LABEL[NEXT[app.theme]])}`);
</script>

<button type="button" class="theme-btn" onclick={() => setTheme(NEXT[app.theme])} title={label} aria-label={label}>
  {#if app.theme === 'system'}
    <!-- half-filled circle: follows the device -->
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" /></svg>
  {:else if app.theme === 'light'}
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
  {:else}
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>
  {/if}
</button>

<style>
  .theme-btn {
    display: inline-grid; place-items: center; width: 34px; height: 30px; padding: 0;
    border: 1px solid transparent; border-radius: 9px; background: var(--fill); color: var(--text);
    transition: border-color 0.15s, color 0.15s;
  }
  .theme-btn:hover { border-color: var(--accent); color: var(--accent); }
</style>
