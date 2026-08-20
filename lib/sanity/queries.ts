import { sanityClient, isSanityConfigured } from "./client";
import type { CaseStudy, BlogPost, Testimonial } from "./types";

const caseStudyProjection = `{
  _id,
  "slug": slug.current,
  title,
  clientName,
  industry,
  summary,
  body,
  coverImage,
  publishedAt
}`;

const blogPostProjection = `{
  _id,
  "slug": slug.current,
  title,
  excerpt,
  body,
  coverImage,
  publishedAt
}`;

const testimonialProjection = `{
  _id,
  authorName,
  authorRole,
  quote,
  avatar
}`;

async function safeFetch<T>(query: string, params: Record<string, unknown> = {}, fallback: T): Promise<T> {
  if (!isSanityConfigured) return fallback;
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch (error) {
    console.error("Sanity fetch failed:", error);
    return fallback;
  }
}

export function getCaseStudies() {
  return safeFetch<CaseStudy[]>(
    `*[_type == "caseStudy"] | order(publishedAt desc) ${caseStudyProjection}`,
    {},
    [],
  );
}

export function getFeaturedCaseStudies(limit = 3) {
  return safeFetch<CaseStudy[]>(
    `*[_type == "caseStudy"] | order(publishedAt desc)[0...$limit] ${caseStudyProjection}`,
    { limit },
    [],
  );
}

export function getCaseStudyBySlug(slug: string) {
  return safeFetch<CaseStudy | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0] ${caseStudyProjection}`,
    { slug },
    null,
  );
}

export function getBlogPosts() {
  return safeFetch<BlogPost[]>(
    `*[_type == "blogPost"] | order(publishedAt desc) ${blogPostProjection}`,
    {},
    [],
  );
}

export function getBlogPostBySlug(slug: string) {
  return safeFetch<BlogPost | null>(
    `*[_type == "blogPost" && slug.current == $slug][0] ${blogPostProjection}`,
    { slug },
    null,
  );
}

export function getTestimonials() {
  return safeFetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(_createdAt desc) ${testimonialProjection}`,
    {},
    [],
  );
}
