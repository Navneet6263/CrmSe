import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type FolderRecord = Tables<"folders">;

export function useFolders(parentFolderId?: string | null) {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (parentFolderId) {
        query = query.eq("parent_folder_id", parentFolderId);
      } else {
        query = query.is("parent_folder_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFolders(data || []);
    } catch (err: any) {
      console.error("Error fetching folders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user, parentFolderId]);

  const createFolder = async (name: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          parent_folder_id: parentFolderId || null,
          name,
        })
        .select()
        .single();

      if (error) throw error;
      
      setFolders((prev) => [...prev, data]);
      return { success: true, folder: data };
    } catch (err: any) {
      console.error("Error creating folder:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase.from("folders").delete().eq("id", folderId);
      if (error) throw error;
      
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting folder:", err);
      return { success: false, error: err.message };
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ name: newName })
        .eq("id", folderId);
      
      if (error) throw error;
      
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
      );
      return { success: true };
    } catch (err: any) {
      console.error("Error renaming folder:", err);
      return { success: false, error: err.message };
    }
  };

  const moveFolder = async (folderId: string, targetParentId: string | null) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ parent_folder_id: targetParentId })
        .eq("id", folderId);
      
      if (error) throw error;
      
      // Remove from current view since it moved
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      return { success: true };
    } catch (err: any) {
      console.error("Error moving folder:", err);
      return { success: false, error: err.message };
    }
  };

  const fetchAllFolders = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error fetching all folders:", err);
      return [];
    }
  };

  return {
    folders,
    loading,
    error,
    refetch: fetchFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    moveFolder,
    fetchAllFolders,
  };
}
