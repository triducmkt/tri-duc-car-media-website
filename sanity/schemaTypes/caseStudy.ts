import { defineType, defineField } from "sanity";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
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
    defineField({ name: "clientName", title: "Tên khách hàng", type: "string" }),
    defineField({ name: "industry", title: "Ngành nghề", type: "localizedString" }),
    defineField({ name: "summary", title: "Tóm tắt", type: "localizedText", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Nội dung chi tiết", type: "localizedBlockContent" }),
    defineField({ name: "coverImage", title: "Ảnh bìa", type: "image", options: { hotspot: true } }),
    defineField({
      name: "clientLogo",
      title: "Logo khách hàng",
      description: "Hiển thị dạng huy hiệu nhỏ trên ảnh bìa và trang chi tiết — nên dùng ảnh nền trong suốt.",
      type: "image",
    }),
    defineField({ name: "publishedAt", title: "Ngày đăng", type: "datetime" }),
  ],
  preview: {
    select: { title: "title.vi", subtitle: "clientName", media: "coverImage" },
  },
});
