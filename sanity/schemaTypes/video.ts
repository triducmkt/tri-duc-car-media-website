import { defineType, defineField } from "sanity";

/** Videos shown in the "Kênh của Trí Đức" hub (components/channels/ChannelOrbit.tsx).
 *  Paste a YouTube / Facebook link OR upload a file. While no video exists
 *  here the site shows the curated YouTube shorts in lib/channels.ts. */
export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "localizedString", validation: (r) => r.required() }),
    defineField({
      name: "url",
      title: "Link YouTube hoặc Facebook",
      description: "Dán link video/short YouTube hoặc link video Facebook. Bỏ trống nếu tải file lên bên dưới.",
      type: "url",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "file",
      title: "Hoặc tải file video lên",
      description: "MP4, nên dưới 30 MB để trang tải nhanh.",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
    }),
    defineField({
      name: "vertical",
      title: "Video dọc (9:16)",
      description: "Bật cho short/reels. Tắt cho video ngang 16:9.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "topic",
      title: "Chủ đề",
      type: "string",
      options: {
        list: [
          { title: "Vận hành", value: "van-hanh" },
          { title: "Khách hàng", value: "khach-hang" },
          { title: "Dòng tiền", value: "dong-tien" },
          { title: "Marketing", value: "marketing" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "order",
      title: "Thứ tự",
      description: "Số nhỏ hiện trước.",
      type: "number",
    }),
  ],
  validation: (r) =>
    r.custom((doc) => (doc?.url || doc?.file ? true : "Cần dán link hoặc tải file video lên.")),
  preview: { select: { title: "title.vi", subtitle: "url" } },
});
