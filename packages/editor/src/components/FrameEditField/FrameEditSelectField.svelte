<script lang="ts">
  import { FixedValuePropTypes } from "@variomotion/core";
  import { createEventDispatcher } from "svelte";
  import NumberInput from "../Input/NumberInput.svelte";
  import Select from "../Select/Select.svelte";

  const dispatch = createEventDispatcher();
  export let type: FixedValuePropTypes | undefined;
  export let value: string | number | undefined;
  export let fixedValues: string[] | number[];

  const handleInputChange = () => {
    dispatch("newvalue", {
      value,
    });
  };
</script>

<label class="label" for={type}>{type}</label>
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
