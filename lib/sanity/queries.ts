import { sanityClient, isSanityConfigured } from "./client";
import type { CaseStudy, BlogPost, Testimonial } from "./types";
import { FALLBACK_VIDEOS, videoSource, type ChannelVideo, type VideoTopic } from "@/lib/channels";

const caseStudyProjection = `{
  _id,
  "slug": slug.current,
  title,
  clientName,
  industry,
  summary,
  isOngoing,
  dataAsOf,
  stats,
  links,
  body,
  coverImage,
  clientLogo,
  publishedAt
}`;

const blogPostProjection = `{
  _id,
  _updatedAt,
  "slug": slug.current,
  title,
  excerpt,
  body,
  coverImage,
  publishedAt,
  author,
  category,
  tags,
  sourceUrl,
  seoTitle,
  seoDescription,
  focusKeyword
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

type SanityVideo = {
  _id: string;
  title?: { vi?: string; en?: string };
  url?: string;
  fileUrl?: string;
  vertical?: boolean;
  topic?: VideoTopic;
};

/** Videos for the channel hub; falls back to the curated YouTube shorts. */
export async function getChannelVideos(locale: "vi" | "en"): Promise<ChannelVideo[]> {
  const rows = await safeFetch<SanityVideo[]>(
    `*[_type == "video" && (defined(url) || defined(file))] | order(coalesce(order, 999) asc, _createdAt desc)[0...24]{
      _id, title, url, "fileUrl": file.asset->url, vertical, topic
    }`,
    {},
    [],
  );
  const videos = rows
    .map((r) => ({
      id: r._id,
      title: r.title?.[locale] || r.title?.vi || "",
      url: r.url,
      fileUrl: r.fileUrl,
      vertical: r.vertical ?? true,
      topic: r.topic,
    }))
    .filter((v) => videoSource(v));
  return videos.length > 0 ? videos : FALLBACK_VIDEOS;
}
