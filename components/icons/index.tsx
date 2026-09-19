import type { SVGProps } from "react";

/**
 * Custom line-art icon set, replacing the generic lucide pictograms used for
 * content (services, values, testimonials). Every icon shares one visual
 * grammar — small filled nodes joined by thin lines — echoing the
 * node-and-strand motif from SystemHero and Diagnostic, so these icons read
 * as part of the same system rather than a stock icon library. Functional
 * UI icons (menu, phone, mail) stay on lucide, where instant recognizability
 * matters more than brand voice.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Node({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={1.7} fill="currentColor" stroke="none" />;
}

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Marketing – Sales – CSKH system: three nodes in a closed loop. */
export function SystemIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5 L5 17 L19 17 Z" />
      <Node cx={12} cy={5} />
      <Node cx={5} cy={17} />
      <Node cx={19} cy={17} />
    </Svg>
  );
}

/** Personal branding: a single node shining outward. */
export function SpotlightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={12} cy={12} r={3.4} />
      <path d="M12 3.5v3M12 17.5v3M20.5 12h-3M6.5 12h-3M17.7 6.3l-2 2M8.3 15.7l-2 2M17.7 17.7l-2-2M8.3 8.3l-2-2" />
    </Svg>
  );
}

/** SOP standardization: a documented sequence, left to right. */
export function SequenceIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <Node cx={5} cy={12} />
      <Node cx={12} cy={12} />
      <path d="m16.5 9.5 2 2.5-2 2.5" />
    </Svg>
  );
}

/** In-house department: a small interconnected team cluster. */
export function ClusterIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 8 8 16M16 8 16 16M8 8 16 8M8 16 16 16M8 8 16 16M16 8 8 16" />
      <Node cx={8} cy={8} />
      <Node cx={16} cy={8} />
      <Node cx={8} cy={16} />
      <Node cx={16} cy={16} />
    </Svg>
  );
}

/** SME OS platform: a hub with four connected satellites. */
export function HubIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 12 12 4.5M12 12 19.5 12M12 12 12 19.5M12 12 4.5 12" />
      <Node cx={12} cy={12} />
      <Node cx={12} cy={4.5} />
      <Node cx={19.5} cy={12} />
      <Node cx={12} cy={19.5} />
      <Node cx={4.5} cy={12} />
    </Svg>
  );
}

/** Genuine partnership: two nodes bound by a committed link. */
export function BondIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 12h5.2M12.8 12H18" />
      <Node cx={6} cy={12} />
      <Node cx={18} cy={12} />
      <path d="m9.6 9 2.4 3 2.4-3" />
    </Svg>
  );
}

/** Standardize to scale: one source replicated into many. */
export function ReplicateIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 12 15 6M6 12 15 12M6 12 15 18" />
      <Node cx={6} cy={12} />
      <Node cx={15} cy={6} />
      <Node cx={15} cy={12} />
      <Node cx={15} cy={18} />
    </Svg>
  );
}

/** Sustainable growth: nodes ascending toward the top right. */
export function AscendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 18 10.5 12.5 14.5 15.5 20 8" />
      <path d="M15 8h5v5" />
      <Node cx={5} cy={18} />
      <Node cx={10.5} cy={12.5} />
      <Node cx={14.5} cy={15.5} />
      <Node cx={20} cy={8} />
    </Svg>
  );
}

/** Testimonial quote mark, geometric rather than a literal glyph. */
export function QuoteMarkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 15 9 7M13 15 17 7" />
    </Svg>
  );
}
