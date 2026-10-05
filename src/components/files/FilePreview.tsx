import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  X,
  FileText,
  Loader2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    mime_type: string | null;
    storage_path: string;
    size_bytes: number;
  } | null;
}

type PreviewType = "image" | "pdf" | "video" | "audio" | "text" | "unsupported";

const getPreviewType = (mimeType: string | null): PreviewType => {
  if (!mimeType) return "unsupported";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  ) {
    return "text";
  }
  return "unsupported";
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen && file) {
      loadFile();
    } else {
      // Reset state when dialog closes
      setFileUrl(null);
      setTextContent(null);
      setError(null);
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen, file]);

  const loadFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: urlError } = await supabase.storage
        .from("user-files")
        .createSignedUrl(file.storage_path, 3600);

      if (urlError) throw urlError;
      if (!data?.signedUrl) throw new Error("Failed to get file URL");

      setFileUrl(data.signedUrl);

      // For text files, fetch the content
      const previewType = getPreviewType(file.mime_type);
      if (previewType === "text") {
        const response = await fetch(data.signedUrl);
        const text = await response.text();
        setTextContent(text);
      }
    } catch (err: any) {
      console.error("Error loading file:", err);
      setError(err.message || "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileUrl && file) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file.name;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!file) return null;

  const previewType = getPreviewType(file.mime_type);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <FileText className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={loadFile}>
            Retry
          </Button>
        </div>
      );
    }

    if (!fileUrl) return null;

    switch (previewType) {
      case "image":
        return (
          <div className="flex items-center justify-center overflow-auto bg-muted/30 rounded-lg p-4 min-h-96">
            <img
              src={fileUrl}
              alt={file.name}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease",
                maxWidth: "100%",
                maxHeight: "70vh",
              }}
              className="object-contain"
            />
          </div>
        );

      case "pdf":
        return (
          <iframe
            src={`${fileUrl}#toolbar=1`}
            className="w-full h-[70vh] rounded-lg border border-border"
            title={file.name}
          />
        );

      case "video":
        return (
          <video
            src={fileUrl}
            controls
            className="w-full max-h-[70vh] rounded-lg bg-black"
          >
            Your browser does not support the video tag.
          </video>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg p-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-primary" />
            </div>
            <audio src={fileUrl} controls className="w-full max-w-md">
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case "text":
        return (
          <div className="bg-muted/30 rounded-lg p-4 max-h-[70vh] overflow-auto">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
              {textContent}
            </pre>
          </div>
        );

      case "unsupported":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <FileText className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-sm mb-2">Preview not available for this file type</p>
            <p className="text-xs opacity-70">{file.mime_type || "Unknown type"}</p>
            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download to view
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <DialogTitle className="truncate">{file.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatFileSize(file.size_bytes)}
                {file.mime_type && ` • ${file.mime_type}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar for images */}
        {previewType === "image" && fileUrl && !loading && (
          <div className="flex items-center justify-center gap-2 py-2 border-b border-border">
            <Button variant="ghost" size="icon-sm" onClick={handleZoomOut} disabled={zoom <= 25}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon-sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-2" />
            <Button variant="ghost" size="icon-sm" onClick={handleRotate}>
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Preview content */}
        <div className="flex-1 overflow-hidden">{renderPreview()}</div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab} disabled={!fileUrl}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!fileUrl}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
