import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const SendNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less").trim(),
  message: z.string().min(1, "Message is required").max(2000, "Message must be 2000 characters or less").trim(),
  type: z.enum(["info", "success", "warning", "error"], { errorMap: () => ({ message: "Type must be info, success, warning, or error" }) }),
  recipients: z.union([
    z.enum(["all", "admins", "moderators", "users"]),
    z.array(z.string().uuid("Each recipient must be a valid UUID"))
  ]),
  actionUrl: z.string().url("Action URL must be a valid URL").max(500, "Action URL must be 500 characters or less").optional().nullable(),
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check if user is admin using service role client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const validationResult = SendNotificationSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(", ");
      return new Response(
        JSON.stringify({ error: `Validation error: ${errorMessages}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, message, type, recipients, actionUrl } = validationResult.data;

    // Get target user IDs based on recipients
    let targetUserIds: string[] = [];

    if (Array.isArray(recipients)) {
      // Specific user IDs provided (already validated as UUIDs)
      targetUserIds = recipients;
    } else {
      // Get users by role/all
      let query = supabaseAdmin.from("profiles").select("id");

      if (recipients === "all") {
        // Get all users
        const { data: allUsers, error: allError } = await query;
        if (allError) throw allError;
        targetUserIds = (allUsers || []).map((u) => u.id);
      } else {
        // Get users with specific role
        const roleMap: Record<string, string> = {
          admins: "admin",
          moderators: "moderator",
          users: "user",
        };
        const targetRole = roleMap[recipients];
        
        if (targetRole) {
          const { data: roleUsers, error: roleUsersError } = await supabaseAdmin
            .from("user_roles")
            .select("user_id")
            .eq("role", targetRole);
          
          if (roleUsersError) throw roleUsersError;
          targetUserIds = (roleUsers || []).map((u) => u.user_id);
        }
      }
    }

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No recipients found", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notifications for all target users
    const notifications = targetUserIds.map((targetUserId) => ({
      user_id: targetUserId,
      title,
      message,
      type,
      action_url: actionUrl || null,
      is_read: false,
    }));

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert(notifications)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log(`Sent ${insertedData?.length || 0} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: insertedData?.length || 0,
        message: `Notification sent to ${insertedData?.length || 0} user(s)`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while sending the notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
