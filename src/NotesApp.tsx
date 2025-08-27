import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Search, Plus, Edit, Trash2, Save, X, Clock, RefreshCw } from "lucide-react";

export function NotesApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "updated">("updated");
  const [editingId, setEditingId] = useState<Id<"notes"> | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editContent, setEditContent] = useState("");

  const notes = useQuery(api.notes.search, { searchTerm }) || [];
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
      await createNote({ content: newNoteContent.trim() });
      setNewNoteContent("");
      toast.success("Note created!");
    } catch (error) {
      toast.error("Failed to create note");
    }
  };

  const handleUpdateNote = async (id: Id<"notes">) => {
    if (!editContent.trim()) return;
    
    try {
      await updateNote({ id, content: editContent.trim() });
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
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleCreateNote();
            }
          }}
        />
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {newNoteContent.length > 0 && (
              <Badge variant="outline" className="font-normal">
                {newNoteContent.length} characters
              </Badge>
            )}
          </span>
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

      {/* Search and sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
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
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                    rows={Math.max(3, editContent.split('\n').length)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleUpdateNote(note._id);
                      }
                      if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <Badge variant="outline" className="font-normal">
                      {editContent.length} characters
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateNote(note._id)}
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
                    {note.content}
                  </div>
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
