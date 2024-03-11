import { addBreakpoint, editBreakpoint, deleteBreakpoint } from "./breakpoints";
import { BreakpointIdAlreadyUsed } from "../errors";

const animaitonData = {
  breakpoints: [
    {
      id: "small",
      definition: "(max-width: 700px)",
    },
  ],
};

test("data/breakpoints.ts (editBreakpoint) should correctly update the referenced breakpoint", () => {
  expect(
    editBreakpoint(animaitonData as any, {
      id: "small",
      definition: "(max-width: 900px)",
    })
  ).toEqual({
    breakpoints: [
      {
        id: "small",
        definition: "(max-width: 900px)",
      },
    ],
  });
});

test("data/breakpoints.ts (addBreakpoint) should add a new breakpoint", () => {
  const result = addBreakpoint(animaitonData as any, {
    id: "medium",
    definition: "(max-width: 1900px)",
  });

  expect(result.breakpoints?.pop()?.id).toEqual("medium");
});

test("data/breakpoints.ts (addBreakpoint) should throw an error when the id is already used", () => {
  expect(() => {
    addBreakpoint(animaitonData as any, {
      id: "small",
    });
  }).toThrow(BreakpointIdAlreadyUsed.message);
});

test("data/breakpoints.ts (deleteBreakpoint) remove an breakpoint", () => {
  expect(deleteBreakpoint(animaitonData as any, "small")).toEqual({
    breakpoints: [],
  });
});
