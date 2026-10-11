<script lang="ts">
  import {
    account, createAccount, deleteAccount, errorKey, resetPassword, signInEmail, signInGoogle, signOut, warmUp,
  } from '../lib/account.svelte';
  import { t, type Key } from '../lib/i18n/index.svelte';

  let { onclose }: { onclose: () => void } = $props();
  let mode = $state<'login' | 'create'>('login');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error = $state('');
  let info = $state('');
  let confirmDelete = $state(false);
  let deletePw = $state('');
  let root: HTMLDivElement;

  warmUp();

  async function run(fn: () => Promise<unknown>, done?: () => void) {
    busy = true;
    error = '';
    info = '';
    try {
      await fn();
      done?.();
    } catch (e) {
      const k = errorKey(e);
      error = k ? t(k as Key) : '';
    } finally {
      busy = false;
    }
  }
  const submit = () => run(() => (mode === 'login' ? signInEmail(email, password) : createAccount(email, password)), () => (password = ''));
  const forgot = () => run(() => resetPassword(email), () => (info = t('accResetSent')));
  const remove = () => run(() => deleteAccount(deletePw), () => { confirmDelete = false; deletePw = ''; info = t('accDeleted'); });
</script>

<svelte:document
  onclick={(e) => root && !root.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('.account-btn') && onclose()}
  onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="panel" bind:this={root} role="dialog" aria-label={t('accTitle')}>
  <p class="title">{t('accTitle')}</p>

  {#if !account.ready}
    <p class="muted small">{t('accLoading')}</p>
  {:else if account.user}
    <p class="small">{t('accSignedAs', { e: account.user.email || account.user.name })}</p>
    {#if !confirmDelete}
      <div class="row">
        <button type="button" class="secondary" disabled={busy} onclick={() => run(signOut)}>{t('accSignOut')}</button>
        <button type="button" class="link-btn del" onclick={() => { confirmDelete = true; error = ''; }}>{t('accDelete')}</button>
      </div>
    {:else}
      <form class="confirm" onsubmit={(e) => { e.preventDefault(); remove(); }}>
        <p class="small">{t('accDeleteConfirm')}</p>
        {#if account.user.provider === 'password'}
          <input type="password" bind:value={deletePw} placeholder={t('accDeletePw')} aria-label={t('accDeletePw')} autocomplete="current-password" required />
        {/if}
        <div class="row">
          <button type="submit" class="danger" disabled={busy}>{t('accDeleteYes')}</button>
          <button type="button" class="secondary" onclick={() => (confirmDelete = false)}>{t('saveCancel')}</button>
        </div>
      </form>
    {/if}
  {:else}
    <p class="muted small">{t('accOptional')}</p>
    <button type="button" class="google" disabled={busy} onclick={() => run(signInGoogle)}>
      <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      {t('accGoogle')}
    </button>
    <div class="or"><span>{t('accOr')}</span></div>
    <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <input type="email" bind:value={email} placeholder={t('accEmail')} aria-label={t('accEmail')} autocomplete="email" required />
      <input type="password" bind:value={password} placeholder={mode === 'create' ? t('accPasswordNew') : t('accPassword')} aria-label={t('accPassword')}
        autocomplete={mode === 'create' ? 'new-password' : 'current-password'} minlength="6" required />
      <button type="submit" class="primary" disabled={busy}>{mode === 'login' ? t('accLogin') : t('accCreate')}</button>
    </form>
    <div class="row between small">
      {#if mode === 'login'}
        <span class="muted">{t('accHaveNone')} <button type="button" class="link-btn" onclick={() => { mode = 'create'; error = ''; }}>{t('accCreate')}</button></span>
        <button type="button" class="link-btn" disabled={busy} onclick={() => (email ? forgot() : (error = t('accErrEmail')))}>{t('accForgot')}</button>
      {:else}
        <span class="muted">{t('accHaveOne')} <button type="button" class="link-btn" onclick={() => { mode = 'login'; error = ''; }}>{t('accLogin')}</button></span>
      {/if}
    </div>
    <p class="muted tiny">{t('accPrivacy')}</p>
  {/if}

  {#if error}<p class="msg bad small" role="alert">{error}</p>{/if}
  {#if info}<p class="msg small" role="status">{info}</p>{/if}
</div>

<style>
  .panel {
    position: absolute; right: 0; top: calc(100% + 8px); z-index: 30; width: min(360px, calc(100vw - 32px));
    background: var(--surface); color: var(--text); border: 1px solid var(--sep); border-radius: var(--radius);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); padding: 16px; display: grid; gap: 10px;
  }
  @media (max-width: 560px) { .panel { position: fixed; left: 16px; right: 16px; width: auto; top: calc(env(safe-area-inset-top, 0px) + 54px); } }
  .title { margin: 0; font-weight: 600; font-size: 16px; }
  p { margin: 0; line-height: 1.45; }
  .tiny { font-size: 12px; }
  form { display: grid; gap: 8px; }
  input { min-width: 0; border: 1px solid transparent; background: var(--fill-2); color: var(--text); border-radius: 10px; padding: 9px 12px; font-size: 16px; font-family: inherit; outline: none; }
  input:focus { border-color: var(--accent); }
  button { font-family: inherit; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .between { justify-content: space-between; }
  .primary, .secondary, .danger, .google {
    border-radius: 999px; padding: 9px 16px; font-size: 14px; font-weight: 500; white-space: nowrap; cursor: pointer;
  }
  .primary { border: 0; background: var(--accent); color: var(--on-accent); }
  .primary:hover { background: var(--accent-hover); }
  .secondary { border: 1px solid var(--sep); background: var(--surface); color: var(--text); }
  .secondary:hover { border-color: var(--accent); color: var(--accent); }
  .danger { border: 0; background: var(--bad); color: #fff; }
  .google { display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid var(--sep); background: var(--surface); color: var(--text); }
  .google:hover { border-color: var(--accent); }
  button:disabled { opacity: 0.6; cursor: default; }
  .or { display: flex; align-items: center; gap: 10px; color: var(--text-2); font-size: 13px; }
  .or::before, .or::after { content: ''; flex: 1; height: 1px; background: var(--sep); }
  .del { color: var(--bad); margin-left: auto; }
  .confirm { display: grid; gap: 8px; }
  .msg { color: var(--text-2); }
  .bad { color: var(--bad); }
</style>
