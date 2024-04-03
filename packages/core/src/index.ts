import { VariomotionProject } from "./core";
import { generateShortUID } from "./utils";

export * from "./units-map";
export * from "./easing-functions";
export * from "./utils";
export * from "./types-interfaces";
export * from "./data/breakpoints";
export * from "./data/timeline";
export * from "./data/entry";
export * from "./data/frame";
export * from "./helpers/frame";
export * from "./helpers/animationProps";
export * from "./core";

interface IProjectStoreItem {
  project: VariomotionProject;
  target: (id: string) => string;
}

const projectStore: Record<string, IProjectStoreItem> = {};

export const project = (projectName: string): IProjectStoreItem => {
  if (projectStore[projectName]) {
    return projectStore[projectName];
  }
  const scopeId = generateShortUID();
  projectStore[projectName] = {
    target: (id: string) => `${scopeId} ${id}`,
    project: new VariomotionProject(scopeId, projectName),
  };
  return projectStore[projectName];
};

export default {
  projectStore,
  project,
};
