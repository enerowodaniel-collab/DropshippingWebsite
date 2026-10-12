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
    const { message, products } = await req.json();

    if (!message || !products || !Array.isArray(products)) {
      return new Response(
        JSON.stringify({ error: "Missing message or products" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no AI API key, return fallback flag for client-side matching
    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify({ fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a compact catalog for the AI
    const catalog = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      short_description: p.short_description,
      benefits: p.benefits,
      specifications: p.specifications,
      stock_status: p.stock_status,
    }));

    const systemPrompt = `You are a helpful shopping assistant for NovaShop, a Canadian online store selling tech gadgets and lifestyle products. Answer customer questions using ONLY the provided product catalog. Never invent products, prices, or features. If you recommend products, include their IDs so the frontend can display them. Keep responses concise and friendly. If you cannot answer based on the catalog, say so honestly.

Product catalog: ${JSON.stringify(catalog)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": AI_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I could not process that request.";

    // Extract product IDs from reply if mentioned
    const mentionedProducts = products.filter((p: any) =>
      reply.toLowerCase().includes(p.name.toLowerCase())
    ).slice(0, 3);

    return new Response(
      JSON.stringify({ reply, products: mentionedProducts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
