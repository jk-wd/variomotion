<script lang="ts">
  export let type: "button" | "submit" = "button";
  export let variant: "tiny" | "small" | "normal" = "normal";
  export let background: "green" | "orange" | "blue" = "blue";
  export let disabled: boolean = false;
</script>

<button
  {disabled}
  style={`background-color: var(--color-${background})`}
  class={`button ${variant}`}
  {type}
  on:click><slot /></button
>

<style>
  .button {
    background: #fff;
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-family: "ProximaNova-Regular";
    color: var(--color-white);
  }
  .button:disabled,
  .button[disabled] {
    background-color: var(--color-grey-2) !important;
  }

  .button.small {
    padding: 4px 8px;
    font-family: "ProximaNova-Bold";
    font-size: 14px;
  }
  .button.tiny {
    padding: 2px 6px;
    font-family: "ProximaNova-Regular";
    font-size: 12px;
  }
</style>
