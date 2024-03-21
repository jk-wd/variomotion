import { Point, TransformRect } from "./types";

export function rotatePoint(point: Point, pivot: Point, angle: number): Point {
  const cos = Math.cos(angle),
    sin = Math.sin(angle),
    nx = cos * (point.x - pivot.x) - sin * (point.y - pivot.y) + pivot.x,
    ny = cos * (point.y - pivot.y) + sin * (point.x - pivot.x) + pivot.y;
  return { x: nx, y: ny };
}

export function roundPoint(pointA: Point): Point {
  return { x: pointA.x, y: pointA.y };
}

export function addPoints(pointA: Point, pointB: Point): Point {
  return { x: pointA.x + pointB.x, y: pointA.y + pointB.y };
}

export function substractPoints(pointA: Point, pointB: Point): Point {
  return { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
}

export function devidetPoints(pointA: Point, pointB: Point): Point {
  return { x: pointA.x / pointB.x, y: pointA.y / pointB.y };
}

export function multiplyPoints(pointA: Point, pointB: Point): Point {
  return { x: pointA.x * pointB.x, y: pointA.y * pointB.y };
}

export function pointsEqual(pointA: Point, pointB: Point): boolean {
  return pointA.x === pointB.x && pointA.y === pointB.y;
}

export function transformRectChanged(
  transformRectA: TransformRect,
  transformRectB: TransformRect
): boolean {
  return (
    !pointsEqual(transformRectA.position, transformRectB.position) ||
    !pointsEqual(transformRectA.scale, transformRectB.scale) ||
    transformRectA.rotate !== transformRectB.rotate
  );
}

export function getMousePosition(event: MouseEvent): Point {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

export function screenPointToSVGPoint(
  screenPoint: Point,
  svgElement: SVGSVGElement
) {
  const svgPoint = svgElement.createSVGPoint();
  svgPoint.x = screenPoint.x;
  svgPoint.y = screenPoint.y;
  const screenCTM = svgElement.getScreenCTM();
  if (!screenCTM) {
    return svgPoint;
  }
  return svgPoint.matrixTransform(screenCTM.inverse());
}

export function positionDomElement(
  target: HTMLElement | SVGGraphicsElement,
  transformRect: TransformRect,
  origin: Point,
  opacity?: boolean
) {
  target.style.transformOrigin = `${origin.x}px ${origin.y}px`;
  if (opacity) target.style.opacity = "0.05";
  target.style.transform = `translate3d(${transformRect.position.x}px, ${transformRect.position.y}px, 0px) rotate(${transformRect.rotate}rad) scale3d(${transformRect.scale.x}, ${transformRect.scale.y}, 1) `;
}

export function getSVGScaleFactor(svgElement: SVGSVGElement): Point {
  const width =
    svgElement.getBoundingClientRect().right -
    svgElement.getBoundingClientRect().left;
  const height =
    svgElement.getBoundingClientRect().bottom -
    svgElement.getBoundingClientRect().top;

  const pointBottomRight = screenPointToSVGPoint(
    {
      x: svgElement.getBoundingClientRect().right,
      y: svgElement.getBoundingClientRect().bottom,
    },
    svgElement
  );
  const pointTopLeft = screenPointToSVGPoint(
    {
      x: svgElement.getBoundingClientRect().left,
      y: svgElement.getBoundingClientRect().top,
    },
    svgElement
  );
  return {
    x: width / (pointBottomRight.x - pointTopLeft.x),
    y: height / (pointBottomRight.y - pointTopLeft.y),
  };
}

export function getCurrentRotation(element: HTMLElement | SVGGraphicsElement) {
  const matrix = new DOMMatrix(getComputedStyle(element).transform);
  const angle = Math.atan2(matrix.b, matrix.a);
  return angle;
}

export function getinitialRotation(target: HTMLElement | SVGGraphicsElement) {
  let initialRotation = 0;
  let element = target;

  while (element) {
    element = element.parentElement as HTMLElement;
    if (element) {
      initialRotation += getCurrentRotation(element as HTMLElement);
    }
  }
  return initialRotation;
}
