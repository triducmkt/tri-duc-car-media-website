import { defineType, defineField, defineArrayMember } from "sanity";

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
    defineField({
      name: "isOngoing",
      title: "Đang đồng hành",
      description: "Bật nếu Trí Đức Car Media vẫn đang trực tiếp phụ trách truyền thông cho dự án này.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "dataAsOf",
      title: "Số liệu cập nhật đến",
      description: "Mốc thời gian của số liệu mới nhất, hiển thị trên trang chi tiết. Ví dụ: “Tháng 08/2026”.",
      type: "string",
    }),
    defineField({
      name: "stats",
      title: "Số liệu nổi bật",
      description: "Hiển thị dạng thẻ số liệu trên trang chi tiết (vd: Follower, Doanh thu, Lượt tiếp cận...).",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "label", title: "Nhãn", type: "localizedString", validation: (r) => r.required() }),
            defineField({ name: "value", title: "Giá trị", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "note",
              title: "Ghi chú tăng trưởng",
              description: "Ví dụ: “+144% so với T1/2024”.",
              type: "localizedString",
            }),
          ],
          preview: { select: { title: "value", subtitle: "label.vi" } },
        }),
      ],
    }),
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
