import {
  Point,
  TransformOptions,
  Mode,
  TransformRect,
  Dimension,
  PointBoolean,
} from "./types";
import {
  getMousePosition,
  addPoints,
  devidetPoints,
  roundPoint,
  rotatePoint,
  positionDomElement,
  getSVGScaleFactor,
  getinitialRotation,
} from "./helper";

export * from "./types";

let animationFrame: number;
let tearDown: () => void = () => {};
const defaultOptions: TransformOptions = {
  startClientRect: undefined,
  startTransform: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotate: 0,
  },
  origin: { x: 0, y: 0 },
  onMouseUp: () => {},
};
const transformStore: Record<
  string,
  {
    clientRect: DOMRect;
    transformRect: TransformRect;
  }
> = {};
let identifierCounter = 0;

let targetMode: Mode = "off";
let translatePointBoolean: PointBoolean = {
  x: true,
  y: true,
};
let scaleProportianally: boolean = true;

export function tearDownTransform() {
  tearDown();
}

export function setTransformMode(mode: Mode) {
  targetMode = mode;
}

export function setTranslateBoolean(translateBoolean: PointBoolean) {
  translatePointBoolean = translateBoolean;
}

export function setScaleProportianally(proportianally: boolean) {
  scaleProportianally = proportianally;
}

export function transformElementOnAnimationFrame(
  target: HTMLElement | SVGGraphicsElement,
  optionsParam: TransformOptions
) {
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(() => {
    cancelAnimationFrame(animationFrame);
    transformElement(target, optionsParam);
  });
}

function prepareTransformStore(
  target: HTMLElement | SVGGraphicsElement,
  options: TransformOptions
) {
  let identifier = target.getAttribute("data-transform-identifier");

  if (!identifier) {
    identifier = `transform${identifierCounter}`;
    target.setAttribute("data-transform-identifier", identifier);
    identifierCounter++;
  }

  if (!transformStore[identifier]) {
    const clientRectTarget =
      options.startClientRect ?? target.getBoundingClientRect();
    transformStore[identifier] = {
      clientRect: clientRectTarget,
      transformRect: options.startTransform ?? defaultOptions.startTransform,
    };
  }
  return identifier;
}

function getOriginCanvasPosition(
  target: HTMLElement | SVGGraphicsElement,
  identifier: string,
  options: TransformOptions
): Point {
  const transformClone = target.style.transform;
  target.style.transform = target.style.transform ?? "";

  if (target.style.transform.includes("scale3d")) {
    target.style.transform = target.style.transform.replace(
      /scale3d\([^\)]+\)/,
      "scale3d(0,0,0)"
    );
  } else {
    target.style.transform += " scale3d(0,0,0)";
  }

  const initialClientRect = target.getBoundingClientRect();
  transformStore[identifier].transformRect =
    options.startTransform ?? transformStore[identifier].transformRect;

  const originCanvasPosition: Point = {
    x: initialClientRect.left,
    y: initialClientRect.top,
  };
  target.style.transform = transformClone;
  return originCanvasPosition;
}

function setupCanvas() {
  const canvas = document.createElement("canvas");
  document.body.prepend(canvas);

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "10000000";
  canvas.style.display = "block";
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  return canvas;
}

