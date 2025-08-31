import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Tạo URL tải lên ảnh
export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Bạn cần đăng nhập để tải lên ảnh");
    }

    try {
      // Tạo URL có thể sử dụng để tải lên ảnh trực tiếp từ browser
      return await ctx.storage.generateUploadUrl();
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw new ConvexError("Không thể tạo URL tải lên, vui lòng thử lại");
    }
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

    try {
      // Kiểm tra xem ảnh đã tồn tại trong lưu trữ chưa
      const storageExists = await ctx.storage.getMetadata(storageId).then(() => true).catch(() => false);
      if (!storageExists) {
        throw new ConvexError("Không tìm thấy ảnh trong hệ thống");
      }

      // Thêm ảnh vào ghi chú
      const images = note.images || [];
      // Kiểm tra xem ảnh đã được thêm vào ghi chú chưa
      if (images.includes(storageId)) {
        return { success: true, message: "Ảnh đã tồn tại trong ghi chú" };
      }
      
      await ctx.db.patch(noteId, {
        images: [...images, storageId],
        updatedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding image to note:", error);
      throw new ConvexError("Không thể thêm ảnh vào ghi chú");
    }
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

    try {
      // Xóa ảnh khỏi ghi chú
      if (note.images) {
        await ctx.db.patch(noteId, {
          images: note.images.filter(id => id !== storageId),
          updatedAt: Date.now(),
        });

        // Kiểm tra xem ảnh có được sử dụng bởi các ghi chú khác không
        const otherNotes = await ctx.db
          .query("notes")
          .collect()
          .then(notes => notes.filter(n => n._id !== noteId));
          
        const isUsedElsewhere = otherNotes.some(n => 
          n.images && n.images.includes(storageId)
        );
        
        // Chỉ xóa ảnh khỏi lưu trữ nếu không còn được tham chiếu bởi ghi chú nào khác
        if (!isUsedElsewhere) {
          await ctx.storage.delete(storageId);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing image from note:", error);
      throw new ConvexError("Không thể xóa ảnh khỏi ghi chú");
    }
  },
});

// Lấy URL để xem ảnh
export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    try {
      return await ctx.storage.getUrl(storageId);
    } catch (error) {
      console.error("Error getting image URL:", error);
      return null;
    }
  },
});

// Lấy tất cả ảnh của người dùng
export const getUserImages = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    try {
      // Lấy tất cả ghi chú của người dùng
      const userNotes = await ctx.db
        .query("notes")
        .withIndex("by_author", q => q.eq("authorId", userId))
        .collect();
      
      // Tạo danh sách các ID ảnh duy nhất
      const uniqueImageIds = new Set<string>();
      userNotes.forEach(note => {
        if (note.images && note.images.length > 0) {
          note.images.forEach(imageId => uniqueImageIds.add(imageId));
        }
      });
      
      return Array.from(uniqueImageIds);
    } catch (error) {
      console.error("Error getting user images:", error);
      return [];
    }
  },
});
