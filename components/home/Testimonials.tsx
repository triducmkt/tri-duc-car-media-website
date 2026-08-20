import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import type { Testimonial } from "@/lib/sanity/types";

export function Testimonials({
  items,
  locale,
}: {
  items: Testimonial[];
  locale: "vi" | "en";
}) {
  const t = useTranslations("home");

  if (items.length === 0) return null;

  return (
    <section className="bg-paper-soft py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={t("testimonialsEyebrow")}
          heading={t("testimonialsHeading")}
          align="center"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item._id}
              className="flex flex-col gap-4 rounded-2xl bg-paper p-7 ring-1 ring-black/5"
            >
              <Quote className="text-brand-500" size={24} aria-hidden />
              <blockquote className="flex-1 text-sm leading-relaxed text-ink-muted">
                “{item.quote[locale] || item.quote.vi}”
              </blockquote>
              <figcaption className="flex flex-col">
                <span className="text-sm font-semibold text-ink">{item.authorName}</span>
                {item.authorRole ? (
                  <span className="text-xs text-ink-muted">
                    {item.authorRole[locale] || item.authorRole.vi}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
