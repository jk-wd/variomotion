import {
  editEntry,
  deleteEntry,
  addEntry,
  removeEntryReferences,
  getAnimationEntryById,
  getSequenceEntryById,
} from "./entry";

import { IAnimationEntry } from "../types-interfaces";
import {
  AnimationEntryIdAlreadyUsed,
  AnimationEntryWrongType,
  SequenceEntryWrongType,
} from "../errors";

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

test("data/entry.ts (getSequenceEntryById) should return undefined when entry is not defined", () => {
  const entry = getSequenceEntryById(
    JSON.parse(JSON.stringify(animaitonData as any)),
    "non existing entry id"
  );
  expect(entry).toBeUndefined();
});

test("data/entry.ts (getSequenceEntryById) should throw error when using entry id of wrong type", () => {
  expect(() => {
    getSequenceEntryById(JSON.parse(JSON.stringify(animaitonData as any)), "2");
  }).toThrow(SequenceEntryWrongType);
});

test("data/entry.ts (getSequenceEntryById) should throw error when using entry id of wrong type", () => {
  const entry = getSequenceEntryById(
    JSON.parse(JSON.stringify(animaitonData as any)),
    "1"
  );
  expect(entry).toEqual({
    id: "1",
    domQuery: '[data-v~="sequence"]',
    framePositionValue: 200,
    interval: 60,
    sequenceCount: 32,
    name: "laptop",
  });
});

test("data/entry.ts (getAnimationEntryById) should return undefined when entry is not defined", () => {
  const entry = getAnimationEntryById(
    JSON.parse(JSON.stringify(animaitonData as any)),
    "non existing entry id"
  );
  expect(entry).toBeUndefined();
});

test("data/entry.ts (getAnimationEntryById) should throw error when using entry id of wrong type", () => {
  expect(() => {
    getAnimationEntryById(
      JSON.parse(JSON.stringify(animaitonData as any)),
      "1"
    );
  }).toThrow(AnimationEntryWrongType);
});

test("data/entry.ts (getAnimationEntryById) should throw error when using entry id of wrong type", () => {
  const entry = getAnimationEntryById(
    JSON.parse(JSON.stringify(animaitonData as any)),
    "2"
  );
  expect(entry).toEqual({
    id: "2",
    domQueries: ['[data-v~="laptop"]'],
    frames: [
      { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
      { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
    ],
    name: "test",
  });
});

test("data/entry.ts (removeEntryReferences) remove all animation entry id references from the timeline entries", () => {
  const newData = removeEntryReferences(
    JSON.parse(JSON.stringify(animaitonData as any)),
    "2"
  );
  expect(newData.timelines[0].sequenceEntries[0]).toEqual("1");
  expect(newData.timelines[0].animationEntries.length).toEqual(0);
});

test("data/entry.ts (editEntry) should correctly update the referenced entry", () => {
  const newData = editEntry<IAnimationEntry>(
    JSON.parse(JSON.stringify(animaitonData as any)),
    {
      id: "2",
      domQueries: ["otherref"],
      name: "somethingelse",
    }
  );
  expect(newData.entries).toEqual([
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
      domQueries: ["otherref"],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "somethingelse",
    },
  ]);
});

test("data/entry.ts (editEntry) should correctly update the referenced entry", () => {
  const newData = editEntry<IAnimationEntry>(
    JSON.parse(JSON.stringify(animaitonData as any)),
    {
      id: "2",
      domQueries: ["otherref"],
      name: "somethingelse",
    }
  );
  expect(newData.entries).toEqual([
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
      domQueries: ["otherref"],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "somethingelse",
    },
  ]);
});

test("data/entry.ts (deleteEntry) should remove the entry correctly", () => {
  const newData = deleteEntry(
    JSON.parse(JSON.stringify(animaitonData as any)),
    "2"
  );
  expect(newData.entries).toEqual([
    {
      id: "1",
      domQuery: '[data-v~="sequence"]',
      framePositionValue: 200,
      interval: 60,
      sequenceCount: 32,
      name: "laptop",
    },
  ]);
});

test("data/entry.ts (addEntry) should rmeove the entry correctly", () => {
  const newData = addEntry(JSON.parse(JSON.stringify(animaitonData as any)), {
    id: "3",
    domQueries: ["ref"],
    frames: [
      { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
      { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
    ],
    name: "name",
  });

  expect(newData.entries).toEqual([
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
    {
      id: "3",
      domQueries: ["ref"],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "name",
    },
  ]);
});

test("data/entry.ts (addEntry) should throw error when id is already used", () => {
  expect(() => {
    addEntry(JSON.parse(JSON.stringify(animaitonData as any)), {
      id: "2",
      domQueries: ["ref"],
      frames: [
        { framePositionValue: 1200, frameUnit: "ms", valueDef: {} },
        { framePositionValue: 5550, frameUnit: "ms", valueDef: {} },
      ],
      name: "name",
    });
  }).toThrow(AnimationEntryIdAlreadyUsed);
});
