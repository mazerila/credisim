<script lang="ts">
  import type { Result } from '../lib/engine';
  import { deleteSaved, download, listSaved, saveSimulation, scheduleCsv, type Saved } from '../lib/export';
  import { i18n, t } from '../lib/i18n/index.svelte';
  import { loadHash, toHash } from '../lib/state.svelte';
  import { track } from '../lib/analytics';

  let { r }: { r: Result } = $props();
  let naming = $state(false);
  let name = $state('');
  let showList = $state(false);
  let saved = $state<Saved[]>(listSaved());
  let toast = $state('');
  let timer: ReturnType<typeof setTimeout>;

  function say(msg: string) {
    toast = msg;
    clearTimeout(timer);
    timer = setTimeout(() => (toast = ''), 2600);
  }
  async function save() {
    saved = saveSimulation(name, await toHash());
    track('simulation_saved');
    naming = false;
    name = '';
    say(t('savedToast'));
  }
  async function open(s: Saved) {
    track('simulation_opened', { from: 'saved' });
    await loadHash('#' + s.hash);
    showList = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function csv() {
    const head = [t('colMonthCsv'), t('colPayment'), t('colInterest'), t('colCapital'), t('colInsurance'), t('colPtz'), t('colBalance')];
    track('schedule_exported', { format: 'csv' });
    const ok = download(`credisim-${new Date().toISOString().slice(0, 10)}.csv`, scheduleCsv(r, i18n.lang, head));
    say(ok ? t('csvDone') : t('csvBlocked'));
  }
  const date = (iso: string) => new Date(iso).toLocaleDateString(i18n.lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<div class="bar no-print">
  <button type="button" onclick={() => { naming = !naming; showList = false; }}>
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>
    {t('actSave')}
  </button>
  <button type="button" onclick={() => { showList = !showList; naming = false; saved = listSaved(); }} aria-expanded={showList}>
    {t('actSaved')}{#if saved.length} <span class="count">{saved.length}</span>{/if}
  </button>
  <span class="spacer"></span>
  <button type="button" onclick={() => { track('report_printed'); window.print(); }}>
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>
    {t('actPrint')}
  </button>
  <button type="button" onclick={csv}>
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
    {t('actCsv')}
  </button>
</div>

{#if naming}
  <form class="panel no-print" onsubmit={(e) => { e.preventDefault(); save(); }}>
    <label for="save-name">{t('saveName')}</label>
    <div class="row">
      <input id="save-name" type="text" bind:value={name} placeholder={t('saveNamePh')} maxlength="80" />
      <button type="submit" class="primary">{t('saveConfirm')}</button>
      <button type="button" onclick={() => (naming = false)}>{t('saveCancel')}</button>
    </div>
  </form>
{/if}

{#if showList}
  <div class="panel no-print">
    {#if saved.length}
      <ul>
        {#each saved as s (s.id)}
          <li>
            <div><b>{s.name}</b><span class="muted small">{date(s.at)}</span></div>
            <button type="button" class="link-btn" onclick={() => open(s)}>{t('savedOpen')}</button>
            <button type="button" class="link-btn del" onclick={() => (saved = deleteSaved(s.id))}>{t('savedDelete')}</button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="muted small">{t('savedEmpty')}</p>
    {/if}
  </div>
{/if}

{#if toast}<div class="toast" role="status">{toast}</div>{/if}

<style>
  .bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .spacer { flex: 1; }
  .bar button, .row button {
    display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--sep); background: var(--surface); color: var(--text);
    border-radius: 999px; padding: 6px 14px; font-size: 14px; font-weight: 500;
  }
  .bar button:hover, .row button:hover { border-color: var(--accent); color: var(--accent); }
  .count { background: var(--accent); color: var(--on-accent); border-radius: 999px; font-size: 11px; padding: 0 6px; font-weight: 600; }
  .panel { background: var(--surface); border: 1px solid var(--card-border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px 18px; display: grid; gap: 8px; }
  .panel label { font-size: 14px; color: var(--text-2); }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  .row input { flex: 1; min-width: 180px; border: 1px solid transparent; background: var(--fill-2); border-radius: 10px; padding: 9px 12px; font-size: 16px; outline: none; }
  .row input:focus { border-color: var(--accent); }
  .row .primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  .row .primary:hover { color: var(--on-accent); background: var(--accent-hover); }
  ul { list-style: none; margin: 0; padding: 0; display: grid; }
  li { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--sep); }
  li:last-child { border-bottom: 0; }
  li div { flex: 1; display: grid; min-width: 0; }
  li b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .del { color: var(--bad); }
  p { margin: 0; }
  .toast {
    position: fixed; left: 50%; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 40;
    background: var(--text); color: var(--bg); padding: 10px 18px; border-radius: 999px; font-size: 15px; font-weight: 500; max-width: 90vw; text-align: center;
  }
</style>
