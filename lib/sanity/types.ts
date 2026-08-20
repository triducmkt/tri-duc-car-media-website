import type { TypedObject } from "@portabletext/types";

export type LocalizedString = {
  vi: string;
  en: string;
};

export type LocalizedBlockContent = {
  vi?: TypedObject[];
  en?: TypedObject[];
};

export type SanityImage = {
  asset: { _ref: string; _type: "reference" };
  alt?: LocalizedString;
};

export type CaseStudy = {
  _id: string;
  slug: string;
  title: LocalizedString;
  clientName?: string;
  industry?: LocalizedString;
  summary: LocalizedString;
  body?: LocalizedBlockContent;
  coverImage?: SanityImage;
  publishedAt: string;
};

export type BlogPost = {
  _id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  body?: LocalizedBlockContent;
  coverImage?: SanityImage;
  publishedAt: string;
};

export type Testimonial = {
  _id: string;
  authorName: string;
  authorRole?: LocalizedString;
  quote: LocalizedString;
  avatar?: SanityImage;
};
