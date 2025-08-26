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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    if (!args.searchTerm.trim()) {
      return await ctx.db
        .query("notes")
        .withIndex("by_author_and_updated", (q) => q.eq("authorId", userId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.searchTerm).eq("authorId", userId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    return await ctx.db.insert("notes", {
      content: args.content,
      authorId: userId,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    content: v.string(),
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

    await ctx.db.patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });
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
