<script lang="ts">
  import type { Snippet } from 'svelte';
  import Info from './Info.svelte';

  let {
    id,
    checked = $bindable(),
    label,
    tip,
    children,
  }: { id: string; checked: boolean; label: string; tip?: string; children?: Snippet } = $props();
</script>

<div class="row" class:on={checked}>
  <div class="head">
    <label for={id}>{label}</label>
    {#if tip}<Info text={tip} />{/if}
    <input {id} type="checkbox" role="switch" bind:checked />
  </div>
  {#if checked && children}
    <div class="body">{@render children()}</div>
  {/if}
</div>

<style>
  .row { padding: 12px 0; border-top: 1px solid var(--sep); }
  .row:first-child { border-top: 0; padding-top: 4px; }
  .head { display: flex; align-items: center; gap: 8px; }
  label { font-size: 16px; font-weight: 500; flex: 0 1 auto; cursor: pointer; }
  input {
    appearance: none; margin: 0 0 0 auto; flex: none;
    width: 44px; height: 26px; border-radius: 13px; background: var(--fill);
    position: relative; cursor: pointer; transition: background 0.2s;
  }
  input::after {
    content: ''; position: absolute; top: 2px; left: 2px; width: 22px; height: 22px; border-radius: 50%;
    background: #fff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); transition: transform 0.2s;
  }
  input:checked { background: var(--c-notary); }
  input:checked::after { transform: translateX(18px); }
  input:focus-visible { outline: 3px solid var(--accent-soft); outline-offset: 2px; }
  .body { display: grid; gap: 12px; padding-top: 12px; }
</style>
