<script lang="ts">
  import Info from './Info.svelte';

  let {
    id,
    label,
    value = $bindable(),
    unit = '€',
    step = 1,
    min = 0,
    max,
    tip,
  }: { id: string; label: string; value: number; unit?: string; step?: number; min?: number; max?: number; tip?: string } = $props();

  function onInput(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value.replace(',', '.'));
    if (!Number.isNaN(v)) value = max !== undefined ? Math.min(max, Math.max(min, v)) : Math.max(min, v);
  }
</script>

<div class="field">
  <div class="lab"><label for={id}>{label}</label>{#if tip}<Info text={tip} />{/if}</div>
  <div class="box">
    <input {id} type="number" inputmode="decimal" {step} {min} {max} {value} oninput={onInput} />
    {#if unit}<span class="unit">{unit}</span>{/if}
  </div>
</div>

<style>
  .field { display: grid; gap: 6px; min-width: 0; }
  .lab { display: flex; align-items: center; gap: 6px; }
  label { font-size: 14px; color: var(--text-2); letter-spacing: -0.01em; }
  .box {
    display: flex; align-items: center; min-width: 0;
    background: var(--fill-2); border: 1px solid transparent; border-radius: var(--radius-sm);
    transition: border-color 0.15s, background 0.15s;
  }
  .box:focus-within { border-color: var(--accent); background: var(--surface); }
  input {
    flex: 1; min-width: 0; width: 100%; border: 0; background: none; outline: none;
    padding: 11px 12px; font-size: 17px; font-weight: 500; font-variant-numeric: tabular-nums;
  }
  input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
  .unit { padding-right: 12px; color: var(--text-3); font-size: 15px; }
</style>
