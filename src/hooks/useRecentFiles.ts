import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type FileRecord = Tables<"files">;

export function useRecentFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      console.error("Error fetching recent files:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const deleteFile = async (fileId: string, storagePath: string) => {
    try {
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from("files")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", fileId);
      
      if (error) throw error;
      
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting file:", err);
      return { success: false, error: err.message };
    }
  };

  const toggleStar = async (fileId: string, isStarred: boolean) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ is_starred: isStarred })
        .eq("id", fileId);
      
      if (error) throw error;
      
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, is_starred: isStarred } : f))
      );
      return { success: true };
    } catch (err: any) {
      console.error("Error toggling star:", err);
      return { success: false, error: err.message };
    }
  };

  const getFileUrl = async (storagePath: string) => {
    const { data } = await supabase.storage
      .from("user-files")
      .createSignedUrl(storagePath, 3600);
    
    return data?.signedUrl;
  };

  return {
    files,
    loading,
    error,
    refetch: fetchFiles,
    deleteFile,
    toggleStar,
    getFileUrl,
  };
}
