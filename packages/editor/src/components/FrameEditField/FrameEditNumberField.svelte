<script lang="ts">
  import {
    unitMap,
    type Units,
    type NumberValuePropTypes,
    easingFunctions,
  } from "@variomotion/core";
  import { createEventDispatcher } from "svelte";
  import NumberInput from "../Input/NumberInput.svelte";
  import Select from "../Select/Select.svelte";

  const dispatch = createEventDispatcher();
  export let type: NumberValuePropTypes;
  export let breakpoint: string = "none";
  export let easing: keyof typeof easingFunctions | undefined = undefined;

  export let value: number | string | undefined = undefined;
  export let unit: Units | undefined = undefined;

  const handleInputChange = () => {
    if (!unit || (!value && value !== 0)) {
      return;
    }

    dispatch("newvalue", {
      value,
      unit,
      easing,
      breakpoint,
    });
  };
</script>

<label class="label" for={type}>{type}</label>
<div class="fields">
  {#if type && unitMap[type]}
    <NumberInput
      type="text"
      name={type}
      bind:value
      on:input={handleInputChange}
    />

    <div class="select-wrapper select-wrapper-unit">
      <Select bind:value={unit} on:change={handleInputChange}>
        {#each unitMap[type] as unitValue (unitValue)}
          <option value={unitValue}>{unitValue}</option>
        {/each}
      </Select>
    </div>
    <div class="select-wrapper">
      <Select bind:value={easing} on:change={handleInputChange}>
        {#each Object.keys(easingFunctions) as easingValue (easingValue)}
          <option value={easingValue}>{easingValue}</option>
        {/each}
      </Select>
    </div>
  {/if}
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
  .select-wrapper-unit {
    width: 80px;
  }
</style>
