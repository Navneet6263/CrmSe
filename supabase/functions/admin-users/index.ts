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
    if (!authHeader || authHeader === `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`) {
      throw new Error("Not authenticated");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
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

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Fetch users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (authError) {
      throw authError;
    }

    // Filter by search if provided
    let filteredUsers = authUsers.users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.email?.toLowerCase().includes(searchLower) ||
          u.user_metadata?.full_name?.toLowerCase().includes(searchLower)
      );
    }

    // Get roles for all users
    const userIds = filteredUsers.map((u) => u.id);
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    // Get storage usage per user
    const { data: storageData, error: storageError } = await supabaseAdmin
      .from("files")
      .select("user_id, size_bytes")
      .is("deleted_at", null)
      .in("user_id", userIds);

    const storageByUser: Record<string, number> = {};
    if (!storageError && storageData) {
      storageData.forEach((file) => {
        storageByUser[file.user_id] = (storageByUser[file.user_id] || 0) + (file.size_bytes || 0);
      });
    }

    // Get profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profilesById: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    if (!profilesError && profiles) {
      profiles.forEach((p) => {
        profilesById[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      });
    }

    // Combine data
    const users = filteredUsers.map((u) => {
      const roles = userRoles?.filter((r) => r.user_id === u.id).map((r) => r.role) || [];
      const profile = profilesById[u.id];
      
      // Check if user is banned
      const isBanned = u.banned_until ? new Date(u.banned_until) > new Date() : false;
      
      return {
        id: u.id,
        email: u.email,
        fullName: profile?.full_name || u.user_metadata?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
        roles: roles.length > 0 ? roles : ["user"],
        storageUsed: storageByUser[u.id] || 0,
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at,
        emailConfirmed: u.email_confirmed_at !== null,
        isBanned,
      };
    });

    return new Response(
      JSON.stringify({
        users,
        total: authUsers.users.length,
        page,
        limit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin users error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
