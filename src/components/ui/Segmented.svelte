<script lang="ts" generics="T extends string">
  let {
    options,
    value = $bindable(),
    label,
    size = 'md',
    onchange,
  }: {
    options: { value: T; label: string }[];
    value: T;
    label: string;
    size?: 'sm' | 'md';
    onchange?: (v: T) => void;
  } = $props();

  function pick(v: T) {
    value = v;
    onchange?.(v);
  }
</script>

<div class="seg {size}" role="radiogroup" aria-label={label}>
  {#each options as o (o.value)}
    <button type="button" role="radio" aria-checked={value === o.value} onclick={() => pick(o.value)}>{o.label}</button>
  {/each}
</div>

<style>
  .seg {
    display: inline-flex; padding: 2px; gap: 2px; border-radius: 9px; background: var(--fill);
    max-width: 100%; overflow-x: auto; scrollbar-width: none;
  }
  .seg button {
    flex: 1 0 auto; border: 0; background: none; color: var(--text); border-radius: 7px;
    padding: 5px 14px; font-size: 14px; font-weight: 500; white-space: nowrap;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .seg.sm button { padding: 3px 10px; font-size: 13px; }
  .seg button[aria-checked='true'] { background: var(--surface); box-shadow: var(--shadow-chip); font-weight: 600; }
  :global(:root[data-theme='dark']) .seg button[aria-checked='true'] { background: #5a5d68; }
  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme='light'])) .seg button[aria-checked='true'] { background: #5a5d68; }
  }
</style>