export function transformElement(
  target: HTMLElement | SVGGraphicsElement,
  options: TransformOptions
) {
  tearDown();
  const identifier = prepareTransformStore(target, options);
  const initialRotation = getinitialRotation(target);
  const originCanvasPosition = getOriginCanvasPosition(
    target,
    identifier,
    options
  );
  const svgElement = target.closest("svg");
  const originalOpacity = target.style.opacity;
  const svgScaleFactor = svgElement
    ? getSVGScaleFactor(svgElement)
    : { x: 1, y: 1 };
  const svgScaleFactorInverse = devidetPoints({ x: 1, y: 1 }, svgScaleFactor);
  const clientRect = transformStore[identifier].clientRect;
  const dimension: Dimension = {
    width: clientRect.width,
    height: clientRect.height,
  };
  const transformRect: TransformRect = transformStore[identifier].transformRect;
  const canvas = setupCanvas();
  const ctx = canvas.getContext("2d");

  let transformRectStart: TransformRect =
    transformStore[identifier].transformRect;
  let scrolling = false;
  let mousePosition: Point = { x: 0, y: 0 };
  let mousePositionStart: Point = { x: 0, y: 0 };
  let mouseDown = false;
  let animationFrame: number;

  const draw = () => {
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    if (scrolling || targetMode === "off") {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }
    ctx!.save();
    if (!mouseDown) {
      ctx!.translate(originCanvasPosition.x, originCanvasPosition.y);
      ctx!.rotate(transformRect.rotate);
      ctx!.fillStyle = "#e014bb";
      ctx!.lineWidth = 2;

      ctx!.beginPath();
      ctx!.arc(0, 0, 3, 0, Math.PI * 2, true);
      ctx!.strokeStyle = "white";
      ctx!.stroke();
      ctx!.closePath();
      ctx!.fill();
    }
    ctx!.restore();
    positionDomElement(
      target,
      transformRect,
      options.origin,
      target.style.opacity === "0"
    );
    animationFrame = window.requestAnimationFrame(draw);
  };

  animationFrame = window.requestAnimationFrame(() => {
    draw();
  });

  // SCROLL
  const onScroll = () => {
    scrolling = true;
  };

  window.addEventListener("scroll", onScroll);

  // SCROLL END
  const onScrollEnd = () => {
    scrolling = false;
    if (!identifier) {
      return;
    }
  };
  window.addEventListener("scrollend", onScrollEnd);

  // CANVAS MOUSEUP
  const onMouseUp = () => {
    mouseDown = false;
    if (options.onMouseUp) {
      options.onMouseUp({
        mousePosition,
        mousePositionStart,
        dimension,
        mode: targetMode,
        origin: options.origin,
        transformRect,
      });
    }
  };
  canvas.addEventListener("mouseup", onMouseUp);

  // CANVAS MOUSEDOWN
  const onMousedown = () => {
    mouseDown = true;
    mousePositionStart = mousePosition;
    transformRectStart = JSON.parse(JSON.stringify(transformRect));
  };
  canvas.addEventListener("mousedown", onMousedown);

  // CANVAS MOUSEMOVE
  const onMouseMove = (event: MouseEvent) => {
    mousePosition = getMousePosition(event);

    if (targetMode === "scale" && mouseDown) {
      const dimensionsValue = {
        width: dimension.width * svgScaleFactorInverse.x,
        height: dimension.height * svgScaleFactorInverse.y,
      };

      const scale = {
        x:
          (dimensionsValue.width + (mousePosition.x - mousePositionStart.x)) /
            dimensionsValue.width -
          1,
        y:
          (dimensionsValue.height + (mousePosition.y - mousePositionStart.y)) /
            dimensionsValue.height -
          1,
      };
      const scalePropValue = (scale.x + scale.y) / 2;
      transformRect.scale = roundPoint(
        addPoints(
          {
            x: scaleProportianally ? scalePropValue : scale.x,
            y: scaleProportianally ? scalePropValue : scale.y,
          },
          transformRectStart.scale
        )
      );
    } else if (targetMode === "translate" && mouseDown) {
      const { x: mouseX, y: mouseY } = rotatePoint(
        mousePosition,
        { x: 0, y: 0 },
        -initialRotation
      );
      const { x: mouseXRotated, y: mouseYRotated } = rotatePoint(
        mousePositionStart,
        { x: 0, y: 0 },
        -initialRotation
      );
      const positionDelta = {
        x: translatePointBoolean.x ? mouseX - mouseXRotated : 0,
        y: translatePointBoolean.y ? mouseY - mouseYRotated : 0,
      };

      transformRect.position = addPoints(
        transformRectStart.position,
        positionDelta
      );
    } else if (targetMode === "rotate" && mouseDown) {
      const angle =
        Math.atan2(
          mousePosition.y - originCanvasPosition.y,
          mousePosition.x - originCanvasPosition.x
        ) -
        Math.atan2(
          mousePositionStart.y - originCanvasPosition.y,
          mousePositionStart.x - originCanvasPosition.x
        );

      transformRect.rotate = angle + transformRectStart.rotate;
    }
  };
  canvas.addEventListener("mousemove", onMouseMove);

  // KEYDOWN
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      tearDown();
    }
  };
  window.addEventListener("keydown", onKeydown);

  tearDown = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("scrollend", onScrollEnd);
    window.removeEventListener("keydown", onKeydown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousedown", onMousedown);
    canvas.removeEventListener("mousemove", onMouseMove);
    target.style.opacity = originalOpacity;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (svgElement) {
      svgElement.style.all = "";
      svgElement.style.maxWidth = "";
      svgElement.style.maxHeight = "";
    }
    canvas.remove();
  };
}

if (typeof window !== "undefined") {
  (window as any).transformElement = transformElement;
}
