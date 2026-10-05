import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  File, 
  Download, 
  Loader2, 
  AlertCircle,
  Cloud,
  ArrowLeft
} from "lucide-react";

interface SharedFile {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number;
  signedUrl: string;
}

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Validate token format (hex string, 16-64 chars)
const isValidToken = (token: string): boolean => {
  return /^[a-f0-9]{16,64}$/i.test(token);
};

export default function PublicShare() {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (token) {
      // Validate token format before making request
      if (!isValidToken(token)) {
        setError("Invalid share link.");
        setLoading(false);
        return;
      }
      fetchSharedFile();
    }
  }, [token]);

  const fetchSharedFile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use edge function for rate-limited access
      const { data, error: fetchError } = await supabase.functions.invoke("public-share", {
        method: "GET",
        body: null,
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        // Use query params approach via direct fetch since invoke doesn't support query params
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-share?token=${encodeURIComponent(token!)}&action=preview`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: data };
        }
        return { data, error: null };
      });

      if (fetchError) {
        if (fetchError.error === "Too many requests. Please try again later.") {
          setError("Too many requests. Please wait a moment and try again.");
        } else if (fetchError.error === "File not found or link has expired") {
          setError("This file is not available or the link has expired.");
        } else {
          setError("Failed to load the shared file.");
        }
        return;
      }

      if (!data) {
        setError("This file is not available or the link has expired.");
        return;
      }

      setFile(data);
    } catch (err) {
      console.error("Error fetching shared file:", err);
      setError("Failed to load the shared file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file || !token) return;

    setDownloading(true);
    try {
      // Get fresh download URL via edge function
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-share?token=${encodeURIComponent(token)}&action=download`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error === "Too many requests. Please try again later.") {
          console.error("Rate limited");
        }
        throw new Error("Failed to get download URL");
      }

      const data = await res.json();

      if (data?.signedUrl) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error downloading file:", err);
    } finally {
      setDownloading(false);
    }
  };

  const FileIcon = file ? getFileIcon(file.mime_type) : File;

  // Check if file type supports preview
  const supportsPreview = file?.mime_type?.startsWith("image/") || 
                          file?.mime_type?.startsWith("video/") || 
                          file?.mime_type?.startsWith("audio/") || 
                          file?.mime_type === "application/pdf";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Cloudly</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">
              Sign In
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading shared file...</p>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2">File Not Available</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : file ? (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                {/* File Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold truncate">{file.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size_bytes)} • Shared publicly
                    </p>
                  </div>
                  <Button onClick={handleDownload} disabled={downloading} className="gap-2">
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download
                  </Button>
                </div>

                {/* Preview */}
                {supportsPreview && file.signedUrl && (
                  <div className="border rounded-lg overflow-hidden bg-muted/30">
                    {file.mime_type?.startsWith("image/") && (
                      <img 
                        src={file.signedUrl} 
                        alt={file.name}
                        className="max-w-full h-auto mx-auto max-h-[500px] object-contain"
                      />
                    )}
                    {file.mime_type?.startsWith("video/") && (
                      <video 
                        src={file.signedUrl} 
                        controls 
                        className="w-full max-h-[500px]"
                      />
                    )}
                    {file.mime_type?.startsWith("audio/") && (
                      <div className="p-8">
                        <audio src={file.signedUrl} controls className="w-full" />
                      </div>
                    )}
                    {file.mime_type === "application/pdf" && (
                      <iframe 
                        src={file.signedUrl} 
                        className="w-full h-[600px]"
                        title={file.name}
                      />
                    )}
                  </div>
                )}

                {!supportsPreview && (
                  <div className="border rounded-lg p-12 bg-muted/30 flex flex-col items-center justify-center">
                    <FileIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Preview not available for this file type</p>
                    <p className="text-sm text-muted-foreground mt-1">Click download to view the file</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
