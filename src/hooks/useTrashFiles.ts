import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type FileRecord = Tables<"files">;

export function useTrashFiles() {
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
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      console.error("Error fetching trash files:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const restoreFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ deleted_at: null })
        .eq("id", fileId);
      
      if (error) throw error;
      
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return { success: true };
    } catch (err: any) {
      console.error("Error restoring file:", err);
      return { success: false, error: err.message };
    }
  };

  const permanentlyDelete = async (fileId: string, storagePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from("user-files").remove([storagePath]);
      
      // Delete from database
      const { error } = await supabase.from("files").delete().eq("id", fileId);
      if (error) throw error;
      
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return { success: true };
    } catch (err: any) {
      console.error("Error permanently deleting file:", err);
      return { success: false, error: err.message };
    }
  };

  const emptyTrash = async () => {
    try {
      // Delete all files from storage
      const storagePaths = files.map((f) => f.storage_path);
      if (storagePaths.length > 0) {
        await supabase.storage.from("user-files").remove(storagePaths);
      }
      
      // Delete all from database
      const { error } = await supabase
        .from("files")
        .delete()
        .eq("user_id", user!.id)
        .not("deleted_at", "is", null);
      
      if (error) throw error;
      
      setFiles([]);
      return { success: true };
    } catch (err: any) {
      console.error("Error emptying trash:", err);
      return { success: false, error: err.message };
    }
  };

  const restoreAll = async () => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ deleted_at: null })
        .eq("user_id", user!.id)
        .not("deleted_at", "is", null);
      
      if (error) throw error;
      
      const restoredCount = files.length;
      setFiles([]);
      return { success: true, restoredCount };
    } catch (err: any) {
      console.error("Error restoring all files:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    files,
    loading,
    error,
    refetch: fetchFiles,
    restoreFile,
    permanentlyDelete,
    emptyTrash,
    restoreAll,
  };
}
