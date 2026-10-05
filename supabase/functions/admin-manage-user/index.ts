import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const ManageUserSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
  action: z.enum(["delete", "disable", "enable"], { errorMap: () => ({ message: "Action must be delete, disable, or enable" }) }),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const validationResult = ManageUserSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(", ");
      return new Response(
        JSON.stringify({ error: `Validation error: ${errorMessages}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, action } = validationResult.data;

    // Prevent admin from deleting/disabling themselves
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot modify your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user info first
    const { data: targetUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getUserError || !targetUser.user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      // Delete user's files from storage first
      const { data: files } = await supabaseAdmin
        .from("files")
        .select("storage_path")
        .eq("user_id", userId);

      if (files && files.length > 0) {
        const paths = files.map(f => f.storage_path);
        await supabaseAdmin.storage.from("user-files").remove(paths);
      }

      // Delete the user (cascades to related tables)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error("Delete error:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`User ${userId} deleted by admin ${user.id}`);
      
      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "disable") {
      // Ban the user (disable their account)
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "876000h", // ~100 years
      });

      if (banError) {
        console.error("Ban error:", banError);
        return new Response(
          JSON.stringify({ error: "Failed to disable user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`User ${userId} disabled by admin ${user.id}`);

      return new Response(
        JSON.stringify({ success: true, message: "User disabled successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "enable") {
      // Unban the user (re-enable their account)
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (unbanError) {
        console.error("Unban error:", unbanError);
        return new Response(
          JSON.stringify({ error: "Failed to enable user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`User ${userId} enabled by admin ${user.id}`);

      return new Response(
        JSON.stringify({ success: true, message: "User enabled successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin manage user error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing the request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
