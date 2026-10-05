import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Grid3X3,
  List,
  FileText,
  Image,
  Video,
  Music,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Loader2,
  AlertTriangle,
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
import { useTrashFiles } from "@/hooks/useTrashFiles";
import { toast } from "sonner";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

// Calculate days remaining until permanent deletion (30-day policy)
const getDaysRemaining = (deletedAt: string | null): number => {
  if (!deletedAt) return 30;
  const deletedDate = new Date(deletedAt);
  const daysSinceDeleted = differenceInDays(new Date(), deletedDate);
  return Math.max(0, 30 - daysSinceDeleted);
};

const getDaysRemainingColor = (days: number): string => {
  if (days <= 3) return "text-destructive";
  if (days <= 7) return "text-warning";
  return "text-muted-foreground";
};

export default function Trash() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { files, loading, restoreFile, permanentlyDelete, emptyTrash, restoreAll } = useTrashFiles();

  const handleRestore = async (fileId: string) => {
    const result = await restoreFile(fileId);
    if (result.success) {
      toast.success(t("files.actions.restore"));
    } else {
      toast.error(result.error || "Failed to restore file");
    }
  };

  const handlePermanentDelete = async (fileId: string, storagePath: string) => {
    const result = await permanentlyDelete(fileId, storagePath);
    if (result.success) {
      toast.success(t("files.actions.permanentDelete"));
    } else {
      toast.error(result.error || "Failed to delete file");
    }
  };

  const handleEmptyTrash = async () => {
    const result = await emptyTrash();
    if (result.success) {
      toast.success(t("trash.emptyTrash"));
    } else {
      toast.error(result.error || "Failed to empty trash");
    }
  };

  const handleRestoreAll = async () => {
    const result = await restoreAll();
    if (result.success) {
      toast.success(`Restored ${result.restoredCount} file(s)`);
    } else {
      toast.error(result.error || "Failed to restore files");
    }
  };

  return (
    <div className="pt-6">
      {/* Header - Fixed Secondary Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border -mx-6 px-6 py-3 -mt-6 h-14 flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{t("trash.title")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {files.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleRestoreAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore All
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("trash.emptyTrash")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        {t("trash.emptyTrashConfirm")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("trash.emptyTrashWarning")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEmptyTrash}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("trash.emptyTrash")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
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
          <Trash2 className="empty-state-icon" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t("trash.empty")}</h3>
          <p className="text-muted-foreground">
            {t("trash.emptyHint")}
          </p>
        </div>
      )}

      {/* File List View */}
      {!loading && files.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-5">{t("files.name")}</div>
            <div className="col-span-2 hidden sm:block">{t("files.deleted")}</div>
            <div className="col-span-2 hidden sm:block">Auto-delete in</div>
            <div className="col-span-1 hidden sm:block">{t("files.size")}</div>
            <div className="col-span-2"></div>
          </div>

          <div className="divide-y divide-border">
            {files.map((file, index) => {
              const fileType = getFileType(file.mime_type);
              const Icon = getFileIcon(fileType);
              const daysRemaining = getDaysRemaining(file.deleted_at);

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted">
                      <Icon className={`w-5 h-5 ${getIconColor(fileType)} opacity-50`} />
                    </div>
                    <p className="font-medium text-muted-foreground truncate">{file.name}</p>
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center text-sm text-muted-foreground">
                    {file.deleted_at && formatDistanceToNow(new Date(file.deleted_at), { addSuffix: true })}
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center">
                    <span className={`text-sm font-medium ${getDaysRemainingColor(daysRemaining)}`}>
                      {daysRemaining === 0 ? "Today" : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <div className="col-span-1 hidden sm:flex items-center text-sm text-muted-foreground">
                    {formatFileSize(file.size_bytes || 0)}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRestore(file.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
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
                        <DropdownMenuItem onClick={() => handleRestore(file.id)}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          {t("files.actions.restore")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handlePermanentDelete(file.id, file.storage_path)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("files.actions.permanentDelete")}
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
            const daysRemaining = getDaysRemaining(file.deleted_at);

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="group p-4 rounded-xl border border-border hover:border-muted-foreground/20 transition-all opacity-70"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted mb-3">
                  <Icon className={`w-6 h-6 ${getIconColor(fileType)} opacity-50`} />
                </div>
                <p className="font-medium text-muted-foreground text-sm truncate mb-1">{file.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {file.deleted_at && formatDistanceToNow(new Date(file.deleted_at), { addSuffix: true })}
                  </span>
                  <span className={`font-medium ${getDaysRemainingColor(daysRemaining)}`}>
                    • {daysRemaining === 0 ? "Deletes today" : `${daysRemaining}d left`}
                  </span>
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" onClick={() => handleRestore(file.id)}>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t("files.actions.restore")}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
