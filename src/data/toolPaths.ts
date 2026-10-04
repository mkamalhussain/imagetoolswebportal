import { modules } from "./modules";
import { audioModules } from "./audioModules";
import { videoModules } from "./videoModules";
import { pdfModules } from "./pdfModules";

export function getToolPath(slug: string): string | undefined {
  if (modules.some((m) => m.slug === slug)) return `/modules/${slug}`;
  if (audioModules.some((m) => m.slug === slug)) return `/audio/${slug}`;
  if (videoModules.some((m) => m.slug === slug)) return `/video/${slug}`;
  if (pdfModules.some((m) => m.slug === slug)) return `/pdf/${slug}`;
  return undefined;
}
