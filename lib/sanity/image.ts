import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { projectId, dataset } from "./client";

const builder = createImageUrlBuilder({ projectId: projectId || "placeholder", dataset });

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
