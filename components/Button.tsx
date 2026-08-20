import { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "ghost";

// Static, param-free routes only — dynamic [slug] routes should use next-intl's
// `Link` directly with the `{ pathname, params }` object form instead of Button.
type StaticPathname =
  | "/"
  | "/about"
  | "/services"
  | "/case-studies"
  | "/blog"
  | "/booking"
  | "/contact";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-brand-500] min-h-11";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-8px_rgba(66,133,244,0.6)]",
  secondary:
    "bg-ink text-white hover:bg-ink-soft",
  ghost:
    "bg-transparent text-ink ring-1 ring-inset ring-black/10 hover:bg-black/[0.03]",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & (
  | ({ href: StaticPathname } & Omit<ComponentProps<typeof Link>, "href" | "className">)
  | ({ href: `https://${string}` | `mailto:${string}` | `tel:${string}` } & Omit<
      ComponentProps<"a">,
      "href" | "className"
    >)
);

export function Button({ children, variant = "primary", className = "", href, ...rest }: Props) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (typeof href === "string" && /^(https:|mailto:|tel:)/.test(href)) {
    return (
      <a {...(rest as ComponentProps<"a">)} href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link {...(rest as ComponentProps<typeof Link>)} href={href as StaticPathname} className={classes}>
      {children}
    </Link>
  );
}
