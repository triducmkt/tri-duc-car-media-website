import { defineType, defineField } from "sanity";

export const localizedString = defineType({
  name: "localizedString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({ name: "vi", title: "Tiếng Việt", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
  ],
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "vi", title: "Tiếng Việt", type: "text", rows: 4 }),
    defineField({ name: "en", title: "English", type: "text", rows: 4 }),
  ],
});

export const localizedBlockContent = defineType({
  name: "localizedBlockContent",
  title: "Localized rich text",
  type: "object",
  fields: [
    defineField({ name: "vi", title: "Tiếng Việt", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "en", title: "English", type: "array", of: [{ type: "block" }] }),
  ],
});
