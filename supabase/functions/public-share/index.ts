import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

// Input validation schema
const PublicShareSchema = z.object({
  token: z.string().min(1, "Token is required").max(64, "Token too long").regex(/^[a-f0-9]+$/, "Invalid token format"),
  action: z.enum(["preview", "download"]).default("preview"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting (use token as fallback)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Parse request
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const action = url.searchParams.get("action") || "preview";

    // Validate input
    const validationResult = PublicShareSchema.safeParse({ token, action });
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(", ");
      return new Response(
        JSON.stringify({ error: `Validation error: ${errorMessages}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedData = validationResult.data;

    // Rate limit by IP + token combination
    const rateLimitKey = `${clientIP}:${validatedData.token}`;
    if (!checkRateLimit(rateLimitKey)) {
      console.log(`Rate limit exceeded for ${rateLimitKey}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client to query files table (bypasses RLS safely)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch only safe fields - never expose user_id or storage_path to client
    const { data: file, error: fetchError } = await supabaseAdmin
      .from("files")
      .select("id, name, mime_type, size_bytes, storage_path")
      .eq("public_share_token", validatedData.token)
      .eq("public_share_enabled", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError) {
      console.error("Database error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to load file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!file) {
      return new Response(
        JSON.stringify({ error: "File not found or link has expired" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed URL based on action
    const ttl = validatedData.action === "download" ? 60 : 3600; // 1 min for download, 1 hour for preview
    
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from("user-files")
      .createSignedUrl(file.storage_path, ttl);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "Failed to generate access URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log access for monitoring (don't expose sensitive data)
    console.log(`Public share access: token=${validatedData.token.substring(0, 8)}..., action=${validatedData.action}, ip=${clientIP}`);

    // Return file info without storage_path (security sensitive)
    return new Response(
      JSON.stringify({
        id: file.id,
        name: file.name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        signedUrl: signedUrlData.signedUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Public share error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
