import {
  addTimeline,
  connectTimelineEntry,
  deleteTimeline,
  editTimeline,
} from "./timeline";
import {
  EntryNotFound,
  TimelineIdAlreadyUsed,
  TimelineNotFound,
} from "../errors";

const animationData = {
  metaData: { fileName: "mock.json" },
  timelines: [
    {
      id: "timeline-1",
      pixelBased: true,
      loop: false,
      autoplay: false,
      sequenceEntries: ["1"],
      duration: 100000,
      animationEntries: ["2"],
    },
    {
      id: "timeline-2",
      pixelBased: true,
      loop: false,
      autoplay: false,
      sequenceEntries: ["3"],
      duration: 100000,
      animationEntries: ["4"],
    },
  ],
  entries: [
    {
      id: "1",
      domQuery: '[data-v~="sequence"]',
      framePositionValue: 200,
      interval: 60,
      sequenceCount: 32,
      name: "one",
    },
    {
      id: "2",
      domQueries: ['[data-v~="laptop"]'],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "two",
    },
    {
      id: "3",
      domQuery: '[data-v~="sequence"]',
      framePositionValue: 200,
      interval: 60,
      sequenceCount: 32,
      name: "three",
    },
    {
      id: "4",
      domQueries: ['[data-v~="laptop"]'],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "four",
    },
  ],
};

test("data/timeline.ts (editTimeline) should correctly update the referenced timeline", () => {
  expect(
    editTimeline(animationData as any, {
      id: "timeline-1",
      loop: true,
      pixelBased: false,
    })
  ).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: false,
        autoplay: false,
        loop: true,
        sequenceEntries: ["1"],
        duration: 100000,
        animationEntries: ["2"],
      },
      {
        id: "timeline-2",
        pixelBased: true,
        autoplay: false,
        loop: false,
        sequenceEntries: ["3"],
        duration: 100000,
        animationEntries: ["4"],
      },
    ],
    entries: [
      {
        id: "1",
        domQuery: '[data-v~="sequence"]',
        framePositionValue: 200,
        interval: 60,
        sequenceCount: 32,
        name: "one",
      },
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "two",
      },
      {
        id: "3",
        domQuery: '[data-v~="sequence"]',
        framePositionValue: 200,
        interval: 60,
        sequenceCount: 32,
        name: "three",
      },
      {
        id: "4",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "four",
      },
    ],
  });
});
test("data/timeline.ts (addTimeline) should add a new timeline", () => {
  expect(
    addTimeline(animationData as any, {
      id: "timeline-3",
      loop: true,
      pixelBased: false,
      autoplay: false,
      animationEntries: [],
      sequenceEntries: [],
    })
  ).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: true,
        loop: false,

        autoplay: false,
        sequenceEntries: ["1"],
        duration: 100000,
        animationEntries: ["2"],
      },
      {
        id: "timeline-2",
        pixelBased: true,
        loop: false,

        autoplay: false,
        sequenceEntries: ["3"],
        duration: 100000,
        animationEntries: ["4"],
      },
      {
        id: "timeline-3",
        loop: true,

        autoplay: false,
        pixelBased: false,
        animationEntries: [],
        sequenceEntries: [],
      },
    ],
    entries: [
      {
        id: "1",
        domQuery: '[data-v~="sequence"]',
        framePositionValue: 200,
        interval: 60,
        sequenceCount: 32,
        name: "one",
      },
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "two",
      },
      {
        id: "3",
        domQuery: '[data-v~="sequence"]',
        framePositionValue: 200,
        interval: 60,
        sequenceCount: 32,
        name: "three",
      },
      {
        id: "4",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "four",
      },
    ],
  });
});
test("data/timeline.ts (deleteTimeline) should delete the timeline with the given id", () => {
  expect(deleteTimeline(animationData as any, "timeline-2")).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: true,
        autoplay: false,
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
        name: "one",
      },
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "two",
      },
    ],
  });
});

test("data/timeline.ts (addTimeline) should throw an error when the id is already used", () => {
  expect(() => {
    addTimeline(animationData as any, {
      id: "timeline-2",
      loop: true,
      pixelBased: false,
      autoplay: false,
      animationEntries: [],
      sequenceEntries: [],
    });
  }).toThrow(TimelineIdAlreadyUsed.message);
});

test("data/timeline.ts (connectTimelineEntry) should connect an entry to the specified timeline", () => {
  expect(
    connectTimelineEntry(animationData as any, "timeline-1", "3", "sequence")
  ).toEqual({
    metaData: { fileName: "mock.json" },
    timelines: [
      {
        id: "timeline-1",
        pixelBased: true,
        autoplay: false,
        loop: false,
        sequenceEntries: ["1", "3"],
        duration: 100000,
        animationEntries: ["2"],
      },
      {
        id: "timeline-2",
        pixelBased: true,
        autoplay: false,
        loop: false,
        sequenceEntries: ["3"],
        duration: 100000,
        animationEntries: ["4"],
      },
    ],
    entries: [
      {
        id: "1",
        domQuery: '[data-v~="sequence"]',
        framePositionValue: 200,
        interval: 60,
        sequenceCount: 32,
        name: "one",
      },
      {
        id: "2",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "two",
      },
      {
        id: "3",
        domQuery: '[data-v~="sequence"]',
        framePositionValue: 200,
        interval: 60,
        sequenceCount: 32,
        name: "three",
      },
      {
        id: "4",
        domQueries: ['[data-v~="laptop"]'],
        frames: [
          { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
          { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
        ],
        name: "four",
      },
    ],
  });
});

test("data/timeline.ts (connectTimelineEntry) should throw an error when timeline id doesnt exist", () => {
  expect(() => {
    connectTimelineEntry(animationData as any, "timeline-9", "3", "sequence");
  }).toThrow(TimelineNotFound.message);
});

test("data/timeline.ts (connectTimelineEntry) should throw an error when entry is not found", () => {
  expect(() => {
    connectTimelineEntry(
      animationData as any,
      "timeline-2",
      "non existing entry id",
      "sequence"
    );
  }).toThrow(EntryNotFound);
});

test("data/timeline.ts (connectTimelineEntry) should throw an error when entry id doesnt exist", () => {
  expect(() => {
    connectTimelineEntry(
      animationData as any,
      "timeline-1",
      "30000",
      "sequence"
    );
  }).toThrow(EntryNotFound.message);
});
