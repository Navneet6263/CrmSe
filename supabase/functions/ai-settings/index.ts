import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema for POST
const AISettingsSchema = z.object({
  apiKey: z.string().min(1).max(200).refine(val => val.startsWith("sk-"), {
    message: "API key must start with 'sk-'"
  }).optional(),
  model: z.enum([
    "gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo",
    "google/gemini-3-flash-preview", "google/gemini-2.5-flash", "google/gemini-2.5-pro"
  ], { errorMap: () => ({ message: "Invalid model selection" }) }).optional(),
});

serve(async (req) => {
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
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
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

    const method = req.method;

    if (method === "GET") {
      // Check if OpenAI API key is set
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      const hasKey = !!openaiKey && openaiKey.length > 0;

      // Get model from database
      const { data: settings } = await supabaseAdmin
        .from("ai_settings")
        .select("model")
        .single();

      return new Response(
        JSON.stringify({ 
          hasKey, 
          model: settings?.model || "gpt-4o-mini" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === "POST") {
      // Parse and validate request body
      const rawBody = await req.json();
      const validationResult = AISettingsSchema.safeParse(rawBody);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(", ");
        return new Response(
          JSON.stringify({ error: `Validation error: ${errorMessages}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { apiKey, model } = validationResult.data;

      // If API key is provided, validate it
      if (apiKey) {
        // Validate the key by making a test request
        const testResponse = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!testResponse.ok) {
          return new Response(
            JSON.stringify({ error: "Invalid API key" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Update model in database
      if (model) {
        await supabaseAdmin
          .from("ai_settings")
          .update({ 
            model, 
            has_api_key: !!apiKey || !!Deno.env.get("OPENAI_API_KEY"),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq("id", (await supabaseAdmin.from("ai_settings").select("id").single()).data?.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "AI settings saved successfully" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === "DELETE") {
      // Update has_api_key to false
      await supabaseAdmin
        .from("ai_settings")
        .update({ 
          has_api_key: false,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq("id", (await supabaseAdmin.from("ai_settings").select("id").single()).data?.id);

      return new Response(
        JSON.stringify({ success: true, message: "AI settings cleared" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI settings error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
