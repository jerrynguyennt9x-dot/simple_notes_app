import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams } from "react-router-dom";
import { Button } from "./components/ui/button";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { formatContentWithHashtags } from "./utils.tsx";
import { ImagePreview } from "./ImageUploader";

export function SharedNote() {
  const { shareId } = useParams<{ shareId: string }>();
  const note = useQuery(api.sharing.getSharedNote, { shareId: shareId || "" });
  
  if (!shareId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy mã chia sẻ</h1>
        <p className="text-muted-foreground mb-6">
          URL bị thiếu mã chia sẻ ghi chú.
        </p>
        <Button 
          variant="default" 
          onClick={() => window.location.href = "/"}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Button>
      </div>
    );
  }
  
  if (note === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (note === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Ghi chú không tồn tại</h1>
        <p className="text-muted-foreground mb-6">
          Ghi chú này có thể đã bị xóa hoặc không được chia sẻ công khai.
        </p>
        <Button 
          variant="default" 
          onClick={() => window.location.href = "/"}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Button 
        variant="outline" 
        onClick={() => window.location.href = "/"}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Button>
      
      <div className="bg-card border rounded-lg p-6 shadow-md">
        <div className="text-lg leading-relaxed whitespace-pre-wrap mb-4">
          {formatContentWithHashtags(note.content)}
        </div>
        
        {/* Hiển thị ảnh đính kèm */}
        {note.images && note.images.length > 0 && (
          <div className="flex flex-wrap gap-3 my-4">
            {note.images.map((imageId) => (
              <ImagePreview 
                key={imageId.toString()}
                storageId={imageId}
                size="large"
              />
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground border-t pt-4 mt-4">
          {note.date && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(note.date).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>Cập nhật lần cuối: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
