import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  notes: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    updatedAt: v.number(),
    date: v.optional(v.string()), // Để lưu trữ ngày tháng theo định dạng ISO
    hashtags: v.optional(v.array(v.string())), // Để lưu trữ danh sách các hashtag
  })
    .index("by_author", ["authorId"])
    .index("by_author_and_updated", ["authorId", "updatedAt"])
    .index("by_hashtag", ["authorId", "hashtags"])
    .index("by_date", ["authorId", "date"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["authorId", "hashtags"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
