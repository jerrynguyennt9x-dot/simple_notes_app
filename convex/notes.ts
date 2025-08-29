import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
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

export const create = mutation({
  args: {
    content: v.string(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const hashtags = extractHashtags(args.content);
    const date = args.date || new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại nếu không được cung cấp
    
    return await ctx.db.insert("notes", {
      content: args.content,
      authorId: userId,
      updatedAt: now,
      hashtags,
      date,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    content: v.string(),
    date: v.optional(v.string()),
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
