import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
      return { success: false, error: err.message };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get signed URL since bucket is private
      const { data: signedData, error: signedError } = await supabase.storage
        .from("user-files")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (signedError) throw signedError;

      // Update profile with signed URL
      await updateProfile({ avatar_url: signedData.signedUrl });

      return { success: true, url: signedData.signedUrl };
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      toast.error("Failed to upload avatar");
      return { success: false, error: err.message };
    }
  };

  return {
    profile,
    loading,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}
