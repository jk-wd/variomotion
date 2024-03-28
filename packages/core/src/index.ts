import {
  init,
  getOptions,
  play,
  pause,
  updateAnimationData,
  getAnimationData,
  getTimelineStates,
  getPixelTimelineStates,
  onUpdateAnimationData,
  setOnAnimationFrameCallback,
  getWrapper,
  blockStylingElements,
  unBlockStylingElements,
  getValueStore,
  setValueStore,
} from "./core";

export * from "./units-map";
export * from "./easing-functions";
export * from "./utils";
export * from "./types-interfaces";
export * from "./data/breakpoints";
export * from "./data/timeline";
export * from "./data/entry";
export * from "./data/frame";
export * from "./helpers/frame";
export * from "./helpers/animationProps";

//API
export default {
  init,
  getWrapper,
  getOptions,
  play,
  pause,
  updateAnimationData,
  getAnimationData,
  getPixelTimelineStates,
  getTimelineStates,
  onUpdateAnimationData,
  onAnimationFrame: setOnAnimationFrameCallback,
  blockStylingElements,
  unBlockStylingElements,
  getValueStore,
  setValueStore,
};
