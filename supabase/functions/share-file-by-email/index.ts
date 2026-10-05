import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Input validation schema
const shareFileSchema = z.object({
  fileId: z.string().uuid("Invalid file ID format"),
  email: z.string().email("Invalid email format").max(255),
  permission: z.enum(["view", "edit"]).default("view"),
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = shareFileSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error.errors);
      return new Response(
        JSON.stringify({ error: validation.error.errors[0]?.message || 'Invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { fileId, email, permission } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`User ${user.id} attempting to share file ${fileId} with ${normalizedEmail}`);

    // Verify the requester owns the file
    const { data: file, error: fileError } = await supabaseClient
      .from('files')
      .select('id, user_id, name')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      console.error('File not found:', fileError);
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (file.user_id !== user.id) {
      console.warn(`User ${user.id} attempted to share file ${fileId} owned by ${file.user_id}`);
      return new Response(
        JSON.stringify({ error: 'You can only share files you own' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to look up user by email (server-side only)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Look up the target user by email using listUsers with filter
    const { data: usersData, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();

    if (lookupError) {
      console.error('Error looking up users:', lookupError);
      return new Response(
        JSON.stringify({ error: 'An error occurred while processing your request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user by email (case-insensitive)
    const targetUser = usersData.users.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (!targetUser) {
      // Don't reveal whether the email exists or not for privacy
      console.log(`Share attempt to non-existent email: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({ error: 'Unable to share with this email. The user may need to create an account first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUserId = targetUser.id;

    // Prevent sharing with self
    if (targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot share a file with yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already shared with this user
    const { data: existingShare, error: checkError } = await supabaseAdmin
      .from('file_shares')
      .select('id')
      .eq('file_id', fileId)
      .eq('shared_with_user_id', targetUserId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing share:', checkError);
      return new Response(
        JSON.stringify({ error: 'An error occurred while processing your request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingShare) {
      return new Response(
        JSON.stringify({ error: 'File already shared with this user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the file share
    const { error: shareError } = await supabaseAdmin
      .from('file_shares')
      .insert({
        file_id: fileId,
        shared_with_user_id: targetUserId,
        permission_level: permission,
      });

    if (shareError) {
      console.error('Error creating share:', shareError);
      return new Response(
        JSON.stringify({ error: 'Failed to share file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully shared file ${fileId} with user ${targetUserId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `File shared successfully with ${normalizedEmail}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in share-file-by-email:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
