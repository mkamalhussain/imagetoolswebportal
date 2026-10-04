import type { ToolContent } from "./types";
import { imageToolContent } from "./image";
import { audioToolContent } from "./audio";
import { videoToolContent } from "./video";
import { pdfToolContent } from "./pdf";

const all: Record<string, ToolContent> = {
  ...imageToolContent,
  ...audioToolContent,
  ...videoToolContent,
  ...pdfToolContent,
};

export function getToolContent(slug: string): ToolContent | undefined {
  return all[slug];
}

export type { ToolContent } from "./types";
