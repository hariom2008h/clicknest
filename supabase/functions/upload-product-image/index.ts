import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "hariombhadana795@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-custom-auth, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("x-custom-auth");
  if (!authHeader) return false;
  const clerkSecret = Deno.env.get("CLERK_SECRET_KEY");
  if (!clerkSecret) return false;
  try {
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

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ext = file.name.split(".").pop() || "jpg";
    const path = `covers/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return new Response(
      JSON.stringify({ url: urlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
