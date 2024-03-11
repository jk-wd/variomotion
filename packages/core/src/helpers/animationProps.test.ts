import { mergeAnimations } from "./animationProps";

const animaionPropsA = {
  translateX: [
    {
      framePositionValue: 200,
      value: 0,
    },
    {
      framePositionValue: 400,
      value: 100,
    },
  ],
  translateY: [
    {
      framePositionValue: 23,
      value: 0,
    },
    {
      framePositionValue: 24,
      value: 100,
    },
  ],
};

const animaionPropsB = {
  translateX: [
    {
      framePositionValue: 300,
      value: 0,
    },
    {
      framePositionValue: 400,
      value: 10,
    },
  ],
  translateY: [
    {
      framePositionValue: 22,
      value: 22,
    },
    {
      framePositionValue: 23,
      value: 11,
    },
  ],
};

test("animation.ts (mergeAnimations) should merge two frame arrays ", () => {
  const merged = mergeAnimations(animaionPropsA, animaionPropsB, true);
  expect(merged.translateX).toEqual([
    {
      framePositionValue: 200,
      value: 0,
    },
    {
      framePositionValue: 300,
      value: 0,
    },
    {
      framePositionValue: 400,
      value: 100,
    },
  ]);
  expect(merged.translateY).toEqual([
    {
      framePositionValue: 22,
      value: 22,
    },
    {
      framePositionValue: 23,
      value: 0,
    },
    {
      framePositionValue: 24,
      value: 100,
    },
  ]);
});

test("animation.ts (mergeAnimations) should ignore invalid frames ", () => {
  (animaionPropsA as any).translateX = [
    ...(animaionPropsA as any).translateX,
    {
      id: "76876786786",
      value: 22,
    },
  ];
  (animaionPropsB as any).translateY = [
    ...(animaionPropsB as any).translateY,
    {
      id: "234234234",
      value: 333,
    },
  ];
  const merged = mergeAnimations(animaionPropsA, animaionPropsB, true);
  expect(merged.translateX).toEqual([
    {
      framePositionValue: 200,
      value: 0,
    },
    {
      framePositionValue: 300,
      value: 0,
    },
    {
      framePositionValue: 400,
      value: 100,
    },
  ]);
  expect(merged.translateY).toEqual([
    {
      framePositionValue: 22,
      value: 22,
    },
    {
      framePositionValue: 23,
      value: 0,
    },
    {
      framePositionValue: 24,
      value: 100,
    },
  ]);
});
