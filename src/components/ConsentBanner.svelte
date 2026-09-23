<script lang="ts">
  import { consent, setConsent } from '../lib/firebase/analytics.svelte';
  import { t } from '../lib/i18n/index.svelte';
</script>

{#if consent.value === null || consent.open}
  <div class="banner no-print" role="dialog" aria-live="polite" aria-label={t('consentTitle')}>
    <p><b>{t('consentTitle')}</b> {t('consentText')}</p>
    <div class="actions">
      <button type="button" onclick={() => setConsent('denied')}>{t('consentDeny')}</button>
      <button type="button" class="primary" onclick={() => setConsent('granted')}>{t('consentAccept')}</button>
    </div>
  </div>
{/if}

<style>
  .banner {
    position: fixed; z-index: 50; left: 50%; transform: translateX(-50%);
    bottom: calc(16px + env(safe-area-inset-bottom, 0px)); width: min(680px, calc(100% - 32px));
    background: var(--surface); color: var(--text); border: 1px solid var(--sep); border-radius: var(--radius);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); padding: 16px 18px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
  }
  p { margin: 0; flex: 1 1 320px; font-size: 14px; line-height: 1.45; color: var(--text-2); }
  b { color: var(--text); font-weight: 600; }
  .actions { display: flex; gap: 8px; margin-left: auto; }
  button { border: 1px solid var(--sep); background: var(--surface); color: var(--text); border-radius: 999px; padding: 8px 16px; font-size: 14px; font-weight: 500; }
  button:hover { border-color: var(--accent); }
  .primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  .primary:hover { background: var(--accent-hover); }
  @media (max-width: 900px) { .banner { bottom: calc(76px + env(safe-area-inset-bottom, 0px)); } }
</style>
