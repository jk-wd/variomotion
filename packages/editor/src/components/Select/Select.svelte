<script lang="ts">
  export let value: string | number | undefined;
</script>

<select bind:value on:input on:change {...$$restProps}>
  <slot />
</select>

<style>
  select {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    height: 20px;
  }
</style>
