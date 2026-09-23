<script lang="ts" generics="T extends string">
  import Info from './Info.svelte';

  let {
    id,
    label,
    value = $bindable(),
    options,
    tip,
  }: { id: string; label: string; value: T; options: { value: T; label: string }[]; tip?: string } = $props();
</script>

<div class="field">
  <div class="lab"><label for={id}>{label}</label>{#if tip}<Info text={tip} />{/if}</div>
  <div class="box">
    <select {id} bind:value>
      {#each options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
    </select>
  </div>
</div>

<style>
  .field { display: grid; gap: 6px; min-width: 0; }
  .lab { display: flex; align-items: center; gap: 6px; }
  label { font-size: 14px; color: var(--text-2); letter-spacing: -0.01em; }
  .box { position: relative; background: var(--fill-2); border-radius: var(--radius-sm); border: 1px solid transparent; }
  .box:focus-within { border-color: var(--accent); }
  .box::after {
    content: ''; position: absolute; right: 14px; top: 50%; width: 7px; height: 7px; margin-top: -5px;
    border-right: 2px solid var(--text-3); border-bottom: 2px solid var(--text-3); transform: rotate(45deg); pointer-events: none;
  }
  select {
    -webkit-appearance: none; appearance: none; width: 100%; border: 0; background: none; outline: none;
    padding: 11px 36px 11px 12px; font-size: 16px; font-weight: 500; text-overflow: ellipsis;
  }
</style>
