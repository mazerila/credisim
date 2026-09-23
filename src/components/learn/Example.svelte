<script lang="ts">
  import type { ExampleId } from '../../lib/learn';
  import ExAmortization from './examples/ExAmortization.svelte';
  import ExDebt from './examples/ExDebt.svelte';
  import ExDurations from './examples/ExDurations.svelte';
  import ExInsurance from './examples/ExInsurance.svelte';
  import ExNotary from './examples/ExNotary.svelte';
  import ExPayment from './examples/ExPayment.svelte';
  import ExPtz from './examples/ExPtz.svelte';
  import ExTaeg from './examples/ExTaeg.svelte';
  import ExUsury from './examples/ExUsury.svelte';

  let { id }: { id: ExampleId } = $props();
  const MAP = {
    payment: ExPayment, amortization: ExAmortization, taeg: ExTaeg, insurance: ExInsurance, notary: ExNotary,
    debt: ExDebt, usury: ExUsury, ptz: ExPtz, durations: ExDurations,
  };
  const Comp = $derived(MAP[id]);
</script>

<figure class="example"><Comp /></figure>

<style>
  .example {
    margin: 8px 0; padding: 20px 22px; border-radius: var(--radius);
    background: var(--fill-2); border: 1px solid var(--card-border);
  }
  @media (max-width: 600px) { .example { padding: 16px; margin-inline: -4px; } }
</style>
