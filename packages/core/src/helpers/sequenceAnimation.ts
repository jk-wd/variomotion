import { ISequenceAnimation } from "../types-interfaces";

export const getSequenceAnimationDuration = (
  sequenceAnimation: ISequenceAnimation
) => {
  return (sequenceAnimation.sequenceCount - 1) * sequenceAnimation.interval;
};

export const getEndFromSequenceAnimation = (
  sequenceAnimation: ISequenceAnimation
) => {
  const duration = getSequenceAnimationDuration(sequenceAnimation);
  return sequenceAnimation.framePositionValue + duration;
};
