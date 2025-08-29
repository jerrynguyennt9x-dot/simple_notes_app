import React, { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "./components/ui/dialog";
import { 
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  UserPlus,
  UserMinus,
  Eye
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import { toast } from "sonner";

interface ShareNoteProps {
  noteId: Id<"notes">;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareNoteDialog({ noteId, isOpen, onClose }: ShareNoteProps) {
  const [copied, setCopied] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Mutations
  const enableSharing = useMutation(api.sharing.enableSharing);
  const disableSharing = useMutation(api.sharing.disableSharing);
  const shareWithUser = useMutation(api.sharing.shareWithUser);
  const unshareWithUser = useMutation(api.sharing.unshareWithUser);
  
  // Queries
  const note = useQuery(api.notes.get, { id: noteId });
  const noteViews = useQuery(api.sharing.getNoteViews, { noteId });
  
  useEffect(() => {
    if (note && note.shareId && note.isShared) {
      setIsShared(true);
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/shared/${note.shareId}`);
    } else {
      setIsShared(false);
      setShareUrl("");
    }
  }, [note]);

  const toggleSharing = async () => {
    try {
      if (isShared) {
        await disableSharing({ noteId });
        setIsShared(false);
        toast.success("Note sharing disabled");
      } else {
        const { shareId } = await enableSharing({ noteId });
        setIsShared(true);
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/shared/${shareId}`);
        toast.success("Note sharing enabled");
      }
    } catch (error) {
      toast.error("Failed to update sharing settings");
    }
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleShareWithUser = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await shareWithUser({ noteId, email: newEmail.trim() });
      setNewEmail("");
      toast.success(`Note shared with ${newEmail}`);
    } catch (error) {
      toast.error("Failed to share note");
    }
  };

  const handleUnshareWithUser = async (email: string) => {
    try {
      await unshareWithUser({ noteId, email });
      toast.success(`Note unshared with ${email}`);
    } catch (error) {
      toast.error("Failed to unshare note");
    }
  };

  if (!note) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={18} /> Share Note
          </DialogTitle>
          <DialogDescription>
            Share your note publicly or with specific people.
          </DialogDescription>
        </DialogHeader>
        
        {/* Public sharing toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {isShared ? (
              <Globe size={18} className="text-green-500" />
            ) : (
              <Lock size={18} className="text-muted-foreground" />
            )}
            <span>{isShared ? "Public link sharing" : "Only you can access"}</span>
          </div>
          <Button 
            variant={isShared ? "default" : "outline"} 
            size="sm"
            onClick={toggleSharing}
          >
            {isShared ? "Disable" : "Enable"} sharing
          </Button>
        </div>

        {/* Share link */}
        {isShared && (
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
                onClick={() => copyShareLink()}
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyShareLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            
            {/* View stats if available */}
            {noteViews && (
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye size={14} /> {noteViews.total} views
                </Badge>
                {noteViews.unique > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {noteViews.unique} unique visitors
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Share with specific people */}
        <div className="py-2">
          <h4 className="mb-2 font-medium">Share with specific people</h4>
          <div className="flex gap-2 mb-4">
            <Input 
              type="email" 
              placeholder="Enter email address" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleShareWithUser();
                }
              }}
            />
            <Button onClick={handleShareWithUser} disabled={!newEmail}>
              <UserPlus size={16} className="mr-1" /> Share
            </Button>
          </div>

          {/* List of people this note is shared with */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {note.sharedWith && note.sharedWith.length > 0 ? (
              note.sharedWith.map((email) => (
                <div key={email} className="flex items-center justify-between py-1 px-2 border rounded-md">
                  <span className="text-sm truncate">{email}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleUnshareWithUser(email)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <UserMinus size={16} />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                This note isn't shared with anyone yet
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
