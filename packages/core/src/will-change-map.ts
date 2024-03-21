import { NumberValuePropTypes } from "./types-interfaces";

export const willChangeMap = {
  [NumberValuePropTypes.translateX]: "transform",
  [NumberValuePropTypes.translateY]: "transform",
  [NumberValuePropTypes.scaleX]: "transform",
  [NumberValuePropTypes.scaleY]: "transform",
  [NumberValuePropTypes.rotate]: "transform",
  [NumberValuePropTypes.opacity]: "opacity",
  [NumberValuePropTypes.width]: undefined,
  [NumberValuePropTypes.height]: undefined,
  [NumberValuePropTypes.borderRadius]: undefined,
};
