import { useState } from "react";
import { motion } from "framer-motion";
import {
  Grid3X3,
  List,
  FileText,
  Image,
  Video,
  Music,
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
  Star,
  Loader2,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecentFiles } from "@/hooks/useRecentFiles";
import { FilePreview } from "@/components/files/FilePreview";
import { FileShareDialog } from "@/components/files/FileShareDialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type FileType = "document" | "image" | "video" | "audio";

const getFileType = (mimeType: string | null): FileType => {
  if (!mimeType) return "document";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
};

const getFileIcon = (type: FileType) => {
  switch (type) {
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

export default function RecentFiles() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { files, loading, deleteFile, toggleStar, getFileUrl, refetch } = useRecentFiles();
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

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    const result = await deleteFile(fileId, storagePath);
    if (result.success) {
      toast.success("File moved to trash");
    } else {
      toast.error(result.error || "Failed to delete file");
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

  return (
    <div className="pt-6">
      {/* Header - Fixed Secondary Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border -mx-6 px-6 py-3 -mt-6 h-14 flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Recent</span>
            </div>
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

      <div className="mt-6 space-y-6">

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && (
        <div className="empty-state py-16">
          <Clock className="empty-state-icon" />
          <h3 className="text-lg font-medium text-foreground mb-2">No recent files</h3>
          <p className="text-muted-foreground">
            Files you upload or modify will appear here
          </p>
        </div>
      )}

      {/* File List View */}
      {!loading && files.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-6">Name</div>
            <div className="col-span-2 hidden sm:block">Modified</div>
            <div className="col-span-2 hidden sm:block">Size</div>
            <div className="col-span-2"></div>
          </div>

          <div className="divide-y divide-border">
            {files.map((file, index) => {
              const fileType = getFileType(file.mime_type);
              const Icon = getFileIcon(fileType);

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10">
                      <Icon className={`w-5 h-5 ${getIconColor(fileType)}`} />
                    </div>
                    <div className="min-w-0 flex items-center gap-2">
                      <p 
                        className="font-medium text-foreground truncate cursor-pointer hover:text-primary"
                        onClick={() => handlePreviewFile(file)}
                      >
                        {file.name}
                      </p>
                      {file.is_starred && (
                        <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center text-sm text-muted-foreground">
                    {formatFileSize(file.size_bytes || 0)}
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
                        <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadFile(file.storage_path, file.name)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStar(file.id, file.is_starred)}>
                          <Star className={`w-4 h-4 mr-2 ${file.is_starred ? "fill-warning text-warning" : ""}`} />
                          {file.is_starred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareFile(file)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteFile(file.id, file.storage_path)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Move to Trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid View */}
      {!loading && files.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, index) => {
            const fileType = getFileType(file.mime_type);
            const Icon = getFileIcon(fileType);

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="group p-4 rounded-xl border border-border hover:border-primary/20 hover:shadow-card transition-all cursor-pointer"
                onClick={() => handlePreviewFile(file)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <Icon className={`w-6 h-6 ${getIconColor(fileType)}`} />
                  </div>
                  {file.is_starred && (
                    <Star className="w-4 h-4 text-warning fill-warning" />
                  )}
                </div>
                <p className="font-medium text-foreground text-sm truncate mb-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

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
        onShareUpdated={refetch}
      />
      </div>
    </div>
  );
}
