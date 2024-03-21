<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Select from "../Select/Select.svelte";

  const dispatch = createEventDispatcher();
  export let label: string | undefined;
  export let value: string | number | undefined;
  export let fixedValues: string[] | number[];

  const handleInputChange = () => {
    dispatch("newvalue", {
      value,
    });
  };
</script>

{#if label}
  <label class="label" for={label}>{label}</label>
{/if}
<div class="fields">
  <div class="select-wrapper">
    <Select bind:value on:change={handleInputChange}>
      <option value={undefined}></option>
      {#each fixedValues as fixedValue}
        <option value={fixedValue}>{fixedValue}</option>
      {/each}
    </Select>
  </div>
</div>

<style>
  .fields {
    overflow: hidden;
    display: flex;
    height: 20px;
  }

  .label {
    font-size: 12px;
  }
  .select-wrapper {
    padding: 0 2px;
    width: 120px;
  }
</style>
