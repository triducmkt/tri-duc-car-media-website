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

export type CaseStudyStat = {
  label: LocalizedString;
  value: string;
  note?: LocalizedString;
};

export type CaseStudyLink = {
  label: LocalizedString;
  url: string;
};

export type CaseStudy = {
  _id: string;
  slug: string;
  title: LocalizedString;
  clientName?: string;
  industry?: LocalizedString;
  summary: LocalizedString;
  isOngoing?: boolean;
  dataAsOf?: string;
  stats?: CaseStudyStat[];
  links?: CaseStudyLink[];
  body?: LocalizedBlockContent;
  coverImage?: SanityImage;
  clientLogo?: SanityImage;
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
