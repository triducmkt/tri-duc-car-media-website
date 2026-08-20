import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "authorName", title: "Tên khách hàng", type: "string", validation: (r) => r.required() }),
    defineField({ name: "authorRole", title: "Chức danh / Công ty", type: "localizedString" }),
    defineField({ name: "quote", title: "Nội dung nhận xét", type: "localizedText", validation: (r) => r.required() }),
    defineField({ name: "avatar", title: "Ảnh đại diện", type: "image", options: { hotspot: true } }),
  ],
  preview: {
    select: { title: "authorName", subtitle: "quote.vi", media: "avatar" },
  },
});
