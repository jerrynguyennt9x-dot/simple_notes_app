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
import { Search, Plus, Edit, Trash2, Save, X, Clock, RefreshCw, Calendar, Hash } from "lucide-react";

export function NotesApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "updated">("updated");
  const [editingId, setEditingId] = useState<Id<"notes"> | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHashtag, setSelectedHashtag] = useState<string>("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);

  // Tìm kiếm ghi chú với tham số ngày và hashtag
  const notes = useQuery(api.notes.search, { 
    searchTerm,
    date: selectedDate,
    hashtag: selectedHashtag
  }) || [];
  
  // Trích xuất tất cả các hashtag từ các ghi chú
  const hashtags = useMemo(() => {
    const allHashtags = new Set<string>();
    notes.forEach(note => {
      const matches = note.content.match(/#(\w+)/g) || [];
      matches.forEach(tag => allHashtags.add(tag));
    });
    return Array.from(allHashtags);
  }, [notes]);
  const createNote = useMutation(api.notes.create);
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
    if (!newNoteContent.trim()) return;
    
    try {
      await createNote({ 
        content: newNoteContent.trim(),
        date: noteDate
      });
      setNewNoteContent("");
      toast.success("Note created!");
    } catch (error) {
      toast.error("Failed to create note");
    }
  };

  const handleUpdateNote = async (id: Id<"notes">, date?: string) => {
    if (!editContent.trim()) return;
    
    try {
      await updateNote({ 
        id, 
        content: editContent.trim(),
        date: date || noteDate
      });
      setEditingId(null);
      setEditContent("");
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
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
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
        <div className="flex flex-wrap justify-between items-center mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-muted-foreground" />
              <Input 
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="w-auto h-8 py-0 px-2"
              />
            </div>
            {newNoteContent.length > 0 && (
              <Badge variant="outline" className="font-normal">
                {newNoteContent.length} characters
              </Badge>
            )}
          </div>
          <Button
            onClick={handleCreateNote}
            disabled={!newNoteContent.trim()}
            className="gap-2"
          >
            <Plus size={16} />
            Create Note
          </Button>
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

        {/* Filters - Date and Hashtags */}
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
                  }
                }}
              >
                <Hash size={12} className="mr-1" />
                {tag.slice(1)}
              </Badge>
            ))}
          </div>

          {(selectedDate || selectedHashtag) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedDate("");
                setSelectedHashtag("");
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
                  <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-muted-foreground" />
                        <Input 
                          type="date"
                          defaultValue={note.date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setNoteDate(e.target.value)}
                          className="w-auto h-8 py-0 px-2"
                        />
                      </div>
                      <Badge variant="outline" className="font-normal">
                        {editContent.length} characters
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateNote(note._id, note.date)}
                        disabled={!editContent.trim()}
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
                  {/* Hiển thị ngày tháng */}
                  {note.date && (
                    <div className="mb-2 flex items-center">
                      <Badge variant="secondary" className="font-normal flex items-center gap-1">
                        <Calendar size={12} /> {new Date(note.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-normal flex items-center gap-1">
                        <Clock size={12} /> Created {formatTime(note._creationTime)}
                      </Badge>
                      {note.updatedAt !== note._creationTime && (
                        <Badge variant="outline" className="font-normal flex items-center gap-1">
                          <RefreshCw size={12} /> Updated {formatTime(note.updatedAt)}
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
    </div>
  );
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else if (diffInHours < 24 * 7) {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  } else {
    return date.toLocaleDateString();
  }
}

// Hàm để hiển thị hashtags với màu khác
function formatContentWithHashtags(content: string, onHashtagClick?: (hashtag: string) => void) {
  if (!content) return null;
  
  // Tách nội dung thành các phần dựa trên hashtag
  const parts = content.split(/(#\w+)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      // Nếu là hashtag, hiển thị với màu khác
      return (
        <span 
          key={index} 
          className="text-primary font-medium cursor-pointer hover:underline"
          onClick={() => onHashtagClick?.(part.slice(1))}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
