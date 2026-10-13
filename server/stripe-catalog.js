export const PRODUCTS = {
  "aurora-wireless-earbuds-pro": {
    name: "Aurora Wireless Earbuds Pro",
    price: 8999,
    variants: {
      "Sage Green": 500,
      "Pearl White": 0,
      "Midnight Black": 0,
    },
  },
  "lumi-smart-desk-lamp": {
    name: "Lumi Smart Desk Lamp",
    price: 6499,
    variants: { "Matte Black": 0, "Warm White": 0 },
  },
  "pulse-mini-bluetooth-speaker": {
    name: "JBL Mini Speaker",
    price: 5500,
    variants: { "Ocean Blue": 0, Charcoal: 0 },
  },
  "chargepad-pro-wireless-charger": {
    name: "ChargePad Pro Wireless Charger",
    price: 3499,
    variants: {},
  },
  "flow-mechanical-keyboard": {
    name: "Flow Mechanical Keyboard",
    price: 11999,
    variants: { "Clicky Blue": 0, "Tactile Brown": 0, "Linear Red": 0 },
  },
  "vivo-smart-watch-lite": {
    name: "Vivo Smart Watch Lite",
    price: 9999,
    variants: {
      "Milanese Loop": 2000,
      Leather: 1500,
      "Sport Silicone": 0,
    },
  },
  "nomad-portable-power-bank-20k": {
    name: "Nomad Portable Power Bank 20K",
    price: 5999,
    variants: {},
  },
  "brewgo-smart-mug-warmer": {
    name: "BrewGo Smart Mug Warmer",
    price: 2499,
    variants: {},
  },
  "elevate-aluminum-laptop-stand": {
    name: "Elevate Aluminum Laptop Stand",
    price: 4499,
    variants: {},
  },
  "studio-over-ear-headphones": {
    name: "Studio Over-Ear Headphones",
    price: 9268,
    variants: { "Space Gray": 0, Silver: 0 },
  },
};

export function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !/^sk_(test|live)_/.test(secretKey)) {
    throw new Error("Configure STRIPE_SECRET_KEY in the hosting provider's environment variables.");
  }
  return secretKey;
}

export async function stripeRequest(path, secretKey, params) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(params ? { body: params } : {}),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Stripe API request failed:", result.error?.message || response.status);
    throw new Error("Payment service could not complete the request.");
  }
  return result;
}

export function validateSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host) return false;
  if (!origin) return req.method === "GET";
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function getRequestBaseUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";
  return new URL(`${protocol}://${host}`);
}
