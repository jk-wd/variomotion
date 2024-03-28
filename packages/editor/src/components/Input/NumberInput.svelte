<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let value: number | undefined = undefined;
  export let disabled: boolean = false;

  function isNumeric(value: string | number | undefined) {
    if (typeof value != "string") return false;
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  const dispatch = createEventDispatcher();
  const handleInputChange = (event: any) => {
    let valueString = event.target.value;
    if (isNumeric(valueString)) {
      value = parseFloat(valueString);
    }

    if (valueString === "") {
      value = undefined;
    }
    dispatch("input", { value });
  };
</script>

<input
  class="input"
  type="string"
  {disabled}
  value={value?.toString() || ""}
  on:input={handleInputChange}
  {...$$restProps}
/>

<style>
  .input {
    font-size: 8px;
    padding: 0;
    margin: 0;
    height: 20px;
    font-size: 14px;
    border-radius: 0;
    border: none;
    outline: none;
    font-family: "ProximaNova-Regular";
    background-color: rgba(0, 0, 0, 0);
  }
</style>
