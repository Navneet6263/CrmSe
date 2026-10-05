import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
  Edit3,
  ChevronDown,
  SortAsc,
  Loader2,
  X,
  Eye,
  Star,
  GripVertical,
  FolderInput,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFiles } from "@/hooks/useFiles";
import { useFolders } from "@/hooks/useFolders";
import { FileUpload } from "@/components/files/FileUpload";
import { FilePreview } from "@/components/files/FilePreview";
import { FileShareDialog } from "@/components/files/FileShareDialog";
import { MoveToDialog } from "@/components/files/MoveToDialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type FileType = "folder" | "document" | "image" | "video" | "audio";

const getFileType = (mimeType: string | null): FileType => {
  if (!mimeType) return "document";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
};

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "folder":
      return Folder;
    case "document":
      return FileText;
    case "image":
      return Image;
    case "video":
      return Video;
    case "audio":
      return Music;
    default:
      return FileText;
  }
};

const getIconColor = (type: FileType) => {
  switch (type) {
    case "folder":
      return "text-warning";
    case "document":
      return "text-primary";
    case "image":
      return "text-success";
    case "video":
      return "text-destructive";
    case "audio":
      return "text-info";
    default:
      return "text-muted-foreground";
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function Files() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
    mime_type: string | null;
    storage_path: string;
    size_bytes: number;
  } | null>(null);
  const [shareFile, setShareFile] = useState<{
    id: string;
    name: string;
    public_share_token: string | null;
    public_share_enabled: boolean;
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameItem, setRenameItem] = useState<{ id: string; name: string; type: "file" | "folder" } | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const { files, loading: filesLoading, refetch: refetchFiles, deleteFile, restoreFile, toggleStar, moveFile, getFileUrl, renameFile } = useFiles(currentFolderId);
  const { folders, loading: foldersLoading, refetch: refetchFolders, createFolder, deleteFolder, moveFolder, renameFolder } = useFolders(currentFolderId);
  const [currentFolderName, setCurrentFolderName] = useState<string | null>(null);

  // Fetch current folder name when inside a folder
  useEffect(() => {
    const fetchCurrentFolderName = async () => {
      if (!currentFolderId) {
        setCurrentFolderName(null);
        return;
      }
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("folders")
        .select("name")
        .eq("id", currentFolderId)
        .single();
      setCurrentFolderName(data?.name || null);
    };
    fetchCurrentFolderName();
  }, [currentFolderId]);

  const loading = filesLoading || foldersLoading;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    const result = await createFolder(newFolderName.trim());
    if (result.success) {
      toast.success("Folder created");
      setNewFolderName("");
      setNewFolderDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to create folder");
    }
  };

  const handleDeleteFile = async (fileId: string, fileName?: string) => {
    const result = await deleteFile(fileId);
    if (result.success) {
      toast.success(`"${fileName || 'File'}" moved to trash`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const undoResult = await restoreFile(fileId);
            if (undoResult.success) {
              toast.success("File restored");
            } else {
              toast.error("Failed to restore file");
            }
          },
        },
        duration: 5000,
      });
    } else {
      toast.error(result.error || "Failed to delete file");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const result = await deleteFolder(folderId);
    if (result.success) {
      toast.success("Folder deleted");
    } else {
      toast.error(result.error || "Failed to delete folder");
    }
  };

  const handleToggleStar = async (fileId: string, isStarred: boolean) => {
    const result = await toggleStar(fileId, !isStarred);
    if (result.success) {
      toast.success(isStarred ? "Removed from starred" : "Added to starred");
    } else {
      toast.error(result.error || "Failed to update file");
    }
  };

  const handleDownloadFile = async (storagePath: string, fileName: string) => {
    const url = await getFileUrl(storagePath);
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    } else {
      toast.error("Failed to generate download link");
    }
  };

  const handlePreviewFile = (file: typeof files[0]) => {
    setPreviewFile({
      id: file.id,
      name: file.name,
      mime_type: file.mime_type,
      storage_path: file.storage_path,
      size_bytes: file.size_bytes,
    });
  };

  const handleShareFile = (file: typeof files[0]) => {
    setShareFile({
      id: file.id,
      name: file.name,
      public_share_token: file.public_share_token,
      public_share_enabled: file.public_share_enabled,
    });
  };

  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedItems([]);
  };

  const handleGoBack = () => {
    setCurrentFolderId(null);
    setSelectedItems([]);
  };

  const handleRenameItem = (id: string, name: string, type: "file" | "folder") => {
    setRenameItem({ id, name, type });
    // For files, only allow editing the name part (not extension)
    if (type === "file") {
      const lastDotIndex = name.lastIndexOf(".");
      const nameWithoutExt = lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;
      setNewItemName(nameWithoutExt);
    } else {
      setNewItemName(name);
    }
    setRenameDialogOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!renameItem || !newItemName.trim()) return;
    
    let finalName = newItemName.trim();
    
    // For files, re-append the original extension
    if (renameItem.type === "file") {
      const lastDotIndex = renameItem.name.lastIndexOf(".");
      const extension = lastDotIndex > 0 ? renameItem.name.substring(lastDotIndex) : "";
      finalName = newItemName.trim() + extension;
    }
    
    const result = renameItem.type === "file" 
      ? await renameFile(renameItem.id, finalName)
      : await renameFolder(renameItem.id, finalName);
    
    if (result.success) {
      toast.success(t("files.renameSuccess", "Renamed successfully"));
      setRenameDialogOpen(false);
      setRenameItem(null);
      setNewItemName("");
    } else {
      toast.error(result.error || t("files.renameFailed", "Failed to rename"));
    }
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, itemType: "file" | "folder") => {
    if (itemType === "folder") {
      e.preventDefault();
      return;
    }
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedItem && folderId !== draggedItem) {
      setDragOverFolder(folderId);
    }
  }, [draggedItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverFolder(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    const fileId = e.dataTransfer.getData("text/plain");
    if (!fileId || fileId === targetFolderId) {
      setDraggedItem(null);
      return;
    }

    const result = await moveFile(fileId, targetFolderId);
    if (result.success) {
      toast.success("File moved successfully");
    } else {
      toast.error(result.error || "Failed to move file");
    }
    setDraggedItem(null);
  }, [moveFile]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverFolder(null);
  }, []);

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const allItems = [
    ...folders.map((f) => ({ ...f, itemType: "folder" as const })),
    ...files.map((f) => ({ ...f, itemType: "file" as const })),
  ];

  const handleUploadComplete = () => {
    refetchFiles();
    setUploadDialogOpen(false);
  };

  const handleMoveSelectedItems = async (targetFolderId: string | null) => {
    const selectedFolderIds = selectedItems.filter((id) =>
      folders.some((f) => f.id === id)
    );
    const selectedFileIds = selectedItems.filter((id) =>
      files.some((f) => f.id === id)
    );

    let successCount = 0;
    let failCount = 0;

    // Move folders
    for (const folderId of selectedFolderIds) {
      const result = await moveFolder(folderId, targetFolderId);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Move files
    for (const fileId of selectedFileIds) {
      const result = await moveFile(fileId, targetFolderId);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(t("files.moveSuccess", `Moved ${successCount} item(s) successfully`));
    }
    if (failCount > 0) {
      toast.error(t("files.moveFailed", `Failed to move ${failCount} item(s)`));
    }

    setSelectedItems([]);
    refetchFiles();
    refetchFolders();
  };

  const handleBulkDelete = async () => {
    const selectedFolderIds = selectedItems.filter((id) =>
      folders.some((f) => f.id === id)
    );
    const selectedFileIds = selectedItems.filter((id) =>
      files.some((f) => f.id === id)
    );

    let successCount = 0;
    let failCount = 0;
    const deletedFileIds: string[] = [];

    // Delete folders (permanent - no undo)
    for (const folderId of selectedFolderIds) {
      const result = await deleteFolder(folderId);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Delete files (soft delete - can undo)
    for (const fileId of selectedFileIds) {
      const result = await deleteFile(fileId);
      if (result.success) {
        successCount++;
        deletedFileIds.push(fileId);
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      const hasFiles = deletedFileIds.length > 0;
      toast.success(
        t("files.deleteSuccess", `Moved ${successCount} item(s) to trash`),
        hasFiles ? {
          action: {
            label: "Undo",
            onClick: async () => {
              let restored = 0;
              for (const fileId of deletedFileIds) {
                const result = await restoreFile(fileId);
                if (result.success) restored++;
              }
              if (restored > 0) {
                toast.success(`Restored ${restored} file(s)`);
              }
            },
          },
          duration: 5000,
        } : undefined
      );
    }
    if (failCount > 0) {
      toast.error(t("files.deleteFailed", `Failed to delete ${failCount} item(s)`));
    }

    setSelectedItems([]);
    refetchFiles();
    refetchFolders();
  };

  return (
    <>
      <div className="pt-6">
        {/* Header - Fixed Secondary Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border -mx-6 px-6 py-3 -mt-6 h-14 flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
        <div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button
              onClick={handleGoBack}
              className={`hover:text-foreground transition-colors ${!currentFolderId ? "text-foreground font-medium" : ""}`}
            >
              {t("files.title")}
            </button>
            {currentFolderId && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {currentFolderName || "Loading..."}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{t("files.newFolder")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("files.createFolder")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="folder-name">{t("files.folderName")}</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={t("files.folderPlaceholder")}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleCreateFolder}>{t("common.create")}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">{t("files.upload")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("files.uploadFiles")}</DialogTitle>
              </DialogHeader>
              <FileUpload
                folderId={currentFolderId}
                onUploadComplete={handleUploadComplete}
                onClose={() => setUploadDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </div>

      {/* Toolbar - Third Header */}
      <div className="sticky top-[41px] z-[9] bg-background border-b border-border -mx-6 px-6 py-2">
        <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {selectedItems.length > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} {t("common.selected")}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setMoveDialogOpen(true)}>
                <FolderInput className="w-4 h-4" />
                {t("files.moveTo", "Move to")}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    {t("common.delete", "Delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("files.confirmDelete", "Confirm Delete")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("files.confirmDeleteDescription", `Are you sure you want to delete ${selectedItems.length} item(s)? This action will move them to trash.`)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => {
                        e.preventDefault();
                        handleBulkDelete();
                      }} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("common.delete", "Delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                <X className="w-4 h-4" />
                {t("common.clear")}
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <SortAsc className="w-4 h-4" />
                  {t("files.sortBy")}: {sortBy}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")}>{t("files.name")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("modified")}>{t("files.modified")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")}>{t("files.size")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("type")}>{t("files.type")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
        </div>
      </div>

      {/* Content with spacing from headers */}
      <div className="mt-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && allItems.length === 0 && (
        <div className="empty-state py-16">
          <FolderPlus className="empty-state-icon" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t("files.empty")}</h3>
          <p className="text-muted-foreground mb-4">{t("files.emptyHint")}</p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            {t("files.uploadFiles")}
          </Button>
        </div>
      )}

      {/* File List View */}
      {!loading && allItems.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-5 flex items-center gap-3">
              <span>{t("files.name")}</span>
            </div>
            <div className="col-span-3 hidden sm:block">{t("files.modified")}</div>
            <div className="col-span-2 hidden sm:block">{t("files.size")}</div>
            <div className="col-span-2"></div>
          </div>

          {/* Items */}
          <div className="divide-y divide-border">
            {allItems.map((item, index) => {
              const isFolder = item.itemType === "folder";
              const fileType = isFolder ? "folder" : getFileType(item.mime_type || null);
              const Icon = getFileIcon(fileType);
              const isSelected = selectedItems.includes(item.id);
              const isDragOver = isFolder && dragOverFolder === item.id;
              const isDragging = draggedItem === item.id;

              return (
                <div
                  key={item.id}
                  draggable={!isFolder}
                  onDragStart={(e) => handleDragStart(e, item.id, isFolder ? "folder" : "file")}
                  onDragOver={(e) => isFolder && handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => isFolder && handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 transition-all group ${
                    isSelected ? "bg-accent" : ""
                  } ${isDragOver ? "bg-primary/10 border-2 border-dashed border-primary" : ""} ${
                    isDragging ? "opacity-50" : ""
                  } ${!isFolder ? "cursor-grab active:cursor-grabbing" : ""}`}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                    />
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
                        isFolder ? "bg-warning/10" : "bg-primary/10"
                      }`}
                      onClick={() => isFolder && handleOpenFolder(item.id)}
                    >
                      <Icon className={`w-5 h-5 ${getIconColor(fileType)}`} />
                    </div>
                    <div className="min-w-0 flex items-center gap-2">
                      <p
                        className={`font-medium text-foreground truncate ${
                          isFolder ? "cursor-pointer hover:text-primary" : "cursor-pointer hover:text-primary"
                        }`}
                        onClick={() => isFolder ? handleOpenFolder(item.id) : handlePreviewFile(item as typeof files[0])}
                      >
                        {item.name}
                      </p>
                      {!isFolder && (item as typeof files[0]).is_starred && (
                        <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 hidden sm:flex items-center text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center text-sm text-muted-foreground">
                    {isFolder ? "—" : formatFileSize(item.size_bytes || 0)}
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isFolder && (
                          <DropdownMenuItem
                            onClick={() => handlePreviewFile(item as typeof files[0])}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t("files.actions.preview")}
                          </DropdownMenuItem>
                        )}
                        {!isFolder && (
                          <DropdownMenuItem
                            onClick={() => handleDownloadFile(item.storage_path!, item.name)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t("files.actions.download")}
                          </DropdownMenuItem>
                        )}
                        {!isFolder && (
                          <DropdownMenuItem
                            onClick={() => handleToggleStar(item.id, (item as typeof files[0]).is_starred)}
                          >
                            <Star className={`w-4 h-4 mr-2 ${(item as typeof files[0]).is_starred ? "fill-warning text-warning" : ""}`} />
                            {(item as typeof files[0]).is_starred ? t("files.actions.unstar") : t("files.actions.star")}
                          </DropdownMenuItem>
                        )}
                        {!isFolder && (
                          <DropdownMenuItem onClick={() => handleShareFile(item as typeof files[0])}>
                            <Share2 className="w-4 h-4 mr-2" />
                            {t("files.actions.share")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleRenameItem(item.id, item.name, isFolder ? "folder" : "file")}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t("files.actions.rename")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            isFolder
                              ? handleDeleteFolder(item.id)
                              : handleDeleteFile(item.id, item.name)
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("files.actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid View */}
      {!loading && allItems.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allItems.map((item, index) => {
            const isFolder = item.itemType === "folder";
            const fileType = isFolder ? "folder" : getFileType(item.mime_type || null);
            const Icon = getFileIcon(fileType);
            const isSelected = selectedItems.includes(item.id);
            const isDragOver = isFolder && dragOverFolder === item.id;
            const isDragging = draggedItem === item.id;

            return (
              <div
                key={item.id}
                draggable={!isFolder}
                onDragStart={(e) => handleDragStart(e, item.id, isFolder ? "folder" : "file")}
                onDragOver={(e) => isFolder && handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => isFolder && handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`group p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/20 hover:shadow-card"
                } ${isDragOver ? "border-2 border-dashed border-primary bg-primary/10" : ""} ${
                  isDragging ? "opacity-50" : ""
                } ${!isFolder ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                onClick={() => isFolder ? handleOpenFolder(item.id) : handlePreviewFile(item as typeof files[0])}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isFolder ? "bg-warning/10" : "bg-primary/10"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${getIconColor(fileType)}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {!isFolder && (item as typeof files[0]).is_starred && (
                      <Star className="w-4 h-4 text-warning fill-warning" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {!isFolder && (
                          <DropdownMenuItem onClick={() => handlePreviewFile(item as typeof files[0])}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t("files.actions.preview")}
                          </DropdownMenuItem>
                        )}
                        {!isFolder && (
                          <DropdownMenuItem onClick={() => handleDownloadFile(item.storage_path!, item.name)}>
                            <Download className="w-4 h-4 mr-2" />
                            {t("files.actions.download")}
                          </DropdownMenuItem>
                        )}
                        {!isFolder && (
                          <DropdownMenuItem onClick={() => handleToggleStar(item.id, (item as typeof files[0]).is_starred)}>
                            <Star className={`w-4 h-4 mr-2 ${(item as typeof files[0]).is_starred ? "fill-warning text-warning" : ""}`} />
                            {(item as typeof files[0]).is_starred ? t("files.actions.unstar") : t("files.actions.star")}
                          </DropdownMenuItem>
                        )}
                        {!isFolder && (
                          <DropdownMenuItem onClick={() => handleShareFile(item as typeof files[0])}>
                            <Share2 className="w-4 h-4 mr-2" />
                            {t("files.actions.share")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleRenameItem(item.id, item.name, isFolder ? "folder" : "file")}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t("files.actions.rename")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => isFolder ? handleDeleteFolder(item.id) : handleDeleteFile(item.id, item.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("files.actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="font-medium text-foreground text-sm truncate mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </div>
            );
          })}
        </div>
      )}
        </div>
      </div>

      {/* File Preview Dialog */}
      <FilePreview
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      {/* File Share Dialog */}
      <FileShareDialog
        isOpen={!!shareFile}
        onClose={() => setShareFile(null)}
        file={shareFile}
        onShareUpdated={refetchFiles}
      />

      {/* Move To Dialog */}
      <MoveToDialog
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        onMove={handleMoveSelectedItems}
        excludeFolderIds={selectedItems.filter((id) => folders.some((f) => f.id === id))}
        currentFolderId={currentFolderId}
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={(open) => {
        setRenameDialogOpen(open);
        if (!open) {
          setRenameItem(null);
          setNewItemName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("files.renameTitle", "Rename")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">{t("files.newName", "New name")}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="rename-input"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t("files.namePlaceholder", "Enter new name")}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirmRename()}
                  autoFocus
                  className="flex-1"
                />
                {renameItem?.type === "file" && renameItem.name.lastIndexOf(".") > 0 && (
                  <span className="text-muted-foreground text-sm font-medium px-2 py-2 bg-muted rounded-md">
                    {renameItem.name.substring(renameItem.name.lastIndexOf("."))}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleConfirmRename} disabled={!newItemName.trim()}>
                {t("common.save", "Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
