import { defineType, defineField } from "sanity";

// SEO rules these fields serve: docs/seo-content-standard.md
export const BLOG_CATEGORIES = [
  { title: "Hệ thống Marketing - Sales - CSKH", value: "he-thong" },
  { title: "Vận hành & SOP", value: "van-hanh" },
  { title: "Nội dung & đa kênh", value: "noi-dung" },
  { title: "Thương hiệu người chủ", value: "thuong-hieu" },
  { title: "Câu chuyện khách hàng", value: "khach-hang" },
];

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  groups: [
    { name: "content", title: "Nội dung", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Tiêu đề (H1)", type: "localizedString", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (không dấu, có từ khóa)",
      type: "slug",
      group: "content",
      options: { source: "title.vi" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", title: "Sapo / mô tả ngắn", type: "localizedText", group: "content", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Nội dung", type: "localizedBlockContent", group: "content" }),
    defineField({
      name: "coverImage",
      title: "Ảnh bìa",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text (mô tả ảnh, có từ khóa)", type: "localizedString" }],
    }),
    defineField({ name: "publishedAt", title: "Ngày đăng", type: "datetime", group: "content" }),
    defineField({ name: "author", title: "Tác giả", type: "string", group: "content", initialValue: "Tăng Trí Đức" }),
    defineField({
      name: "category",
      title: "Chuyên mục",
      type: "string",
      group: "content",
      options: { list: BLOG_CATEGORIES },
    }),
    defineField({ name: "tags", title: "Thẻ", type: "array", group: "content", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "sourceUrl", title: "Bài gốc (fanpage)", type: "url", group: "content" }),
    defineField({
      name: "seoTitle",
      title: "SEO title (≤ 60 ký tự, từ khóa ở đầu)",
      type: "localizedString",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description (140–160 ký tự)",
      type: "localizedText",
      group: "seo",
    }),
    defineField({ name: "focusKeyword", title: "Từ khóa chính", type: "string", group: "seo" }),
  ],
  orderings: [{ title: "Mới nhất", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title.vi", media: "coverImage", subtitle: "focusKeyword" },
  },
});
