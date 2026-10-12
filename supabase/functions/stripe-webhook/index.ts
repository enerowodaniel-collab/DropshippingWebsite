import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { savePaidCheckout } from "../_shared/paid-checkout.ts";

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const fields = signature.split(",").map((field) => field.split("=", 2));
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  const signatures = fields.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = toHex(new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)),
  ));
  return signatures.some((candidate) => safeEqual(candidate, digest));
}

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("Stripe webhook secrets or Supabase service credentials are missing.");
    return new Response("Webhook is not configured.", { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature || !await verifySignature(payload, signature, webhookSecret)) {
    return new Response("Invalid Stripe signature.", { status: 400 });
  }

  try {
    const event = JSON.parse(payload);
    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      return Response.json({ received: true });
    }

    const sessionId = event.data?.object?.id;
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return new Response("Invalid checkout session.", { status: 400 });
    }

    await savePaidCheckout(sessionId, stripeSecretKey, supabaseUrl, serviceRoleKey);
    return Response.json({ received: true });
  } catch (error) {
    console.error("Unable to process Stripe webhook event:", error);
    return new Response("Unable to process event.", { status: 500 });
  }
});
