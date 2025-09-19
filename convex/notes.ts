import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const note = await ctx.db.get(args.id);
    if (!note) {
      return null;
    }

    // Chỉ trả về nếu là tác giả hoặc được chia sẻ
    if (note.authorId === userId) {
      return note;
    }

    // Kiểm tra xem người dùng có trong danh sách được chia sẻ không
    const user = await ctx.db.get(userId);
    if (user && user.email && note.sharedWith && note.sharedWith.includes(user.email)) {
      return note;
    }

    return null;
  },
});

export const list = query({
  args: {
    sortBy: v.optional(v.union(v.literal("created"), v.literal("updated"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sortBy = args.sortBy || "updated";
    
    if (sortBy === "created") {
      return await ctx.db
        .query("notes")
        .withIndex("by_author", (q) => q.eq("authorId", userId))
        .order("desc")
        .collect();
    } else {
      return await ctx.db
        .query("notes")
        .withIndex("by_author_and_updated", (q) => q.eq("authorId", userId))
        .order("desc")
        .collect();
    }
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
    hashtag: v.optional(v.string()),
    date: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Nếu có tag, tìm kiếm note có tag đó
    if (args.tag) {
      return await ctx.db
        .query("notes")
        .withIndex("by_author", (q) => q.eq("authorId", userId))
        .order("desc")
        .collect()
        .then(notes => notes.filter(note => note.tags && note.tags.includes(args.tag!)));
    }
    
    // Nếu có hashtag, tìm kiếm bằng cách tìm trong nội dung
    if (args.hashtag) {
      const hashtagTerm = `#${args.hashtag}`;
      return await ctx.db
        .query("notes")
        .withIndex("by_author", q => q.eq("authorId", userId))
        .order("desc")
        .collect()
        .then(notes => notes.filter(note => note.content.includes(hashtagTerm)));
    }

    // Nếu có date, tìm theo ngày
    if (args.date) {
      return await ctx.db
        .query("notes")
        .withIndex("by_author", (q) => q.eq("authorId", userId))
        .order("desc")
        .collect()
        .then(notes => notes.filter(note => note.date === args.date));
    }

    // Tìm theo nội dung
    if (!args.searchTerm.trim()) {
      return await ctx.db
        .query("notes")
        .withIndex("by_author_and_updated", (q) => q.eq("authorId", userId))
        .order("desc")
        .collect();
    }

    // Nếu search term bắt đầu với #, tìm theo hashtag trong nội dung
    if (args.searchTerm.startsWith('#')) {
      return await ctx.db
        .query("notes")
        .withIndex("by_author", q => q.eq("authorId", userId))
        .order("desc")
        .collect()
        .then(notes => notes.filter(note => note.content.includes(args.searchTerm)));
    }

    return await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.searchTerm).eq("authorId", userId)
      )
      .collect();
  },
});

// Hàm để trích xuất hashtags từ nội dung
function extractHashtags(content: string): string[] {
  // Regex tìm tất cả các hashtag trong nội dung
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(content)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  
  return [...new Set(hashtags)]; // Loại bỏ các hashtag trùng lặp
}

export const createNote = mutation({
  // Định nghĩa chính xác các tham số được phép
  args: {
    content: v.string(),
    date: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.optional(v.array(v.string())),
    mood: v.optional(v.object({
      emoji: v.string(),
      name: v.string()
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Vui lòng đăng nhập để tạo ghi chú");
    }

    const now = Date.now();
    const hashtags = extractHashtags(args.content);
    const date = args.date || new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại nếu không được cung cấp
    
    try {
      // Chuẩn bị dữ liệu cơ bản
      const noteData = {
        content: args.content,
        authorId: userId,
        updatedAt: now,
        hashtags,
        date,
        tags: args.tags || [],
      };
      
      // Thêm mood nếu có
      if (args.mood) {
        (noteData as any).mood = args.mood;
      }
      
      // Tạo ghi chú không kèm hình ảnh
      let noteId;
      
      // Chỉ thêm images vào note nếu có hình ảnh
      if (args.images && args.images.length > 0) {
        noteId = await ctx.db.insert("notes", {
          ...noteData,
          images: args.images
        });
      } else {
        noteId = await ctx.db.insert("notes", noteData);
      }
      
      return noteId;
    } catch (error) {
      console.error("Error creating note:", error);
      throw new Error("Không thể tạo ghi chú. Vui lòng thử lại sau.");
    }
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    content: v.string(),
    date: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.optional(v.array(v.string())),
    mood: v.optional(v.object({
      emoji: v.string(),
      name: v.string()
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    const hashtags = extractHashtags(args.content);
    const updateData: any = {
      content: args.content,
      updatedAt: Date.now(),
      hashtags,
    };
    
    if (args.date) {
      updateData.date = args.date;
    }

    if (args.images !== undefined) {
      updateData.images = args.images;
    }
    
    if (args.tags !== undefined) {
      updateData.tags = args.tags;
    }

    if (args.mood !== undefined) {
      updateData.mood = args.mood;
    }

    await ctx.db.patch(args.id, updateData);
  },
});

export const remove = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Hàm để lấy tất cả các tags của người dùng
export const getAllUserTags = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Lấy tất cả ghi chú của người dùng
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    // Tạo danh sách các tags duy nhất
    const uniqueTags = new Set<string>();
    notes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => uniqueTags.add(tag));
      }
    });

    return Array.from(uniqueTags);
  }
});
