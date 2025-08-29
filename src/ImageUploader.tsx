import React, { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "./components/ui/button";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  noteId?: Id<"notes">;
  onImageUpload?: (storageId: Id<"_storage">) => void;
  existingImages?: Id<"_storage">[];
  className?: string;
}

export function ImageUploader({ 
  noteId, 
  onImageUpload, 
  existingImages = [], 
  className = "" 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const addImageToNote = useMutation(api.images.addImageToNote);
  const removeImageFromNote = useMutation(api.images.removeImageFromNote);

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (tối đa 5MB)");
      return;
    }

    // Kiểm tra định dạng file
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Định dạng không được hỗ trợ (chỉ hỗ trợ JPEG, PNG, GIF, WEBP)");
      return;
    }

    try {
      setIsUploading(true);
      
      // Bước 1: Lấy URL tải lên
      const uploadUrl = await generateUploadUrl();
      
      // Bước 2: Tải file lên
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error("Không thể tải ảnh lên");
      }
      
      // Bước 3: Lấy ID của tệp đã tải lên
      const { storageId } = await result.json();
      
      // Bước 4: Liên kết ảnh với ghi chú (nếu có noteId)
      if (noteId) {
        await addImageToNote({ noteId, storageId });
      }
      
      // Gọi callback (nếu có)
      if (onImageUpload) {
        onImageUpload(storageId);
      }

      toast.success("Tải ảnh lên thành công");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Reset input file để có thể tải lại cùng một file
      event.target.value = '';
    }
  }, [generateUploadUrl, addImageToNote, noteId, onImageUpload]);

  const handleRemove = useCallback(async (storageId: Id<"_storage">) => {
    if (!noteId) return;
    
    try {
      await removeImageFromNote({ noteId, storageId });
      toast.success("Đã xóa ảnh");
    } catch (error) {
      toast.error("Không thể xóa ảnh");
      console.error("Remove error:", error);
    }
  }, [removeImageFromNote, noteId]);

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <label className="cursor-pointer">
          <div className={`flex items-center gap-1 px-2 py-1 border rounded-md hover:bg-gray-50 ${isUploading ? 'opacity-50' : ''}`}>
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            <span className="text-sm">Thêm ảnh</span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={isUploading}
          />
        </label>
      </div>

      {existingImages && existingImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {existingImages.map((storageId) => (
            <ImagePreview 
              key={storageId.toString()}
              storageId={storageId}
              onRemove={noteId ? () => handleRemove(storageId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ImagePreviewProps {
  storageId: Id<"_storage">;
  onRemove?: () => void;
  size?: "small" | "medium" | "large";
}

export function ImagePreview({ storageId, onRemove, size = "medium" }: ImagePreviewProps) {
  const imageUrl = useQuery(api.images.getImageUrl, { storageId });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Kích thước dựa trên tham số size
  const sizeClasses = {
    small: "h-16 w-16",
    medium: "h-24 w-24",
    large: "h-40 w-40",
  };
  
  if (!imageUrl) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded flex items-center justify-center`}>
        <Loader2 size={24} className="text-gray-400 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded flex items-center justify-center`}>
        <ImageIcon size={24} className="text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className={`group relative ${sizeClasses[size]} overflow-hidden rounded-md border`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader2 size={24} className="text-gray-400 animate-spin" />
        </div>
      )}
      <img
        src={imageUrl}
        alt="Note attachment"
        className={`h-full w-full object-cover transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 bg-white bg-opacity-80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove image"
        >
          <X size={14} className="text-gray-700" />
        </button>
      )}
    </div>
  );
}
