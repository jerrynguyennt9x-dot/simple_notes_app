import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Tạo URL tải lên ảnh
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Bạn cần đăng nhập để tải lên ảnh");
    }

    // Tạo URL có thể sử dụng để tải lên ảnh trực tiếp từ browser
    return await ctx.storage.generateUploadUrl();
  },
});

// Gắn ảnh vào ghi chú
export const addImageToNote = mutation({
  args: {
    noteId: v.id("notes"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { noteId, storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Không được phép");
    }

    // Lấy ghi chú
    const note = await ctx.db.get(noteId);
    if (!note) {
      throw new ConvexError("Không tìm thấy ghi chú");
    }

    // Kiểm tra quyền sở hữu ghi chú
    if (note.authorId !== userId) {
      throw new ConvexError("Bạn không có quyền chỉnh sửa ghi chú này");
    }

    // Thêm ảnh vào ghi chú
    const images = note.images || [];
    await ctx.db.patch(noteId, {
      images: [...images, storageId],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Xóa ảnh khỏi ghi chú
export const removeImageFromNote = mutation({
  args: {
    noteId: v.id("notes"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { noteId, storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Không được phép");
    }

    // Lấy ghi chú
    const note = await ctx.db.get(noteId);
    if (!note) {
      throw new ConvexError("Không tìm thấy ghi chú");
    }

    // Kiểm tra quyền sở hữu ghi chú
    if (note.authorId !== userId) {
      throw new ConvexError("Bạn không có quyền chỉnh sửa ghi chú này");
    }

    // Xóa ảnh khỏi ghi chú
    if (note.images) {
      await ctx.db.patch(noteId, {
        images: note.images.filter(id => id !== storageId),
        updatedAt: Date.now(),
      });

      // Xóa tệp ảnh khỏi lưu trữ nếu không còn được tham chiếu bởi ghi chú nào
      await ctx.storage.delete(storageId);
    }

    return { success: true };
  },
});

// Lấy URL để xem ảnh
export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
