import { useState, useRef, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Search, Plus, Edit, Trash2, Save, X, Clock, RefreshCw, Calendar, Hash, Share2 } from "lucide-react";
import { ShareNoteDialog } from "./ShareNoteDialog";
import { ImageUploader, ImagePreview } from "./ImageUploader";

import { formatContentWithHashtags, formatTime, formatTimeWithHours } from "./utils.tsx";

export function NotesApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "updated">("updated");
  const [editingId, setEditingId] = useState<Id<"notes"> | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHashtag, setSelectedHashtag] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [sharingNoteId, setSharingNoteId] = useState<Id<"notes"> | null>(null);
  const [newNoteImages, setNewNoteImages] = useState<Id<"_storage">[]>([]);
  const [newNoteTags, setNewNoteTags] = useState<string[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  // Tìm kiếm ghi chú với tham số ngày và hashtag
  const notes = useQuery(api.notes.search, { 
    searchTerm,
    date: selectedDate,
    hashtag: selectedHashtag,
    tag: selectedTag
  }) || [];
  
  // Lấy tất cả các tags của người dùng
  const allUserTags = useQuery(api.notes.getAllUserTags) || [];
  
  // Trích xuất tất cả các hashtag từ các ghi chú
  const hashtags = useMemo(() => {
    const allHashtags = new Set<string>();
    notes.forEach(note => {
      const matches = note.content.match(/#(\w+)/g) || [];
      matches.forEach(tag => allHashtags.add(tag));
    });
    return Array.from(allHashtags);
  }, [notes]);
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);

  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
    }
  }, [editingId]);

  const handleCreateNote = async () => {
    // Cho phép tạo ghi chú nếu có nội dung hoặc ảnh
    if (!newNoteContent.trim() && newNoteImages.length === 0) return;
    
    // Lưu trữ tạm thời trạng thái để reset sau khi tạo
    const currentContent = newNoteContent.trim();
    const currentImages = [...newNoteImages];
    const currentDate = noteDate;
    const currentTags = [...newNoteTags];
    
    try {
      // Reset form trước để người dùng có thể tiếp tục viết ghi chú mới
      setNewNoteContent("");
      setNewNoteImages([]);
      setNewNoteTags([]);
      setNewTag("");
      
      // Hiển thị toast đang tạo ghi chú
      const toastId = toast.loading("Đang tạo ghi chú...");
      
      // Tạo note mới với nội dung và ngày cơ bản trước
      const noteIdResult = await createNote({ 
        content: currentContent,
        date: currentDate,
        // Chỉ gửi images nếu có hình ảnh
        ...(currentImages.length > 0 ? { images: currentImages } : {}),
        tags: currentTags
      });
      
      // Cập nhật toast thành công
      toast.success("Ghi chú đã được tạo!", { id: toastId });
    } catch (error: any) {
      // Khôi phục dữ liệu nếu có lỗi
      setNewNoteContent(currentContent);
      setNewNoteImages(currentImages);
      setNoteDate(currentDate);
      setNewNoteTags(currentTags);
      
      // Hiển thị lỗi
      toast.error(`Lỗi khi tạo ghi chú: ${error.message || 'Đã xảy ra lỗi'}`);
      console.error("Create note error:", error);
    }
  };

  const handleUpdateNote = async (id: Id<"notes">, date?: string, images?: Id<"_storage">[]) => {
    // Cho phép cập nhật nếu có nội dung hoặc ảnh
    if (!editContent.trim() && (!images || images.length === 0)) return;
    
    try {
      await updateNote({ 
        id, 
        content: editContent.trim(),
        date: date || noteDate,
        images: images,
        tags: editTags
      });
      setEditingId(null);
      setEditContent("");
      setEditTags([]);
      toast.success("Note updated!");
    } catch (error) {
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (id: Id<"notes">) => {
    try {
      await deleteNote({ id });
      toast.success("Note deleted!");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const startEditing = (note: any) => {
    setEditingId(note._id);
    setEditContent(note.content);
    setNoteDate(note.date || new Date().toISOString().split('T')[0]);
    setEditTags(note.tags || []);
  };
  
  // Highlight hashtags khi nhập
  const highlightHashtags = (text: string) => {
    // Tự động thêm khoảng trắng sau hashtag khi gõ
    if (text.endsWith(' #')) {
      return text.slice(0, -1) + '# ';
    }
    return text;
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
    setEditTags([]);
  };
  
  // Thêm tag mới cho note
  const addTag = (tagToAdd: string, isNewNote: boolean = true) => {
    if (!tagToAdd.trim()) return;
    
    const normalizedTag = tagToAdd.trim().toLowerCase();
    
    if (isNewNote) {
      if (!newNoteTags.includes(normalizedTag)) {
        setNewNoteTags([...newNoteTags, normalizedTag]);
      }
    } else {
      if (!editTags.includes(normalizedTag)) {
        setEditTags([...editTags, normalizedTag]);
      }
    }
    setNewTag("");
  };
  
  // Xóa tag
  const removeTag = (tagToRemove: string, isNewNote: boolean = true) => {
    if (isNewNote) {
      setNewNoteTags(newNoteTags.filter(tag => tag !== tagToRemove));
    } else {
      setEditTags(editTags.filter(tag => tag !== tagToRemove));
    }
  };
  
  // Xử lý khi nhấn Enter trong input tag
  const handleTagKeyDown = (e: React.KeyboardEvent, isNewNote: boolean = true) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag(newTag, isNewNote);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create new note */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <Textarea
          ref={newNoteRef}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(highlightHashtags(e.target.value))}
          placeholder="What's on your mind? Use #hashtags to categorize your notes"
          className="w-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleCreateNote();
            }
          }}
        />
        <div className="flex flex-col space-y-3 mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-muted-foreground" />
              <Input 
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="w-auto h-8 py-0 px-2"
              />
            </div>
            
            <ImageUploader 
              onImageUpload={(storageId) => setNewNoteImages(prev => [...prev, storageId])} 
              existingImages={newNoteImages}
            />
            
            {newNoteContent.length > 0 && (
              <Badge variant="outline" className="font-normal">
                {newNoteContent.length} characters
              </Badge>
            )}
          </div>
          
          {/* Thêm tags cho ghi chú */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md px-2 py-1 flex-grow">
                <Hash size={16} className="text-muted-foreground mr-2" />
                <Input 
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => handleTagKeyDown(e, true)}
                  placeholder="Thêm tag..."
                  className="border-none h-7 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2" 
                  onClick={() => addTag(newTag, true)}
                  disabled={!newTag.trim()}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            {newNoteTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {newNoteTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1">
                    <Hash size={12} className="mr-1" />
                    {tag}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 h-4 w-4 p-0 text-muted-foreground rounded-full hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => removeTag(tag, true)}
                    >
                      <X size={10} />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Hiển thị ảnh đã tải lên */}
          {newNoteImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newNoteImages.map(imageId => (
                <ImagePreview 
                  key={imageId.toString()}
                  storageId={imageId}
                  size="small"
                  onRemove={() => setNewNoteImages(prev => prev.filter(id => id !== imageId))}
                />
              ))}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim() && newNoteImages.length === 0}
              className="gap-2"
            >
              <Plus size={16} />
              Create Note
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedHashtag(""); // Clear hashtag filter when searching
                setSelectedDate(""); // Clear date filter when searching
              }}
              placeholder="Search notes or type # to search by hashtag..."
              className="pl-9 pr-4"
            />
          </div>
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "created" | "updated")}
              className="appearance-none bg-background border border-input rounded-md h-10 pl-4 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="updated">Latest updated</option>
              <option value="created">Latest created</option>
            </select>
            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          </div>
        </div>

        {/* Filters - Date, Hashtags, and Tags */}
        <div className="flex flex-wrap gap-2">
          {/* Date filter */}
          <div className="flex items-center">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSearchTerm("");
                setSelectedHashtag("");
                setSelectedTag("");
              }}
              className="w-auto h-8 py-0 px-2"
              placeholder="Filter by date..."
            />
            {selectedDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedDate("")}
                className="h-8 w-8 p-0 ml-1"
              >
                <X size={14} />
              </Button>
            )}
          </div>

          {/* Hashtag filters */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag) => (
                <Badge 
                  key={tag}
                  variant={selectedHashtag === tag.slice(1) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    if (selectedHashtag === tag.slice(1)) {
                      setSelectedHashtag("");
                    } else {
                      setSelectedHashtag(tag.slice(1));
                      setSearchTerm("");
                      setSelectedDate("");
                      setSelectedTag("");
                    }
                  }}
                >
                  <Hash size={12} className="mr-1" />
                  {tag.slice(1)}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Tag filters */}
          {allUserTags && allUserTags.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-2">
              {allUserTags.map((tag) => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    if (selectedTag === tag) {
                      setSelectedTag("");
                    } else {
                      setSelectedTag(tag);
                      setSearchTerm("");
                      setSelectedDate("");
                      setSelectedHashtag("");
                    }
                  }}
                >
                  <Hash size={12} className="mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {(selectedDate || selectedHashtag || selectedTag) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedDate("");
                setSelectedHashtag("");
                setSelectedTag("");
              }}
              className="ml-auto text-muted-foreground text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-muted rounded-lg">
            <div className="text-muted-foreground text-6xl mb-4">📝</div>
            <p className="text-muted-foreground text-lg font-medium">
              {searchTerm ? "No notes found" : "No notes yet"}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {searchTerm ? "Try a different search term" : "Create your first note above"}
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === note._id ? (
                <div className="space-y-3">
                  <Textarea
                    ref={editRef}
                    value={editContent}
                    onChange={(e) => setEditContent(highlightHashtags(e.target.value))}
                    className="w-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                    rows={Math.max(3, editContent.split('\n').length)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleUpdateNote(note._id, note.date);
                      }
                      if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                  />
                  <div className="flex flex-col space-y-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-muted-foreground" />
                        <Input 
                          type="date"
                          defaultValue={note.date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setNoteDate(e.target.value)}
                          className="w-auto h-8 py-0 px-2"
                        />
                      </div>
                      <ImageUploader
                        noteId={note._id}
                        existingImages={note.images || []}
                      />
                      <Badge variant="outline" className="font-normal">
                        {editContent.length} characters
                      </Badge>
                    </div>
                    
                    {/* Thêm tags cho ghi chú */}
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md px-2 py-1 flex-grow">
                          <Hash size={16} className="text-muted-foreground mr-2" />
                          <Input 
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => handleTagKeyDown(e, false)}
                            placeholder="Thêm tag..."
                            className="border-none h-7 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2" 
                            onClick={() => addTag(newTag, false)}
                            disabled={!newTag.trim()}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                      {editTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {editTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="px-2 py-1">
                              <Hash size={12} className="mr-1" />
                              {tag}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-1 h-4 w-4 p-0 text-muted-foreground rounded-full hover:bg-destructive/20 hover:text-destructive"
                                onClick={() => removeTag(tag, false)}
                              >
                                <X size={10} />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateNote(note._id, note.date, note.images)}
                        disabled={!editContent.trim() && (!note.images || note.images.length === 0)}
                      >
                        <Save size={16} className="mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-foreground text-lg leading-relaxed whitespace-pre-wrap mb-3">
                    {/* Hiển thị nội dung với các hashtag được highlight */}
                    {formatContentWithHashtags(note.content, (hashtag) => {
                      setSelectedHashtag(hashtag);
                      setSearchTerm("");
                      setSelectedDate("");
                    })}
                  </div>
                  
                  {/* Hiển thị ảnh đính kèm */}
                  {note.images && note.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 my-3">
                      {note.images.map((imageId) => (
                        <ImagePreview 
                          key={imageId.toString()}
                          storageId={imageId}
                          size="medium"
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Hiển thị ngày tháng và tags */}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {note.date && (
                      <Badge variant="secondary" className="font-normal flex items-center gap-1">
                        <Calendar size={12} /> {new Date(note.date).toLocaleDateString()}
                      </Badge>
                    )}
                    {note.tags && note.tags.length > 0 && note.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary/80 font-normal"
                        onClick={() => {
                          setSelectedTag(tag);
                          setSelectedHashtag("");
                          setSearchTerm("");
                          setSelectedDate("");
                        }}
                      >
                        <Hash size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-normal flex items-center gap-1">
                        <Clock size={12} /> Created {formatTimeWithHours(note._creationTime)}
                      </Badge>
                      {note.updatedAt !== note._creationTime && (
                        <Badge variant="outline" className="font-normal flex items-center gap-1">
                          <RefreshCw size={12} /> Updated {formatTimeWithHours(note.updatedAt)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => startEditing(note)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSharingNoteId(note._id)}
                        className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      >
                        <Share2 size={16} className="mr-1" /> Share
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="mr-1" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Note</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this note? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('cancel-delete-dialog')?.click()}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => {
                                handleDeleteNote(note._id);
                                document.getElementById('cancel-delete-dialog')?.click();
                              }}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                          <button id="cancel-delete-dialog" className="hidden" />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* ShareNoteDialog */}
      {sharingNoteId && (
        <ShareNoteDialog 
          noteId={sharingNoteId}
          isOpen={!!sharingNoteId}
          onClose={() => setSharingNoteId(null)}
        />
      )}
    </div>
  );
}
