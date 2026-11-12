import { projects } from "@/content/projects";

type Frames = typeof projects.flagship.walkthrough.frames;

function fill(template: string, index: number, frames: Frames): string {
  const nn = String(index + 1).padStart(2, "0");
  return template.replace("{nn}", nn).replace("{name}", frames[index].name);
}

export function counterText(index: number, frames: Frames): string {
  return fill(projects.flagship.walkthrough.counterTemplate, index, frames);
}

export function statusText(index: number, frames: Frames): string {
  return fill(projects.flagship.walkthrough.statusTemplate, index, frames);
}
