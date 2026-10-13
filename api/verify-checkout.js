import {
  getStripeSecretKey,
  stripeRequest,
  validateSameOrigin,
} from "../server/stripe-catalog.js";

function sendJson(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  if (!validateSameOrigin(req)) {
    return sendJson(res, 403, { error: "Request origin is not allowed." });
  }

  const sessionId = req.query?.session_id;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return sendJson(res, 400, { error: "Invalid checkout session." });
  }

  try {
    const session = await stripeRequest(
      `checkout/sessions/${encodeURIComponent(sessionId)}`,
      getStripeSecretKey(),
    );
    return sendJson(res, 200, {
      paymentStatus: session.payment_status,
      sessionStatus: session.status,
    });
  } catch (error) {
    console.error("Unable to verify Stripe checkout:", error);
    return sendJson(res, 502, { error: "We could not verify your payment yet." });
  }
}
