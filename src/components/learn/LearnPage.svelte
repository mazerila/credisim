<script lang="ts">
  import { i18n, t, type Key } from '../../lib/i18n/index.svelte';
  import { article, GROUPS } from '../../lib/learn';
  import { route } from '../../lib/router.svelte';
  import ArticleView from './ArticleView.svelte';
</script>

{#if route.topic}
  <div class="layout">
    <nav class="side" aria-label={t('allTopics')}>
      {#each GROUPS as g (g.key)}
        <p class="group">{t(`group_${g.key}` as Key)}</p>
        <ul>
          {#each g.topics as id (id)}
            <li><a href="#learn/{id}" aria-current={route.topic === id ? 'page' : undefined}>{article(i18n.lang, id).title}</a></li>
          {/each}
        </ul>
      {/each}
    </nav>
    <ArticleView id={route.topic} />
  </div>
{:else}
  <section class="hero">
    <h1>{t('learnTitle')}</h1>
    <p>{t('learnLead')}</p>
  </section>
  {#each GROUPS as g (g.key)}
    <section class="group-block">
      <h2>{t(`group_${g.key}` as Key)}</h2>
      <div class="grid">
        {#each g.topics as id (id)}
          {@const a = article(i18n.lang, id)}
          <a class="topic" href="#learn/{id}">
            <span class="title">{a.title}</span>
            <span class="lead">{a.lead}</span>
            <span class="meta">{t('minRead', { n: a.read })} ›</span>
          </a>
        {/each}
      </div>
    </section>
  {/each}
{/if}

<style>
  .hero { text-align: center; padding-block: 56px 28px; }
  .hero h1 { font-family: var(--font-display); font-size: clamp(34px, 5.5vw, 56px); font-weight: 700; letter-spacing: -0.035em; line-height: 1.07; margin: 0 0 12px; }
  .hero p { margin: 0 auto; max-width: 36ch; font-size: clamp(19px, 2.2vw, 22px); color: var(--text-2); letter-spacing: -0.02em; text-wrap: balance; }
  .group-block { margin-top: 36px; }
  .group-block h2 { font-family: var(--font-display); font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .topic {
    display: grid; gap: 6px; align-content: start; text-decoration: none; color: var(--text);
    background: var(--surface); border: 1px solid var(--card-border); border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 20px 22px; transition: transform 0.2s;
  }
  .topic:hover { transform: translateY(-2px); }
  .title { font-size: 19px; font-weight: 600; letter-spacing: -0.02em; }
  .lead { font-size: 15px; color: var(--text-2); line-height: 1.45; }
  .meta { font-size: 14px; color: var(--accent); margin-top: 6px; }

  .layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 56px; padding-top: 40px; align-items: start; }
  .side { position: sticky; top: 76px; max-height: calc(100vh - 96px); overflow-y: auto; font-size: 15px; }
  .side .group { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-3); margin: 18px 0 6px; }
  .side .group:first-child { margin-top: 0; }
  .side ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  .side a { display: block; padding: 6px 10px; border-radius: 8px; color: var(--text-2); text-decoration: none; line-height: 1.3; }
  .side a:hover { color: var(--text); background: var(--fill-2); }
  .side a[aria-current='page'] { color: var(--accent); background: var(--accent-soft); font-weight: 500; }
  @media (max-width: 900px) {
    .layout { grid-template-columns: minmax(0, 1fr); padding-top: 24px; }
    .side { display: none; }
  }
</style>
