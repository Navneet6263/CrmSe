import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing scheduled notifications...");

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pending scheduled notifications that are due
    const now = new Date().toISOString();
    const { data: pendingNotifications, error: fetchError } = await supabaseAdmin
      .from("scheduled_notifications")
      .select("*")
      .eq("sent", false)
      .lte("scheduled_for", now)
      .limit(50);

    if (fetchError) {
      console.error("Error fetching scheduled notifications:", fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("No pending notifications to process");
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending notifications" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${pendingNotifications.length} notifications to process`);

    let totalSent = 0;

    for (const scheduled of pendingNotifications) {
      try {
        // Determine target user IDs
        let targetUserIds: string[] = [];
        const recipients = scheduled.recipients;

        if (Array.isArray(recipients)) {
          // Specific user IDs
          targetUserIds = recipients;
        } else if (typeof recipients === "string") {
          if (recipients === "all") {
            const { data: allUsers, error: allError } = await supabaseAdmin
              .from("profiles")
              .select("id");
            if (allError) throw allError;
            targetUserIds = (allUsers || []).map((u) => u.id);
          } else {
            // Role-based
            const roleMap: Record<string, string> = {
              admins: "admin",
              moderators: "moderator",
              users: "user",
            };
            const targetRole = roleMap[recipients];
            if (targetRole) {
              const { data: roleUsers, error: roleError } = await supabaseAdmin
                .from("user_roles")
                .select("user_id")
                .eq("role", targetRole);
              if (roleError) throw roleError;
              targetUserIds = (roleUsers || []).map((u) => u.user_id);
            }
          }
        }

        if (targetUserIds.length === 0) {
          console.log(`No recipients for scheduled notification ${scheduled.id}`);
          // Mark as sent with 0 count
          await supabaseAdmin
            .from("scheduled_notifications")
            .update({ sent: true, sent_at: now, sent_count: 0 })
            .eq("id", scheduled.id);
          continue;
        }

        // Create notifications for all target users
        const notifications = targetUserIds.map((userId) => ({
          user_id: userId,
          title: scheduled.title,
          message: scheduled.message,
          type: scheduled.type,
          action_url: scheduled.action_url || null,
          is_read: false,
        }));

        const { data: insertedData, error: insertError } = await supabaseAdmin
          .from("notifications")
          .insert(notifications)
          .select();

        if (insertError) {
          console.error(`Error sending notification ${scheduled.id}:`, insertError);
          throw insertError;
        }

        const sentCount = insertedData?.length || 0;
        totalSent += sentCount;

        // Mark scheduled notification as sent
        await supabaseAdmin
          .from("scheduled_notifications")
          .update({ sent: true, sent_at: now, sent_count: sentCount })
          .eq("id", scheduled.id);

        console.log(`Sent ${sentCount} notifications for scheduled ${scheduled.id}`);
      } catch (err) {
        console.error(`Failed to process scheduled notification ${scheduled.id}:`, err);
        // Continue with other notifications
      }
    }

    console.log(`Processed ${pendingNotifications.length} scheduled, sent ${totalSent} total`);

    return new Response(
      JSON.stringify({
        processed: pendingNotifications.length,
        sent: totalSent,
        message: `Processed ${pendingNotifications.length} scheduled notifications`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing scheduled notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
