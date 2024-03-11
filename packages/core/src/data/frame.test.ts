import { addFrame, editFrame, deleteFrame, getFrameById } from "./frame";
import { AnimationEntryNotFound, FrameNotFound } from "../errors";
import { Units } from "../types-interfaces";

const animaitonData = {
  metaData: { fileName: "mock.json" },
  timelines: [
    {
      id: "timeline-1",
      pixelBased: true,
      loop: false,
      sequenceEntries: ["1"],
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
    {
      id: "2",
      domQueries: ['[data-v~="laptop"]'],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "test",
    },
  ],
};

test("data/frames.ts (getFrameById) should get the frame if defined", () => {
  expect(getFrameById(animaitonData as any, "2", 0)).toEqual({
    framePositionValue: 1200,
    frameUnit: "ms",
    valueDef: {},
  });
});
test("data/frames.ts (getFrameById) should throw an error when frame is not defined", () => {
  expect(() => {
    getFrameById(animaitonData as any, "2", 10);
  }).toThrow(FrameNotFound);
});
test("data/frames.ts (getFrameById) should throw an error when entry is not defined", () => {
  expect(() => {
    getFrameById(animaitonData as any, "non existing entry id", 10);
  }).toThrow(AnimationEntryNotFound);
});
test("data/frames.ts (editFrame) should edit a frame", () => {
  expect(
    editFrame(
      animaitonData as any,
      "2",
      {
        framePositionValue: 1300,
        frameUnit: "ms",
        valueDef: {
          none: {
            translateX: {
              easing: "ease-in-out",
              unit: Units.px,
              value: "200",
            },
          },
        },
      },
      0
    )
  ).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: true,
        loop: false,
        sequenceEntries: ["1"],
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
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          {
            framePositionValue: 1300,
            frameUnit: "ms",
            valueDef: {
              none: {
                translateX: {
                  easing: "ease-in-out",
                  unit: Units.px,
                  value: "200",
                },
              },
            },
          },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "test",
      },
    ],
  });
});
test("data/frames.ts (editFrame) should throw an error when entry is not found", () => {
  expect(() => {
    editFrame(
      animaitonData as any,
      "non existing entry id",
      {
        framePositionValue: 1300,
        frameUnit: "ms",
        valueDef: {
          none: {
            translateX: {
              easing: "ease-in-out",
              unit: Units.px,
              value: "200",
            },
          },
        },
      },
      0
    );
  }).toThrow(AnimationEntryNotFound);
});
test("data/frames.ts (addFrame) should add a new frame", () => {
  expect(
    addFrame(animaitonData as any, "2", {
      framePositionValue: 1300,
      frameUnit: "ms",
      valueDef: {
        none: {
          translateX: {
            easing: "ease-in-out",
            unit: Units.px,
            value: "200",
          },
        },
      },
    })
  ).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: true,
        loop: false,
        sequenceEntries: ["1"],
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
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          {
            framePositionValue: 1300,
            frameUnit: "ms",
            valueDef: {
              none: {
                translateX: {
                  easing: "ease-in-out",
                  unit: Units.px,
                  value: "200",
                },
              },
            },
          },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "test",
      },
    ],
  });
});
test("data/frames.ts (addFrame) should throw an error when entry is not found", () => {
  expect(() => {
    addFrame(animaitonData as any, "non existing entry id", {
      framePositionValue: 1300,
      frameUnit: "ms",
      valueDef: {
        none: {
          translateX: {
            easing: "ease-in-out",
            unit: Units.px,
            value: "200",
          },
        },
      },
    });
  }).toThrow(AnimationEntryNotFound);
});
test("data/frames.ts (deleteFrame) should remove a frame", () => {
  expect(deleteFrame(animaitonData as any, "2", 0)).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: true,
        loop: false,
        sequenceEntries: ["1"],
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
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [{ framePositionValue: 5550, frameUnit: "ms", valueDef: {} }],
        name: "test",
      },
    ],
  });
});
test("data/frames.ts (deleteFrame) should throw an error when animation entry is not found", () => {
  expect(() => {
    deleteFrame(animaitonData as any, "non existing entry id", 0);
  }).toThrow(AnimationEntryNotFound);
});
