import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type FileRecord = Tables<"files">;

export function useFiles(folderId?: string | null) {
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
      let query = supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (folderId) {
        query = query.eq("folder_id", folderId);
      } else {
        query = query.is("folder_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user, folderId]);

  const deleteFile = async (fileId: string) => {
    try {
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from("files")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", fileId);
      
      if (error) throw error;
      
      // Get the file before removing from state (for undo)
      const deletedFile = files.find((f) => f.id === fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return { success: true, deletedFile };
    } catch (err: any) {
      console.error("Error deleting file:", err);
      return { success: false, error: err.message };
    }
  };

  const restoreFile = async (fileId: string) => {
    try {
      const { data, error } = await supabase
        .from("files")
        .update({ deleted_at: null })
        .eq("id", fileId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add back to files list if it belongs to current folder
      if (data && (data.folder_id === folderId || (!data.folder_id && !folderId))) {
        setFiles((prev) => [data, ...prev]);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error restoring file:", err);
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

  const renameFile = async (fileId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ name: newName })
        .eq("id", fileId);
      
      if (error) throw error;
      
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
      );
      return { success: true };
    } catch (err: any) {
      console.error("Error renaming file:", err);
      return { success: false, error: err.message };
    }
  };

  const moveFile = async (fileId: string, targetFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ folder_id: targetFolderId })
        .eq("id", fileId);
      
      if (error) throw error;
      
      // Remove from current view since it moved
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return { success: true };
    } catch (err: any) {
      console.error("Error moving file:", err);
      return { success: false, error: err.message };
    }
  };

  const getFileUrl = async (storagePath: string) => {
    const { data } = await supabase.storage
      .from("user-files")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry
    
    return data?.signedUrl;
  };

  return {
    files,
    loading,
    error,
    refetch: fetchFiles,
    deleteFile,
    restoreFile,
    renameFile,
    toggleStar,
    moveFile,
    getFileUrl,
  };
}
