import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LightHero } from "@/components/home/LightHero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { Footer } from "@/components/Footer";

/** TRIAL page for anh Đức (brief 12/11/2026, docs/DESIGN-BRIEF.md):
 *  light mesh hero + light footer, next to the real services grid, so the
 *  light direction can be compared with the live dark homepage. Not linked,
 *  not indexed. The site layout still renders the normal dark footer below. */
export const metadata: Metadata = {
  title: "Bản thử nền sáng",
  robots: { index: false, follow: false },
};

export default async function HeroLightPreview({ params }: { params: Promise<{ locale: "vi" | "en" }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LightHero />
      <ServicesGrid />
      <div className="bg-paper-soft py-3 text-center text-xs font-semibold text-ink-muted">
        Bản thử footer nền sáng ↓ (bên dưới nữa là footer tối đang chạy)
      </div>
      <Footer tone="light" />
    </>
  );
}
