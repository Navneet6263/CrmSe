import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Image, Video, Music, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
  error?: string;
}

interface FileUploadProps {
  folderId?: string | null;
  onUploadComplete?: () => void;
  onClose?: () => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  return FileText;
};

export function FileUpload({ folderId, onUploadComplete, onClose }: FileUploadProps) {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const uploadFile = async (file: File, fileId: string) => {
    if (!user) return;

    try {
      // Create unique storage path: user_id/timestamp_filename
      const timestamp = Date.now();
      const storagePath = `${user.id}/${timestamp}_${file.name}`;

      // Upload to storage bucket
      const { error: storageError } = await supabase.storage
        .from("user-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) throw storageError;

      // Create file record in database
      const { error: dbError } = await supabase.from("files").insert({
        user_id: user.id,
        folder_id: folderId || null,
        name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
      });

      if (dbError) {
        // Rollback storage upload on db error
        await supabase.storage.from("user-files").remove([storagePath]);
        throw dbError;
      }

      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "complete" } : f))
      );

      toast.success(`${file.name} uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: error.message || "Upload failed" }
            : f
        )
      );
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Upload files with simulated progress
      for (const uploadFile of newFiles) {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id && f.status === "uploading"
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 100);

        await uploadFileHandler(uploadFile.file, uploadFile.id);
        clearInterval(progressInterval);
      }

      onUploadComplete?.();
    },
    [user, folderId, onUploadComplete]
  );

  const uploadFileHandler = async (file: File, fileId: string) => {
    await uploadFile(file, fileId);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "video/mp4": [".mp4"],
      "audio/mpeg": [".mp3"],
    },
    maxSize: 52428800, // 50MB
  });

  const removeFile = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const completedCount = uploadingFiles.filter((f) => f.status === "complete").length;
  const hasActiveUploads = uploadingFiles.some((f) => f.status === "uploading");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isDragActive ? "bg-primary/10" : "bg-muted"
          }`}>
            <Upload className={`w-7 h-7 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (max 50MB per file)
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Files List */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} of {uploadingFiles.length} complete
              </span>
              {!hasActiveUploads && (
                <Button variant="ghost" size="sm" onClick={() => setUploadingFiles([])}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadingFiles.map((uploadFile) => {
                const Icon = getFileIcon(uploadFile.file.type);
                
                return (
                  <motion.div
                    key={uploadFile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {uploadFile.status === "uploading" && (
                          <>
                            <Progress value={uploadFile.progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {uploadFile.progress}%
                            </span>
                          </>
                        )}
                        {uploadFile.status === "complete" && (
                          <span className="text-xs text-success flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Complete
                          </span>
                        )}
                        {uploadFile.status === "error" && (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {uploadFile.error}
                          </span>
                        )}
                      </div>
                    </div>
                    {uploadFile.status !== "uploading" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
