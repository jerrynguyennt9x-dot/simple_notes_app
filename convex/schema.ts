import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  notes: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_author_and_updated", ["authorId", "updatedAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["authorId"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
