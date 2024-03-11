import { DomtargetDimensions } from "./types";

export function getDomTargets(type?: string) {
  const attributesFromDom = Array.from(
    document.querySelectorAll("[data-v]") ?? []
  ).flatMap((el) => {
    const attributes = el.getAttribute("data-v");
    if (
      (el.getAttribute("data-v-type") === type || type === undefined) &&
      attributes
    ) {
      return attributes.split(" ");
    }
    return [];
  });
  const domqueryIds = [...new Set(attributesFromDom ?? [])].filter((el) => {
    return el !== "";
  });

  return domqueryIds;
}

export function getDomTargetDimension(
  id: string
): DomtargetDimensions | undefined {
  const targets = document.querySelectorAll(`[data-v="${id}"]`) ?? [];
  if (!targets || targets.length === 0) {
    return;
  }

  const target = targets[0] as HTMLElement | SVGGraphicsElement;

  const svgElement = target.closest("svg");

  return {
    clientRect: target.getBoundingClientRect(),
    svgElement: svgElement ?? undefined,
  };
}

export function getDomTargetsSite(): Record<string, string[]> {
  const queries = {
    regular: getDomTargets(),
    sequence: getDomTargets("sequence"),
  };

  return queries;
}
