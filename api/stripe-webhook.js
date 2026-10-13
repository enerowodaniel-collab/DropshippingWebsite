import { createHmac, timingSafeEqual } from "node:crypto";
import {
  getStripeSecretKey,
  stripeRequest,
} from "../server/stripe-catalog.js";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function isValidStripeSignature(payload, signatureHeader, secret) {
  const fields = signatureHeader.split(",").map((field) => field.split("=", 2));
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  const signatures = fields.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), expected);
  });
}

async function sendOrderEmail(session, stripeSecretKey) {
  if (session.metadata?.order_email_sent === "true") return;

  const { data: lineItems } = await stripeRequest(
    `checkout/sessions/${encodeURIComponent(session.id)}/line_items?limit=100&expand%5B%5D=data.price.product`,
    stripeSecretKey,
  );
  const orderedItems = lineItems.map((item) => {
    const quantity = item.quantity || 1;
    const unitAmount = item.price?.unit_amount ?? Math.round(item.amount_subtotal / quantity);
    return `${quantity} x ${item.description} — $${(unitAmount / 100).toFixed(2)} each`;
  }).join("\n");

  const response = await fetch("https://formsubmit.co/ajax/frncspls@gmail.com", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: "New paid NovaShop order",
      _template: "table",
      customer_name: session.shipping_details?.name || session.customer_details?.name || session.metadata?.customer_name || "",
      customer_email: session.customer_details?.email || session.customer_email || "",
      customer_phone: session.metadata?.customer_phone || "",
      shipping_address: [
        session.metadata?.shipping_address,
        [
          session.metadata?.shipping_city,
          session.metadata?.shipping_province,
          session.metadata?.shipping_postal_code,
        ].filter(Boolean).join(", "),
        session.metadata?.shipping_country,
      ].filter(Boolean).join("\n"),
      items_ordered: orderedItems,
      order_total_cad: `$${((session.amount_total || 0) / 100).toFixed(2)} CAD`,
    }),
  });
  const result = await response.json();
  if (!response.ok || (result.success !== true && result.success !== "true")) {
    throw new Error(`FormSubmit could not send the order email: ${result.message || response.status}`);
  }

  const metadata = new URLSearchParams();
  metadata.set("metadata[order_email_sent]", "true");
  await stripeRequest(
    `checkout/sessions/${encodeURIComponent(session.id)}`,
    stripeSecretKey,
    metadata,
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed.");
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Configure STRIPE_WEBHOOK_SECRET in the hosting provider's environment variables.");
    res.status(500).end("Webhook is not configured.");
    return;
  }

  const payload = await readRawBody(req);
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string" || !isValidStripeSignature(payload, signature, webhookSecret)) {
    res.status(400).end("Invalid Stripe signature.");
    return;
  }

  try {
    const event = JSON.parse(payload.toString("utf8"));
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const sessionId = event.data?.object?.id;
      if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
        res.status(400).end("Invalid checkout session.");
        return;
      }

      const secretKey = getStripeSecretKey();
      const session = await stripeRequest(
        `checkout/sessions/${encodeURIComponent(sessionId)}`,
        secretKey,
      );
      if (session.payment_status === "paid") {
        await sendOrderEmail(session, secretKey);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Unable to process Stripe webhook:", error);
    res.status(500).end("Unable to process event.");
  }
}
