<script lang="ts">
  import { usuryTable, USURY_SOURCE } from '../lib/engine';
  import { t } from '../lib/i18n/index.svelte';
  import logo from '../assets/dev-logo-am.png';

  const { table } = usuryTable();
</script>

<footer class="container">
  <p>{t('footPrivacy')}</p>
  <p>{t('footSources', { q: table.quarter })} <a href={USURY_SOURCE} target="_blank" rel="noopener">Banque de France</a></p>
  <p>{t('footDisclaimer')}</p>
  <div class="bottom">
    <p>© 2026 Credisim</p>
    <!-- Developer credit (same treatment as Suncast): the "am" monogram painted as a mask
         in the link's colour; "Developed by" types itself in on hover. -->
    <a class="author" href="https://bald.studio/team/#antoine-mokhtari" target="_blank" rel="me noopener noreferrer" aria-label={t('developedByAria')}>
      <span class="author-label" aria-hidden="true"><span><span>{t('developedBy')}</span></span></span>
      <span class="author-mark" aria-hidden="true" style="--logo: url({logo})"></span>
    </a>
  </div>
</footer>

<style>
  footer { padding-block: 32px 48px; border-top: 1px solid var(--sep); margin-top: 48px; display: grid; gap: 8px; }
  p { margin: 0; font-size: 12px; line-height: 1.5; color: var(--text-3); letter-spacing: 0; max-width: 90ch; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 8px; }
  .author { display: inline-flex; align-items: center; padding: 8px 0; color: var(--text-3); opacity: 0.7; transition: color 0.5s, opacity 0.5s; text-decoration: none; }
  .author:hover, .author:focus-visible { color: #d8261c; opacity: 1; text-decoration: none; }
  .author-label { display: grid; grid-template-columns: 0fr; transition: grid-template-columns 0.6s steps(12, end); }
  .author:hover .author-label, .author:focus-visible .author-label { grid-template-columns: 1fr; }
  .author-label > span { min-width: 0; overflow: hidden; }
  .author-label > span > span { display: block; white-space: nowrap; padding-right: 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1; color: var(--text-2); }
  .author-mark { display: block; width: 28px; height: 12px; flex: none; background: currentColor; -webkit-mask: var(--logo) center / contain no-repeat; mask: var(--logo) center / contain no-repeat; }
  @media (prefers-reduced-motion: reduce) { .author-label { transition: none; } }
</style>
