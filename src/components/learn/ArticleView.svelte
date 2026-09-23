<script lang="ts">
  import { i18n, t } from '../../lib/i18n/index.svelte';
  import { article, inline, TOPICS, type TopicId } from '../../lib/learn';
  import { goLearn } from '../../lib/router.svelte';
  import Example from './Example.svelte';

  let { id }: { id: TopicId } = $props();
  const a = $derived(article(i18n.lang, id));
  const idx = $derived(TOPICS.indexOf(id));
  const prev = $derived(idx > 0 ? TOPICS[idx - 1] : null);
  const next = $derived(idx < TOPICS.length - 1 ? TOPICS[idx + 1] : null);
</script>

<article>
  <button type="button" class="link-btn back" onclick={() => goLearn()}>‹ {t('allTopics')}</button>
  <h1>{a.title}</h1>
  <p class="lead">{a.lead}</p>
  <p class="meta">{t('minRead', { n: a.read })}</p>

  <div class="body">
    {#each a.blocks as b, i (i)}
      {#if 'h' in b}<h2>{b.h}</h2>
      {:else if 'p' in b}<p>{@html inline(b.p)}</p>
      {:else if 'list' in b}<ul>{#each b.list as li, j (j)}<li>{@html inline(li)}</li>{/each}</ul>
      {:else if 'steps' in b}<ol>{#each b.steps as li, j (j)}<li>{@html inline(li)}</li>{/each}</ol>
      {:else if 'note' in b}<aside class="note">{@html inline(b.note)}</aside>
      {:else if 'example' in b}<Example id={b.example} />
      {:else if 'table' in b}
        <div class="scroll"><table class="tbl">
          <thead><tr>{#each b.table.head as h, j (j)}<th>{h}</th>{/each}</tr></thead>
          <tbody>{#each b.table.rows as row, j (j)}<tr>{#each row as c, k (k)}<td>{@html inline(c)}</td>{/each}</tr>{/each}</tbody>
        </table></div>
      {:else if 'terms' in b}
        <dl class="terms">
          {#each b.terms as term (term.term)}
            <div>
              <dt>{term.term}</dt>
              <dd>{@html inline(term.def)}{#if term.link && term.link !== id} <a href="#learn/{term.link}" class="more">{t('learnMore')} ›</a>{/if}</dd>
            </div>
          {/each}
        </dl>
      {/if}
    {/each}
  </div>

  <a class="cta" href="#sim">{t('trySim')} ›</a>

  <nav class="pager" aria-label="{t('prev')} / {t('next')}">
    {#if prev}<a href="#learn/{prev}" class="prev"><span>{t('prev')}</span>{article(i18n.lang, prev).title}</a>{:else}<span></span>{/if}
    {#if next}<a href="#learn/{next}" class="next"><span>{t('next')}</span>{article(i18n.lang, next).title}</a>{/if}
  </nav>
</article>

<style>
  article { max-width: 700px; min-width: 0; }
  .back { font-size: 15px; margin-bottom: 18px; }
  h1 { font-family: var(--font-display); font-size: clamp(32px, 4.5vw, 44px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 14px; text-wrap: balance; }
  .lead { font-size: 21px; line-height: 1.45; color: var(--text-2); margin: 0 0 8px; letter-spacing: -0.02em; }
  .meta { font-size: 14px; color: var(--text-3); margin: 0 0 32px; }
  .body { display: grid; gap: 16px; font-size: 17px; line-height: 1.6; }
  .body p, .body ul, .body ol { margin: 0; }
  .body ul, .body ol { padding-left: 22px; display: grid; gap: 8px; }
  h2 { font-family: var(--font-display); font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin: 18px 0 0; }
  .body :global(a) { color: var(--accent); text-decoration: none; }
  .body :global(a:hover) { text-decoration: underline; }
  .body :global(strong) { font-weight: 600; }
  .note { background: var(--accent-soft); border-radius: var(--radius-sm); padding: 14px 18px; font-size: 16px; line-height: 1.5; }
  .scroll { overflow-x: auto; }
  .tbl th, .tbl td { text-align: left; vertical-align: top; padding: 10px 14px 10px 0; border-bottom: 1px solid var(--sep); font-size: 15px; line-height: 1.45; }
  .tbl th { font-size: 13px; color: var(--text-2); font-weight: 600; }
  .tbl td:first-child { font-weight: 600; min-width: 140px; }
  .terms { margin: 0; display: grid; }
  .terms div { padding: 14px 0; border-bottom: 1px solid var(--sep); }
  .terms div:first-child { padding-top: 0; }
  dt { font-weight: 600; margin-bottom: 2px; }
  dd { margin: 0; color: var(--text-2); }
  .more { font-size: 15px; white-space: nowrap; }
  .cta {
    display: inline-block; margin-top: 36px; background: var(--accent); color: var(--on-accent); text-decoration: none;
    border-radius: 999px; padding: 12px 22px; font-size: 17px; font-weight: 500;
  }
  .cta:hover { background: var(--accent-hover); }
  .pager { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--sep); }
  .pager a { display: grid; gap: 2px; text-decoration: none; color: var(--accent); font-size: 17px; font-weight: 500; }
  .pager a span { font-size: 13px; color: var(--text-2); font-weight: 400; }
  .pager .next { text-align: right; }
</style>
