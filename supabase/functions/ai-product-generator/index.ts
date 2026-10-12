import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AI_API_KEY = Deno.env.get("AI_API_KEY") || "";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, keySpecs, keyBenefits } = await req.json();

    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify({ fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const specs = keySpecs?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];
    const benefits = keyBenefits?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];
    const productName = name || "this product";

    const prompt = `Generate product marketing content for an ecommerce store. Product name: ${productName}. Key specifications: ${specs.join(", ")}. Key benefits: ${benefits.join(", ")}. Generate: 1) A compelling product title, 2) A 2-3 sentence product description, 3) 4-5 bullet point benefits, 4) An SEO meta description (under 160 chars). Respond in JSON format: {"title":"","description":"","bullets":[],"seoMeta":""}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": AI_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      // fall through to fallback
    }

    return new Response(
      JSON.stringify({ fallback: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
