export interface TransformRect {
  position: Point;
  rotate: number;
  scale: Point;
}
export interface TransformState {
  mousePosition: Point;
  mousePositionStart: Point;
  mode: Mode;
  dimension: Dimension;
  transformRect: TransformRect;
  origin: Point;
}

export type Mode = "translate" | "scale" | "rotate" | "off";

export interface TransformCanvasInterface {
  setTarget: (target: HTMLElement, options: TransformOptions) => void;
}

export interface TransformOptions {
  origin: Point;
  startTransform: TransformRect;
  startClientRect?: DOMRect;
  onMouseUp?: (state: TransformState) => void;
}
export interface Point {
  x: number;
  y: number;
}

export interface PointBoolean {
  x: boolean;
  y: boolean;
}

export interface Dimension {
  width: number;
  height: number;
}
