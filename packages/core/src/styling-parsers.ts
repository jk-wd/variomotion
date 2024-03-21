import { IElement } from "./types-interfaces";
import { numberIsSet } from "./utils";

export const applyStyling = (
  domElements: HTMLElement[],
  key: string,
  value: string
) => {
  for (const domElement of domElements) {
    domElement.style[key as any] = value;
  }
};

export const domStylingParser = (element: IElement) => {
  const transforms = [];
  if (!element) {
    return;
  }
  const stylingValues = element.stylingValues;

  if (stylingValues.display) {
    applyStyling(
      element.domElements,
      "display",
      `${stylingValues.display.valueString}`
    );
  }
  if (stylingValues.visibility) {
    applyStyling(
      element.domElements,
      "visibility",
      `${stylingValues.visibility.valueString}`
    );
  }
  if (
    stylingValues.display?.valueString === "none" ||
    stylingValues.visibility?.valueString === "hidden"
  ) {
    return;
  }
  if (stylingValues.opacity) {
    applyStyling(
      element.domElements,
      "opacity",
      `${stylingValues.opacity.valueString}`
    );
  }

  if (stylingValues.borderRadius) {
    console.log("-->", stylingValues.borderRadius);
    applyStyling(
      element.domElements,
      "borderRadius",
      `${stylingValues.borderRadius.valueString}`
    );
  }

  if (
    stylingValues.opacity?.valueNumber &&
    stylingValues.opacity.valueNumber <= 0
  ) {
    return;
  }
  if (stylingValues.translateX || stylingValues.translateY) {
    transforms.push(
      `translate3d(${stylingValues.translateX?.valueString || 0}, ${
        stylingValues.translateY?.valueString || 0
      }, 0)`
    );
  }
  if (stylingValues.scaleX || stylingValues.scaleY) {
    const scaleX = numberIsSet(stylingValues.scaleX?.valueNumber)
      ? stylingValues.scaleX.valueNumber
      : 100;
    const scaleY = numberIsSet(stylingValues.scaleY?.valueNumber)
      ? stylingValues.scaleY.valueNumber
      : 100;

    transforms.push(`scale3d(${scaleX! / 100}, ${scaleY! / 100}, 1)`);
  }

  if (stylingValues.width) {
    applyStyling(
      element.domElements,
      "width",
      `${stylingValues.width.valueString}`
    );
  }
  if (stylingValues.height) {
    applyStyling(
      element.domElements,
      "height",
      `${stylingValues.height.valueString}`
    );
  }

  if (stylingValues.rotate) {
    const rotate = numberIsSet(stylingValues.rotate?.valueNumber)
      ? stylingValues.rotate.valueNumber
      : 0;
    transforms.push(`rotate(${rotate}rad)`);
  }

  if (transforms.length > 0) {
    applyStyling(element.domElements, "transform", transforms.join(" "));
  }
};
