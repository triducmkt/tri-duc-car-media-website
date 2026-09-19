"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Header is `fixed` (floats transparent over the home hero, see Header.tsx),
 * so it no longer pushes page content down on its own. Every page except
 * home needs that space compensated with top padding instead — home keeps
 * its hero flush against the very top of the viewport.
 */
export function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main id="main-content" className={`flex-1 ${isHome ? "" : "pt-18"}`}>
      {children}
    </main>
  );
}
