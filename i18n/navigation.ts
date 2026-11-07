import type { ComponentProps } from "react";
import { createElement } from "react";
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

const nav = createNavigation(routing);

export const { redirect, usePathname, useRouter, getPathname } = nav;

/**
 * Locale-aware Link with prefetch OFF by default (hover included).
 * On this OpenNext/Cloudflare deploy every prefetch fell into a retry loop
 * (~13 Worker requests per second per link, forever), which used up the
 * Workers Free 100k requests/day — hq/lesson.md ERR-WEB-009. Clicking still
 * navigates client-side; the page data is fetched once on click.
 * Pass prefetch explicitly only after the loop is proven fixed.
 */
export function Link({ prefetch = false, ...props }: ComponentProps<typeof nav.Link>) {
  return createElement(nav.Link, { prefetch, ...props } as ComponentProps<typeof nav.Link>);
}
