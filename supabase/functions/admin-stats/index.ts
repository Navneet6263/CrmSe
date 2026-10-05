import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Not authenticated");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
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
      throw new Error("Not authorized - admin access required");
    }

    // Fetch total users count
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("Error fetching users count:", usersError);
    }

    // Fetch total storage used
    const { data: storageData, error: storageError } = await supabaseAdmin
      .from("files")
      .select("size_bytes")
      .is("deleted_at", null);

    let totalStorageBytes = 0;
    if (!storageError && storageData) {
      totalStorageBytes = storageData.reduce((acc, file) => acc + (file.size_bytes || 0), 0);
    }

    // Fetch total files count
    const { count: totalFiles, error: filesError } = await supabaseAdmin
      .from("files")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (filesError) {
      console.error("Error fetching files count:", filesError);
    }

    // Fetch users by role
    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role");

    const roleDistribution = { admin: 0, moderator: 0, user: 0 };
    if (!rolesError && rolesData) {
      rolesData.forEach((r) => {
        if (r.role in roleDistribution) {
          roleDistribution[r.role as keyof typeof roleDistribution]++;
        }
      });
    }

    // Calculate regular users (users without specific roles)
    const usersWithRoles = rolesData?.length || 0;
    roleDistribution.user = Math.max(0, (totalUsers || 0) - usersWithRoles + roleDistribution.user);

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups, error: signupsError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    if (signupsError) {
      console.error("Error fetching recent signups:", signupsError);
    }

    // Active users (users with files)
    const { data: activeUsersData, error: activeError } = await supabaseAdmin
      .from("files")
      .select("user_id")
      .is("deleted_at", null);

    const activeUsers = activeError ? 0 : new Set(activeUsersData?.map(f => f.user_id) || []).size;

    return new Response(
      JSON.stringify({
        totalUsers: totalUsers || 0,
        totalFiles: totalFiles || 0,
        totalStorageBytes,
        roleDistribution,
        recentSignups: recentSignups || 0,
        activeUsers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin stats error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
