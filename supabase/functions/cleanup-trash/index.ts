import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting trash cleanup job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // SECURITY: Validate authorization
    // Option 1: Check for cron secret header (for scheduled jobs)
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedCronSecret = Deno.env.get("CRON_SECRET");
    
    // Option 2: Check for admin user auth (for manual triggers)
    const authHeader = req.headers.get("authorization");
    let isAuthorized = false;

    // If cron secret is configured and matches, authorize
    if (expectedCronSecret && cronSecret === expectedCronSecret) {
      console.log("Authorized via cron secret");
      isAuthorized = true;
    }
    
    // If not authorized by cron secret, check for admin user
    if (!isAuthorized && authHeader) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader },
        },
      });
      
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error("Authentication failed:", userError?.message);
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (roleError || !roleData) {
        console.error("Admin role check failed:", roleError?.message || "User is not an admin");
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`Authorized via admin user: ${user.email}`);
      isAuthorized = true;
    }
    
    // If still not authorized, reject the request
    if (!isAuthorized) {
      console.error("No valid authorization provided");
      return new Response(
        JSON.stringify({ error: "Authorization required. Provide either x-cron-secret header or admin user authentication." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Now proceed with the cleanup using service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    console.log(`Finding files deleted before: ${cutoffDate}`);

    // Find all files that have been in trash for more than 30 days
    const { data: expiredFiles, error: fetchError } = await supabase
      .from("files")
      .select("id, storage_path, name, user_id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", cutoffDate);

    if (fetchError) {
      console.error("Error fetching expired files:", fetchError);
      throw fetchError;
    }

    if (!expiredFiles || expiredFiles.length === 0) {
      console.log("No expired files to clean up");
      return new Response(
        JSON.stringify({ message: "No expired files to clean up", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredFiles.length} expired files to delete`);

    let deletedCount = 0;
    let errorCount = 0;

    // Delete each file from storage and database
    for (const file of expiredFiles) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from("user-files")
          .remove([file.storage_path]);

        if (storageError) {
          console.error(`Error deleting file from storage: ${file.storage_path}`, storageError);
          // Continue anyway to delete from database
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from("files")
          .delete()
          .eq("id", file.id);

        if (dbError) {
          console.error(`Error deleting file from database: ${file.id}`, dbError);
          errorCount++;
        } else {
          console.log(`Successfully deleted file: ${file.name} (${file.id})`);
          deletedCount++;
        }
      } catch (err) {
        console.error(`Error processing file ${file.id}:`, err);
        errorCount++;
      }
    }

    console.log(`Cleanup complete. Deleted: ${deletedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        message: "Trash cleanup completed",
        deletedCount,
        errorCount,
        totalProcessed: expiredFiles.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in cleanup-trash function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
