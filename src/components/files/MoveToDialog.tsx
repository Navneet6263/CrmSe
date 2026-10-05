import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Folder, ChevronRight, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MoveToDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetFolderId: string | null) => void;
  excludeFolderIds?: string[];
  currentFolderId?: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

export function MoveToDialog({
  isOpen,
  onClose,
  onMove,
  excludeFolderIds = [],
  currentFolderId,
}: MoveToDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<FolderItem[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchAllFolders();
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Build breadcrumb when browseFolderId changes
    if (browseFolderId && allFolders.length > 0) {
      const path: FolderItem[] = [];
      let currentId: string | null = browseFolderId;
      
      while (currentId) {
        const folder = allFolders.find((f) => f.id === currentId);
        if (folder) {
          path.unshift(folder);
          currentId = folder.parent_folder_id;
        } else {
          break;
        }
      }
      setBreadcrumb(path);
    } else {
      setBreadcrumb([]);
    }
  }, [browseFolderId, allFolders]);

  const fetchAllFolders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("id, name, parent_folder_id")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      
      if (error) throw error;
      setAllFolders(data || []);
    } catch (err) {
      console.error("Error fetching folders:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentLevelFolders = allFolders.filter(
    (f) =>
      f.parent_folder_id === browseFolderId &&
      !excludeFolderIds.includes(f.id)
  );

  const handleSelectFolder = (folderId: string | null) => {
    onMove(folderId);
    onClose();
    setBrowseFolderId(null);
  };

  const handleNavigateToFolder = (folderId: string) => {
    setBrowseFolderId(folderId);
  };

  const handleGoToRoot = () => {
    setBrowseFolderId(null);
  };

  const handleClose = () => {
    onClose();
    setBrowseFolderId(null);
  };

  const isCurrentLocation = browseFolderId === currentFolderId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("files.moveTo", "Move to")}</DialogTitle>
        </DialogHeader>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto pb-2">
          <button
            onClick={handleGoToRoot}
            className={`flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap ${
              !browseFolderId ? "text-foreground font-medium" : ""
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t("files.myFiles", "My Files")}</span>
          </button>
          {breadcrumb.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <button
                onClick={() => setBrowseFolderId(folder.id)}
                className={`hover:text-foreground transition-colors whitespace-nowrap ${
                  folder.id === browseFolderId ? "text-foreground font-medium" : ""
                }`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        {/* Folder List */}
        <ScrollArea className="h-[300px] border rounded-md">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t("common.loading", "Loading...")}
              </div>
            ) : currentLevelFolders.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t("files.noFolders", "No folders here")}
              </div>
            ) : (
              currentLevelFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted group"
                >
                  <button
                    onClick={() => handleNavigateToFolder(folder.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <Folder className="w-5 h-5 text-primary" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t("files.moveHere", "Move here")}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between gap-2 pt-2">
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={() => handleSelectFolder(browseFolderId)}
            disabled={isCurrentLocation}
          >
            {isCurrentLocation
              ? t("files.currentLocation", "Current location")
              : t("files.moveToThisFolder", "Move to this folder")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
