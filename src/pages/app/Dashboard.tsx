import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Upload,
  FolderPlus,
  FileText,
  Image,
  Video,
  Music,
  MoreHorizontal,
  Clock,
  TrendingUp,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { useRecentFiles } from "@/hooks/useRecentFiles";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatDistanceToNow } from "date-fns";

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { usage } = useStorageUsage();
  const { files: recentFiles, loading: filesLoading } = useRecentFiles();
  const { stats, loading: statsLoading, formatBytes } = useDashboardStats();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";

  const quickStats = [
    { label: t("dashboard.totalFiles"), value: stats.totalFiles.toLocaleString() },
    { label: t("dashboard.sharedFiles"), value: stats.sharedFiles.toLocaleString() },
    { label: t("dashboard.storageUsed"), value: usage.usedFormatted },
  ];

  // Take only the 5 most recent files for display
  const displayFiles = recentFiles.slice(0, 5);

  return (
    <div className="pt-4 sm:pt-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("dashboard.welcome")}, {displayName}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-row items-center gap-2 sm:gap-3">
          <Button variant="outline" className="gap-2" size="sm" asChild>
            <Link to="/app/files">
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("files.newFolder")}</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
          <Button className="gap-2" size="sm" asChild>
            <Link to="/app/files">
              <Upload className="w-4 h-4" />
              {t("files.upload")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    {statsLoading ? (
                      <Skeleton className="h-6 sm:h-8 w-12 sm:w-20 mt-1" />
                    ) : (
                      <p className="text-lg sm:text-2xl font-bold text-foreground mt-1 truncate">{stat.value}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {/* Recent Files */}
        <div className="md:col-span-2 h-full order-2 md:order-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4">
              <CardTitle className="text-base sm:text-lg">{t("dashboard.recentFiles")}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                <Link to="/app/recent">{t("common.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto px-4 sm:px-6">
              {filesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">{t("files.empty")}</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/app/files">{t("files.upload")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {displayFiles.map((file, index) => {
                    const FileIcon = getFileIcon(file.mime_type);
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="file-item group"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {formatFileSize(file.size_bytes)} · {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Storage Card */}
        <div className="space-y-4 sm:space-y-6 order-1 md:order-2 md:col-span-2 lg:col-span-1">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-base sm:text-lg">{t("common.storage")}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Progress value={usage.percentage} className="h-2 sm:h-3 mb-3" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">{usage.usedFormatted} of {usage.totalFormatted} {t("common.used")}</span>
                <span className="text-foreground font-medium">{Math.round(usage.percentage)}%</span>
              </div>
              <div className="mt-4 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{t("dashboard.documents")}</span>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className="text-foreground">{formatBytes(stats.storageByType.documents)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">{t("dashboard.images")}</span>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className="text-foreground">{formatBytes(stats.storageByType.images)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-warning" />
                    <span className="text-muted-foreground">{t("dashboard.videos")}</span>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className="text-foreground">{formatBytes(stats.storageByType.videos)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">{t("dashboard.audio")}</span>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className="text-foreground">{formatBytes(stats.storageByType.audio)}</span>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                {t("dashboard.upgradeStorage")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
