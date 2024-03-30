import {
  MatrixTransformTypes,
  editEntry,
  editFrame,
  getActiveBreakPoints,
  getAnimationEntryById,
  getFrameById,
  getTransformValueFromDef,
  applyTransformations,
} from "@variomotion/core";
import { getDomTargetDimension, getDomTargets } from "./helper";
import {
  sendAnimationDataToEditor,
  sendDimensionsToEditor,
  sendTimelineStatesToEditor,
} from "./site";
import { DomtargetDimensions, FrameEventData } from "./types";
import {
  TransformRect,
  TransformState,
  setTransformMode,
  tearDownTransform,
  transformElement,
} from "@variomotion/transform";
import { VariomotionProject } from "@variomotion/core";

const dimensionStore: Record<string, DomtargetDimensions> = {};
let activeFrame: FrameEventData | undefined = undefined;

export function setActiveFrame(frame: FrameEventData | undefined) {
  activeFrame = frame;
}

export function getActiveFrame() {
  return activeFrame;
}

let setDomTargetDimensionsTimeout: NodeJS.Timeout | undefined = undefined;
export function setDomTargetDimensions() {
  const domTargets = getDomTargets();
  domTargets.forEach((id) => {
    dimensionStore[id] = getDomTargetDimension(id) ?? dimensionStore[id];
  });
  return new Promise<void>((resolve) => {
    setDomTargetDimensionsTimeout = setTimeout(() => {
      clearTimeout(setDomTargetDimensionsTimeout);
      resolve();
    }, 500);
  });
}

export function connectVariomotion(project: VariomotionProject) {
  project.onAnimationFrame(() => {
    sendTimelineStatesToEditor(project);
    if (!activeFrame) {
      return;
    }

    const timelineStates = project.pixelTimelineStates;
    const timelineState = timelineStates[activeFrame.timelineId];

    const frame = getFrameById(
      project.animationData,
      activeFrame.entryId,
      activeFrame.index
    );

    if (timelineState && timelineState.progress !== frame.framePositionValue) {
      setTransformMode("off");
    }
  });
}

let transformCanvasTimeout: NodeJS.Timeout | undefined;
export function transformCanvas(project: VariomotionProject) {
  transformCanvasTimeout = setTimeout(() => {
    setupTransformCanvas(project);
    clearTimeout(transformCanvasTimeout);
  }, 200);
}

export function setupTransformCanvas(project: VariomotionProject) {
  if (!activeFrame) {
    return;
  }
  const { entryId, index } = activeFrame;

  const animationData = project.animationData;
  if (!animationData) {
    return;
  }
  const activeBreakpoints = getActiveBreakPoints(animationData);
  const entry = getAnimationEntryById(animationData, entryId);
  if (!entry) {
    return;
  }
  const frame = getFrameById(animationData, entryId, index);
  const match = entry.domQueries[0].match(/"(.*)"/);
  if (!match) {
    return;
  }

  const dimensions = dimensionStore[match[1]];

  if (!dimensions) {
    return;
  }
  sendDimensionsToEditor(dimensions);
  const rotation: number = getTransformValueFromDef(
    frame,
    MatrixTransformTypes.rotate,
    activeBreakpoints[0].id,
    0
  );

  const scaleX: number = getTransformValueFromDef(
    frame,
    MatrixTransformTypes.scaleX,
    activeBreakpoints[0].id,
    100
  );

  const scaleY: number = getTransformValueFromDef(
    frame,
    MatrixTransformTypes.scaleY,
    activeBreakpoints[0].id,
    100
  );

  const startTransform: TransformRect = {
    position: {
      x: getTransformValueFromDef(
        frame,
        MatrixTransformTypes.translateX,
        activeBreakpoints[0].id,
        0
      ),
      y: getTransformValueFromDef(
        frame,
        MatrixTransformTypes.translateY,
        activeBreakpoints[0].id,
        0
      ),
    },
    rotate: rotation ? rotation : 0,
    scale: {
      x: scaleX / 100,
      y: scaleY / 100,
    },
  };
  if (!match?.input) {
    return;
  }

  transformElement(document.querySelectorAll(match.input)[0] as HTMLElement, {
    startTransform,
    origin: entry.transformOrigin ?? { x: 0, y: 0 },
    startClientRect: dimensions.clientRect,
    onMouseUp: ({ origin, transformRect }: TransformState) => {
      let animationDataUpdated = editEntry(animationData, {
        ...entry,
        transformOrigin: origin,
      });
      animationDataUpdated = editFrame(
        animationDataUpdated,
        entry.id,
        {
          ...frame,
          valueDef: {
            ...applyTransformations(
              {
                translateX: transformRect.position.x,
                translateY: transformRect.position.y,
                scaleX: transformRect.scale.x * 100,
                scaleY: transformRect.scale.y * 100,
                rotate: transformRect.rotate,
              },
              frame.valueDef,
              activeFrame?.breakpoint
            ),
          },
        },
        index
      );
      project.updateAnimationData(animationDataUpdated);

      sendAnimationDataToEditor(project);
      if (activeFrame) {
        tearDownTransform();
        setupTransformCanvas(project);
      }
    },
  });
}
