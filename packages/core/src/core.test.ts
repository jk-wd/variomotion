import "../mocks/matchMedia.mock";
import { setAnimationData, processAnimationData } from "./core";

const animationData = {
  metaData: { fileName: "mock.json" },
  timelines: [
    {
      id: "timeline-1",
      pixelBased: true,
      loop: false,
      sequenceEntries: [],
      duration: 100000,
      animationEntries: ["2"],
    },
  ],
  entries: [
    {
      id: "1",
      domQuery: '[data-v~="sequence"]',
      framePositionValue: 200,
      interval: 60,
      sequenceCount: 32,
      name: "laptop",
    },
  ],
};

test("core.ts (processAnimationData) should not mutate the animationData object", () => {
  setAnimationData(animationData as any);
  const before = JSON.stringify(animationData);
  processAnimationData();
  expect(before).toEqual(JSON.stringify(animationData));
});
