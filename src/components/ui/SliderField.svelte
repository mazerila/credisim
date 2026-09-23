<script lang="ts">
  import { i18n } from '../../lib/i18n/index.svelte';
  import Info from './Info.svelte';

  let {
    id,
    label,
    value = $bindable(),
    min,
    max,
    step,
    unit,
    factor = 1,
    decimals = 2,
    integer = false,
    tip,
  }: {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    /** Unit shown after the typed number, e.g. "%", "years", "months". */
    unit: string;
    /** Typed number = value / factor (e.g. 12 to type years for a value in months). */
    factor?: number;
    decimals?: number;
    /** Round the stored value to a whole number (e.g. months). */
    integer?: boolean;
    tip?: string;
  } = $props();

  const pct = $derived(((value - min) / (max - min)) * 100);
  const shown = (v: number) => {
    const s = String(Math.round((v / factor) * 10 ** decimals) / 10 ** decimals);
    return i18n.lang === 'fr' ? s.replace('.', ',') : s;
  };

  let text = $state('');
  let editing = $state(false);
  $effect(() => {
    if (!editing) text = shown(value);
  });

  const toValue = (typed: number) => (integer ? Math.round(typed * factor) : typed * factor);

  function commit() {
    const v = parseFloat(text.replace(',', '.').replace(/\s/g, ''));
    if (!Number.isNaN(v)) value = Math.min(max, Math.max(min, toValue(v)));
    editing = false;
    text = shown(value);
  }
</script>

<div class="field">
  <div class="top">
    <label for={id}>{label}</label>{#if tip}<Info text={tip} />{/if}
    <div class="typed">
      <input
        id="{id}-typed"
        type="text"
        inputmode="decimal"
        aria-label="{label} ({unit})"
        bind:value={text}
        onfocus={(e) => { editing = true; (e.target as HTMLInputElement).select(); }}
        oninput={() => {
          const v = parseFloat(text.replace(',', '.'));
          if (!Number.isNaN(v) && toValue(v) >= min && toValue(v) <= max) value = toValue(v);
        }}
        onblur={commit}
        onkeydown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
      <span>{unit}</span>
    </div>
  </div>
  <input {id} type="range" {min} {max} {step} bind:value style="--p:{pct}%" />
</div>

<style>
  .field { display: grid; gap: 8px; }
  .top { display: flex; align-items: center; gap: 6px; }
  label { font-size: 14px; color: var(--text-2); letter-spacing: -0.01em; }
  .typed {
    margin-left: auto; display: flex; align-items: center; gap: 4px;
    background: var(--fill-2); border: 1px solid transparent; border-radius: 10px; padding: 0 10px 0 4px;
    transition: border-color 0.15s, background 0.15s;
  }
  .typed:focus-within { border-color: var(--accent); background: var(--surface); }
  .typed input {
    width: 4.2em; border: 0; background: none; outline: none; text-align: right;
    padding: 6px 2px; font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums;
  }
  .typed span { font-size: 15px; color: var(--text-2); }
  input[type='range'] {
    -webkit-appearance: none; appearance: none; width: 100%; height: 28px; background: none; margin: 0; cursor: pointer;
  }
  input[type='range']::-webkit-slider-runnable-track {
    height: 4px; border-radius: 2px;
    background: linear-gradient(to right, var(--accent) var(--p), var(--fill) var(--p));
  }
  input[type='range']::-moz-range-track { height: 4px; border-radius: 2px; background: var(--fill); }
  input[type='range']::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--accent); }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none; width: 26px; height: 26px; margin-top: -11px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
  }
  input[type='range']::-moz-range-thumb {
    width: 26px; height: 26px; border: 0; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }
</style>
