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
    tags: v.optional(v.array(v.string())), // Tags để phân loại ghi chú
    isShared: v.optional(v.boolean()), // Xác định ghi chú có được chia sẻ công khai hay không
    shareId: v.optional(v.string()), // ID chia sẻ duy nhất để truy cập ghi chú
    sharedWith: v.optional(v.array(v.string())), // Danh sách email người dùng được chia sẻ
    images: v.optional(v.array(v.id("_storage"))), // Danh sách ID của các ảnh được đính kèm
  })
    .index("by_author", ["authorId"])
    .index("by_author_and_updated", ["authorId", "updatedAt"])
    .index("by_hashtag", ["authorId", "hashtags"])
    .index("by_tags", ["authorId", "tags"])
    .index("by_date", ["authorId", "date"])
    .index("by_share_id", ["shareId"])
    .index("by_shared_with", ["sharedWith"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["authorId", "hashtags", "tags"],
    }),
    
  // Bảng lưu trữ các lượt xem ghi chú chia sẻ
  noteViews: defineTable({
    noteId: v.id("notes"),
    viewerId: v.optional(v.id("users")), // ID người xem (nếu đã đăng nhập)
    viewerIp: v.string(), // IP người xem
    viewedAt: v.number(), // Thời gian xem
  })
    .index("by_note", ["noteId"])
    .index("by_viewer", ["viewerId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
