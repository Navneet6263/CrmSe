import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link2,
  Copy,
  Check,
  Mail,
  UserPlus,
  Loader2,
  X,
  Globe,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    public_share_token: string | null;
    public_share_enabled: boolean;
  } | null;
  onShareUpdated?: () => void;
}

interface SharedUser {
  id: string;
  shared_with_user_id: string;
  permission_level: string;
  shared_at: string;
  email?: string;
  full_name?: string;
}

export function FileShareDialog({ isOpen, onClose, file, onShareUpdated }: FileShareDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [publicShareEnabled, setPublicShareEnabled] = useState(false);
  const [publicShareToken, setPublicShareToken] = useState<string | null>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      setPublicShareEnabled(file.public_share_enabled);
      setPublicShareToken(file.public_share_token);
      fetchSharedUsers();
    } else {
      setEmail("");
      setSharedUsers([]);
      setLinkCopied(false);
    }
  }, [isOpen, file]);

  const fetchSharedUsers = async () => {
    if (!file) return;
    
    setLoadingShares(true);
    try {
      const { data: shares, error } = await supabase
        .from("file_shares")
        .select("*")
        .eq("file_id", file.id);

      if (error) throw error;

      // Fetch user profiles for each share
      if (shares && shares.length > 0) {
        const userIds = shares.map(s => s.shared_with_user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const sharesWithProfiles = shares.map(share => ({
          ...share,
          full_name: profiles?.find(p => p.id === share.shared_with_user_id)?.full_name || "Unknown User",
        }));

        setSharedUsers(sharesWithProfiles);
      } else {
        setSharedUsers([]);
      }
    } catch (err) {
      console.error("Error fetching shares:", err);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleShareByEmail = async () => {
    if (!file || !email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Use secure edge function instead of direct RPC call
      const { data, error } = await supabase.functions.invoke('share-file-by-email', {
        body: {
          fileId: file.id,
          email: email.trim().toLowerCase(),
          permission: permission,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to share file');
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data?.message || `File shared with ${email}`);
      setEmail("");
      fetchSharedUsers();
      onShareUpdated?.();
    } catch (err: any) {
      console.error("Error sharing file:", err);
      toast.error(err.message || "Failed to share file");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublicShare = async (enabled: boolean) => {
    if (!file) return;

    setLoading(true);
    try {
      let token = publicShareToken;
      
      if (enabled && !token) {
        // Generate a new token
        const { data: newToken, error: tokenError } = await supabase
          .rpc("generate_share_token");
        
        if (tokenError) throw tokenError;
        token = newToken;
      }

      const { error } = await supabase
        .from("files")
        .update({
          public_share_enabled: enabled,
          public_share_token: enabled ? token : publicShareToken,
        })
        .eq("id", file.id);

      if (error) throw error;

      setPublicShareEnabled(enabled);
      if (enabled && token) {
        setPublicShareToken(token);
      }
      
      toast.success(enabled ? "Public link enabled" : "Public link disabled");
      onShareUpdated?.();
    } catch (err: any) {
      console.error("Error toggling public share:", err);
      toast.error(err.message || "Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicShareToken) return;

    const shareUrl = `${window.location.origin}/shared/${publicShareToken}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from("file_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;

      setSharedUsers(prev => prev.filter(s => s.id !== shareId));
      toast.success("Share removed");
      onShareUpdated?.();
    } catch (err: any) {
      console.error("Error removing share:", err);
      toast.error(err.message || "Failed to remove share");
    }
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share "{file.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share by Email */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Share with people
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShareByEmail()}
                className="flex-1"
              />
              <Select value={permission} onValueChange={(v) => setPermission(v as "view" | "edit")}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleShareByEmail} 
              disabled={loading || !email.trim()}
              className="w-full gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Send Invitation
            </Button>
          </div>

          {/* Shared Users List */}
          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">People with access</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sharedUsers.map((share) => (
                  <div 
                    key={share.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {share.full_name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{share.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {share.permission_level}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveShare(share.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Link */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                {publicShareEnabled ? (
                  <Globe className="w-4 h-4 text-success" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Public link
              </Label>
              <Switch
                checked={publicShareEnabled}
                onCheckedChange={handleTogglePublicShare}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {publicShareEnabled
                ? "Anyone with the link can view this file"
                : "Only people you share with can access this file"}
            </p>
            
            {publicShareEnabled && publicShareToken && (
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/shared/${publicShareToken}`}
                  className="text-xs bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
