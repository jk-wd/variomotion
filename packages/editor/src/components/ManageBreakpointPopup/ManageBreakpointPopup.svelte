<script lang="ts">
  import { addBreakpoint, deleteBreakpoint } from "@variomotion/core";
  import { animationData } from "../../stores/animation-data-store";
  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";
  import Icon from "@iconify/svelte";
  import BreakpointDot from "../BreakpointDot/BreakpointDot.svelte";

  let id = "";
  let definition = "";

  function handleFormSubmit() {
    $animationData = addBreakpoint($animationData, {
      id,
      definition,
    });
  }

  let breakpointPositionMap: number[] = ($animationData.breakpoints ?? []).map(
    (breakpoint: any, i: number) => {
      return i;
    }
  );

  let preventAnimation = false;
  let updateBreakPoint: NodeJS.Timeout | null = null;

  function moveBreakpoint(i: number, index: number, up = false) {
    if (updateBreakPoint) {
      clearTimeout(updateBreakPoint);
    }
    const moveDirection = up ? -1 : 1;

    const replaceI = breakpointPositionMap.findIndex((item) => {
      return item === index + moveDirection;
    });

    if (replaceI || replaceI === 0) {
      breakpointPositionMap[i] = breakpointPositionMap[replaceI];
      breakpointPositionMap[replaceI] = index;
    }
    updateBreakPoint = setTimeout(() => {
      const breakpoints = [...($animationData.breakpoints ?? [])];
      breakpointPositionMap.forEach((index, i) => {
        breakpoints[i] = ($animationData.breakpoints ?? [])[index];
      });

      $animationData.breakpoints = breakpoints;
      preventAnimation = true;
      breakpointPositionMap = ($animationData.breakpoints ?? []).map(
        (item, i) => {
          return i;
        }
      );
      setTimeout(() => {
        preventAnimation = false;
      }, 10);
    }, 400);
  }
  animationData.subscribe((animationData) => {
    breakpointPositionMap = (animationData.breakpoints ?? []).map(
      (breakpoint, i) => {
        return i;
      }
    );
  });


</script>

<Popup>
  <div class="content">
    <h2>Manage breakpoints</h2>
    <div
      style={`height: ${breakpointPositionMap.length * 28}px`}
      class="breakpoint-items"
    >
      {#each breakpointPositionMap || [] as index, i}
        <div
          style={`top: ${index * 28}px`}
          class={`${preventAnimation ? "no-animation" : ""} breakpoint-item`}
        >
          <span class="breakpoint-item-title">
            {index + 1}:
            {$animationData.breakpoints[i].id}
            {$animationData.breakpoints[i].definition}
            <BreakpointDot
              breakpointColor={$animationData.breakpoints[i].color}
            />
          </span>
          <Button
            disabled={index === 0}
            on:click={() => {
              moveBreakpoint(i, index, true);
            }}
            background="orange"
            variant="tiny"
            on:click={() => {}}>move up</Button
          >
          <Button
            disabled={index === $animationData.breakpoints.length - 1}
            on:click={() => {
              moveBreakpoint(i, index);
            }}
            background="orange"
            variant="tiny"
            on:click={() => {}}>move down</Button
          >
          <button
            class="delete-icon-button"
            on:click={() => {
              $animationData = deleteBreakpoint(
                $animationData,
                $animationData.breakpoints[i].id
              );
            }}
          >
            <Icon
              style="width: 20px; height: 20px;"
              color="#ff0000"
              icon="material-symbols-light:delete-outline"
            />
          </button>
        </div>
      {/each}
    </div>
    <form on:submit|preventDefault={handleFormSubmit}>
      <input type="text" placeholder="Name" name="id" bind:value={id} />

      <input
        type="text"
        placeholder="Example: (max-width: 1900px)"
        name="definition"
        bind:value={definition}
      />

      <div class="button-container">
        <Button type="submit">Add breakpoints</Button>
      </div>
    </form>
  </div>
</Popup>

<style>
  .content {
    width: 450px;
  }
  .button-container {
    padding-top: 22px;
  }
  .breakpoint-items {
    position: relative;
    margin-bottom: 20px;
  }
  .breakpoint-item.no-animation {
    transition: none;
  }
  .delete-icon-button {
    position: relative;
    top: 8px;
  }
  .breakpoint-item {
    position: absolute;
    transition: top 0.4s ease-in-out;
    top: 0;
  }
  .breakpoint-item-title {
    display: inline-block;
    width: 270px;
  }
</style>
