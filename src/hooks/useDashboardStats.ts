import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalFiles: number;
  sharedFiles: number;
  storageByType: {
    documents: number;
    images: number;
    videos: number;
    audio: number;
    other: number;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function categorizeByMimeType(mimeType: string | null): keyof DashboardStats["storageByType"] {
  if (!mimeType) return "other";
  if (mimeType.startsWith("image/")) return "images";
  if (mimeType.startsWith("video/")) return "videos";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("word") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  ) {
    return "documents";
  }
  return "other";
}

export function useDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    sharedFiles: 0,
    storageByType: {
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      other: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all files for the user
        const { data: files, error: filesError } = await supabase
          .from("files")
          .select("id, size_bytes, mime_type")
          .eq("user_id", user.id)
          .is("deleted_at", null);

        if (filesError) throw filesError;

        // Fetch shared files count
        const { count: sharedCount, error: sharedError } = await supabase
          .from("file_shares")
          .select("id", { count: "exact", head: true })
          .in(
            "file_id",
            files?.map((f) => f.id) || []
          );

        if (sharedError) throw sharedError;

        // Calculate storage by type
        const storageByType = {
          documents: 0,
          images: 0,
          videos: 0,
          audio: 0,
          other: 0,
        };

        files?.forEach((file) => {
          const category = categorizeByMimeType(file.mime_type);
          storageByType[category] += file.size_bytes;
        });

        setStats({
          totalFiles: files?.length || 0,
          sharedFiles: sharedCount || 0,
          storageByType,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    formatBytes,
  };
}
