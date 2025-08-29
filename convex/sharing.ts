import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { nanoid } from "nanoid";
import { internal } from "./_generated/api";

// Tạo ID chia sẻ mới
function generateShareId() {
  return nanoid(10); // Tạo ID chia sẻ ngắn 10 ký tự
}

// Bật chia sẻ cho một ghi chú
export const enableSharing = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    // Tạo shareId mới nếu chưa có
    const shareId = note.shareId || generateShareId();

    await ctx.db.patch(args.noteId, {
      isShared: true,
      shareId,
    });

    return { shareId };
  },
});

// Tắt chia sẻ cho một ghi chú
export const disableSharing = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.noteId, {
      isShared: false,
    });

    return { success: true };
  },
});

// Chia sẻ ghi chú với một người dùng cụ thể (qua email)
export const shareWithUser = mutation({
  args: {
    noteId: v.id("notes"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    // Cập nhật hoặc thêm email vào danh sách chia sẻ
    const currentSharedWith = note.sharedWith || [];
    if (!currentSharedWith.includes(args.email)) {
      await ctx.db.patch(args.noteId, {
        isShared: true,
        shareId: note.shareId || generateShareId(),
        sharedWith: [...currentSharedWith, args.email],
      });
    }

    return { success: true };
  },
});

// Hủy chia sẻ với một người dùng cụ thể
export const unshareWithUser = mutation({
  args: {
    noteId: v.id("notes"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    if (note.sharedWith) {
      await ctx.db.patch(args.noteId, {
        sharedWith: note.sharedWith.filter(email => email !== args.email),
      });
    }

    return { success: true };
  },
});

// Lấy ghi chú được chia sẻ theo ID chia sẻ
export const getSharedNote = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_share_id", q => q.eq("shareId", args.shareId))
      .collect();

    if (notes.length === 0) {
      return null;
    }

    const note = notes[0];
    
    // Đảm bảo ghi chú được chia sẻ công khai
    if (!note.isShared) {
      return null;
    }

    // Ghi lại lượt xem
    const userId = await getAuthUserId(ctx);
    
    // Lưu dữ liệu lượt xem với internal action để không làm chậm API
    ctx.scheduler.runAfter(0, internal.sharing.recordView, {
      noteId: note._id,
      viewerId: userId || undefined,
    });

    return {
      ...note,
      isOwner: userId === note.authorId,
    };
  },
});

// Kiểm tra xem một ghi chú có được chia sẻ với người dùng hiện tại không
export const checkNoteAccess = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      return { hasAccess: false };
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      return { hasAccess: false };
    }

    // Chủ sở hữu luôn có quyền truy cập
    if (note.authorId === userId) {
      return { hasAccess: true, isOwner: true };
    }

    // Kiểm tra qua email
    const currentUser = await ctx.db.get(userId);
    if (!currentUser || !currentUser.email) {
      return { hasAccess: false };
    }

    // Kiểm tra xem email của người dùng có trong danh sách được chia sẻ không
    const isSharedWithUser = note.sharedWith && note.sharedWith.includes(currentUser.email);
    
    return { 
      hasAccess: isSharedWithUser, 
      isOwner: false,
      isShared: note.isShared
    };
  },
});

// Lấy danh sách những ghi chú được chia sẻ với người dùng hiện tại
export const getNotesSharedWithMe = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || !currentUser.email) {
      return [];
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_shared_with", q => q.contains("sharedWith", [currentUser.email]))
      .filter(q => q.eq(q.field("isShared"), true))
      .collect();
  },
});

// Lấy số lượng lượt xem của một ghi chú
export const getNoteViews = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Chỉ chủ sở hữu mới có thể xem số lượt xem
    if (note.authorId !== userId) {
      throw new Error("Not authorized");
    }

    const views = await ctx.db
      .query("noteViews")
      .withIndex("by_note", q => q.eq("noteId", args.noteId))
      .collect();

    // Đếm số lượng lượt xem duy nhất
    const uniqueIps = new Set(views.map(view => view.viewerIp));
    const uniqueViewers = new Set(views.filter(view => view.viewerId).map(view => view.viewerId));

    return {
      total: views.length,
      unique: uniqueIps.size,
      loggedInViewers: uniqueViewers.size,
    };
  },
});

// Internal mutation để ghi lại lượt xem ghi chú
export const recordView = action({
  args: {
    noteId: v.id("notes"),
    viewerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Lấy IP của người xem (mô phỏng vì action không có access IP)
    const viewerIp = "127.0.0.1"; // Trong thực tế, lấy IP từ request

    await ctx.runMutation(internal.sharing.saveView, {
      noteId: args.noteId,
      viewerId: args.viewerId,
      viewerIp
    });
  },
});

// Internal mutation để lưu thông tin xem
export const saveView = mutation({
  args: {
    noteId: v.id("notes"),
    viewerId: v.optional(v.id("users")),
    viewerIp: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("noteViews", {
      noteId: args.noteId,
      viewerId: args.viewerId,
      viewerIp: args.viewerIp,
      viewedAt: Date.now(),
    });
  },
});
