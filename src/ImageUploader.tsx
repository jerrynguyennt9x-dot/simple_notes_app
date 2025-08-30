import React, { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "./components/ui/button";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, X, Loader2, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  noteId?: Id<"notes">;
  onImageUpload?: (storageId: Id<"_storage">) => void;
  existingImages?: Id<"_storage">[];
  className?: string;
  disabled?: boolean;
}

export function ImageUploader({ 
  noteId, 
  onImageUpload, 
  existingImages = [], 
  className = "",
  disabled = false 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const generateUploadUrl = useMutation(api.imageStore.generateUploadUrl);
  const addImageToNote = useMutation(api.imageStore.addImageToNote);
  const removeImageFromNote = useMutation(api.imageStore.removeImageFromNote);

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
      setUploadProgress(10);
      
      // Bước 1: Lấy URL tải lên
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(30);
      
      // Bước 2: Tải file lên với XMLHttpRequest để theo dõi tiến trình
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 60) + 30;
            setUploadProgress(Math.min(percentComplete, 90));
          }
        });
        
        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // Bước 3: Lấy ID của tệp đã tải lên
              const { storageId } = JSON.parse(xhr.responseText);
              setUploadProgress(95);
              
              // Bước 4: Liên kết ảnh với ghi chú (nếu có noteId)
              if (noteId) {
                await addImageToNote({ noteId, storageId });
              }
              
              // Gọi callback (nếu có)
              if (onImageUpload) {
                onImageUpload(storageId);
              }

              setUploadProgress(100);
              toast.success("Tải ảnh lên thành công");
              resolve();
            } catch (parseError) {
              console.error("Lỗi xử lý phản hồi:", parseError);
              toast.error("Lỗi xử lý phản hồi từ server");
              reject(parseError);
            }
          } else {
            const error = new Error(`Lỗi tải lên: ${xhr.status} ${xhr.statusText}`);
            console.error("Lỗi tải lên:", xhr.status, xhr.statusText);
            toast.error(`Lỗi khi tải ảnh lên: ${xhr.statusText || 'Không thể kết nối đến server'}`);
            reject(error);
          }
        });
        
        xhr.addEventListener("error", () => {
          const error = new Error("Lỗi kết nối mạng khi tải ảnh lên");
          console.error("Lỗi kết nối mạng:", error);
          toast.error("Lỗi kết nối mạng khi tải ảnh lên");
          reject(error);
        });
        
        xhr.addEventListener("abort", () => {
          const error = new Error("Tải lên bị hủy");
          console.error("Tải lên bị hủy:", error);
          toast.error("Tải ảnh lên bị hủy");
          reject(error);
        });
        
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error: any) {
      toast.error(`Lỗi khi tải ảnh lên: ${error.message || 'Đã xảy ra lỗi không xác định'}`);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        <label className={`cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
            disabled={isUploading || disabled}
          />
        </label>
        
        {isUploading && (
          <div className="flex-1 max-w-xs">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</div>
          </div>
        )}
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
  const imageUrl = useQuery(api.imageStore.getImageUrl, { storageId });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Kích thước dựa trên tham số size
  const sizeClasses = {
    small: "h-16 w-16",
    medium: "h-24 w-24",
    large: "h-40 w-40",
  };
  
  const handleRemove = async () => {
    if (!onRemove || isRemoving) return;
    
    try {
      setIsRemoving(true);
      await onRemove();
    } catch (error) {
      console.error("Error removing image:", error);
    } finally {
      setIsRemoving(false);
    }
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
        <AlertCircle size={24} className="text-red-400" />
        <span className="absolute bottom-0 text-xs text-red-500 bg-white bg-opacity-80 w-full text-center">
          Lỗi tải ảnh
        </span>
      </div>
    );
  }
  
  return (
    <div className={`group relative ${sizeClasses[size]} overflow-hidden rounded-md border ${isRemoving ? 'opacity-60' : ''}`}>
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
      
      {/* Overlay cho phép click xem ảnh đầy đủ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity cursor-pointer"
        onClick={() => window.open(imageUrl, '_blank')}
      />
      
      {onRemove && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`absolute top-1 right-1 p-1 bg-white bg-opacity-80 rounded-full shadow-sm 
            ${isRemoving ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
          title="Remove image"
        >
          {isRemoving ? (
            <Loader2 size={14} className="text-red-500 animate-spin" />
          ) : (
            <X size={14} className="text-gray-700" />
          )}
        </button>
      )}
    </div>
  );
}
