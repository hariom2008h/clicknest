import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "hariombhadana795@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-custom-auth, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("x-custom-auth");
  if (!authHeader) return false;

  // Verify with Clerk backend API
  const clerkSecret = Deno.env.get("CLERK_SECRET_KEY");
  if (!clerkSecret) return false;

  try {
    // authHeader contains the Clerk user ID
    const res = await fetch(`https://api.clerk.com/v1/users/${authHeader}`, {
      headers: { Authorization: `Bearer ${clerkSecret}` },
    });
    if (!res.ok) return false;
    const user = await res.json();
    const email = user.email_addresses?.find(
      (e: any) => e.id === user.primary_email_address_id
    )?.email_address;
    return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { action, payload } = await req.json();

  try {
    let data, error;

    switch (action) {
      case "list":
        ({ data, error } = await supabase.from("categories").select("*").order("name"));
        break;
      case "create":
        ({ data, error } = await supabase.from("categories").insert(payload).select().single());
        break;
      case "update":
        ({ data, error } = await supabase
          .from("categories")
          .update(payload.data)
          .eq("id", payload.id)
          .select()
          .single());
        break;
      case "delete":
        ({ error } = await supabase.from("categories").delete().eq("id", payload.id));
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (error) throw error;
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
