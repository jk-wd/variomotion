import {
  MatrixTransformTypes,
  editEntry,
  editFrame,
  getActiveBreakPoint,
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
import { DomtargetDimensions, FrameEventData, VariomotionLib } from "./types";
import {
  TransformRect,
  TransformState,
  setTransformMode,
  tearDownTransform,
  transformElementOnAnimationFrame,
} from "@variomotion/transform";

const dimensionStore: Record<string, DomtargetDimensions> = {};
let activeFrame: FrameEventData | undefined = undefined;

export function setActiveFrame(frame: FrameEventData | undefined) {
  activeFrame = frame;
}

export function getActiveFrame() {
  return activeFrame;
}

export function setDomTargetDimensions() {
  const domTargets = getDomTargets();
  domTargets.forEach((id) => {
    dimensionStore[id] = getDomTargetDimension(id) ?? dimensionStore[id];
  });
}

export function connectVariomotion(variomotion: VariomotionLib) {
  variomotion.onAnimationFrame(() => {
    sendTimelineStatesToEditor(variomotion);
    if (!activeFrame) {
      return;
    }

    const timelineStates = variomotion.getPixelTimelineStates();
    const timelineState = timelineStates[activeFrame.timelineId];
    const frame = getFrameById(
      activeFrame.animationData,
      activeFrame.entryId,
      activeFrame.index
    );

    if (timelineState && timelineState.progress !== frame.framePositionValue) {
      setTransformMode("off");
    }
  });
}

export function setupTransformCanvas(variomotion: VariomotionLib) {
  if (!activeFrame) {
    return;
  }
  const { entryId, index } = activeFrame;

  const animationData = activeFrame.animationData;
  variomotion.updateAnimationData(animationData);

  const activeBreakpoint = getActiveBreakPoint(animationData)?.id;
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
    activeBreakpoint,
    0
  );

  const scaleX: number = getTransformValueFromDef(
    frame,
    MatrixTransformTypes.scaleX,
    activeBreakpoint,
    100
  );

  const scaleY: number = getTransformValueFromDef(
    frame,
    MatrixTransformTypes.scaleY,
    activeBreakpoint,
    100
  );

  const startTransform: TransformRect = {
    position: {
      x: getTransformValueFromDef(
        frame,
        MatrixTransformTypes.translateX,
        activeBreakpoint,
        0
      ),
      y: getTransformValueFromDef(
        frame,
        MatrixTransformTypes.translateY,
        activeBreakpoint,
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

  transformElementOnAnimationFrame(
    document.querySelectorAll(match.input)[0] as HTMLElement,
    {
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
        variomotion.updateAnimationData(animationDataUpdated);

        sendAnimationDataToEditor(variomotion);
        if (activeFrame) {
          activeFrame.animationData = animationDataUpdated;
          tearDownTransform();
          setupTransformCanvas(variomotion);
        }
      },
    }
  );
}
