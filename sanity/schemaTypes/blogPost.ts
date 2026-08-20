import { defineType, defineField } from "sanity";

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "localizedString", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.vi" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", title: "Mô tả ngắn", type: "localizedText", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Nội dung", type: "localizedBlockContent" }),
    defineField({ name: "coverImage", title: "Ảnh bìa", type: "image", options: { hotspot: true } }),
    defineField({ name: "publishedAt", title: "Ngày đăng", type: "datetime" }),
  ],
  preview: {
    select: { title: "title.vi", media: "coverImage" },
  },
});
