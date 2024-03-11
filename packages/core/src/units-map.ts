import {
  Units,
  NumberValuePropTypes,
  FixedValuePropTypes,
} from "./types-interfaces";

export const unitMap = {
  [NumberValuePropTypes.translateX]: [
    Units.px,
    Units.em,
    Units.percent,
    Units.rem,
    Units.vh,
    Units.vw,
  ],
  [NumberValuePropTypes.translateY]: [
    Units.px,
    Units.em,
    Units.percent,
    Units.rem,
    Units.vh,
    Units.vw,
  ],
  [NumberValuePropTypes.scaleX]: [Units.percent],
  [NumberValuePropTypes.scaleY]: [Units.percent],
  [NumberValuePropTypes.rotate]: [Units.rad],
  [NumberValuePropTypes.opacity]: [Units.percent],
  [NumberValuePropTypes.width]: [
    Units.px,
    Units.em,
    Units.percent,
    Units.rem,
    Units.vh,
    Units.vw,
  ],
  [NumberValuePropTypes.height]: [
    Units.px,
    Units.em,
    Units.percent,
    Units.rem,
    Units.vh,
    Units.vw,
  ],
};

export const fixedValueMap = {
  [FixedValuePropTypes.visibility]: ["hidden", "visible"],
  [FixedValuePropTypes.display]: ["block", "inline", "inline-block", "none"],
};
