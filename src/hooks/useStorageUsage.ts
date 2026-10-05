import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
  usedFormatted: string;
  totalFormatted: string;
  percentage: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function useStorageUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<StorageUsage>({
    usedBytes: 0,
    totalBytes: 5 * 1024 * 1024 * 1024, // 5 GB default
    usedFormatted: "0 B",
    totalFormatted: "5 GB",
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get sum of all file sizes for the user (excluding deleted files)
      const { data, error } = await supabase
        .from("files")
        .select("size_bytes")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      if (error) throw error;

      const totalUsed = data?.reduce((sum, file) => sum + (file.size_bytes || 0), 0) || 0;
      const totalLimit = 5 * 1024 * 1024 * 1024; // 5 GB
      const percentage = Math.min((totalUsed / totalLimit) * 100, 100);

      setUsage({
        usedBytes: totalUsed,
        totalBytes: totalLimit,
        usedFormatted: formatBytes(totalUsed),
        totalFormatted: formatBytes(totalLimit),
        percentage,
      });
    } catch (err) {
      console.error("Error fetching storage usage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  return { usage, loading, refetch: fetchUsage };
}
