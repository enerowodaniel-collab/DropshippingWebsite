import {
  getRequestBaseUrl,
  getStripeSecretKey,
  PRODUCTS,
  stripeRequest,
  validateSameOrigin,
} from "../server/stripe-catalog.js";

function sendJson(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  if (!validateSameOrigin(req)) {
    return sendJson(res, 403, { error: "Request origin is not allowed." });
  }

  try {
    const secretKey = getStripeSecretKey();
    const { items, email, shippingAddress } = req.body || {};
    const requiredAddressFields = ["name", "address", "city", "province", "postalCode"];
    if (
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 50 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      !requiredAddressFields.every((field) =>
        typeof shippingAddress[field] === "string" &&
        shippingAddress[field].trim().length > 0 &&
        shippingAddress[field].trim().length <= 200
      ) ||
      (shippingAddress.phone !== undefined &&
        (typeof shippingAddress.phone !== "string" || shippingAddress.phone.length > 40)) ||
      shippingAddress.country !== "Canada"
    ) {
      return sendJson(res, 400, { error: "Please check your contact, shipping, and cart details." });
    }

    const lineItems = [];
    for (const item of items) {
      if (
        !item ||
        typeof item.slug !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99 ||
        (item.variantValue !== undefined && typeof item.variantValue !== "string")
      ) {
        return sendJson(res, 400, { error: "Your cart contains an invalid item or quantity." });
      }

      const product = PRODUCTS[item.slug];
      if (!product) {
        return sendJson(res, 400, { error: "Your cart contains a product that is no longer available." });
      }

      const variantValue = item.variantValue || "";
      if (variantValue && !Object.hasOwn(product.variants, variantValue)) {
        return sendJson(res, 400, { error: `The selected option for ${product.name} is unavailable.` });
      }
      const unitAmount = product.price + (product.variants[variantValue] || 0);
      const name = variantValue ? `${product.name} (${variantValue})` : product.name;
      lineItems.push({ name, unitAmount, quantity: item.quantity, slug: item.slug, variantValue });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 500;
    const tax = Math.round(subtotal * 0.05);
    const stripeParams = new URLSearchParams();
    stripeParams.set("mode", "payment");
    stripeParams.set("customer_email", email.trim());
    stripeParams.set("success_url", `${getRequestBaseUrl(req).origin}/checkout?session_id={CHECKOUT_SESSION_ID}`);
    stripeParams.set("cancel_url", `${getRequestBaseUrl(req).origin}/cart`);
    stripeParams.set("metadata[customer_name]", shippingAddress.name.trim().slice(0, 200));
    stripeParams.set("metadata[shipping_address]", shippingAddress.address.trim());
    stripeParams.set("metadata[shipping_city]", shippingAddress.city.trim());
    stripeParams.set("metadata[shipping_province]", shippingAddress.province.trim());
    stripeParams.set("metadata[shipping_postal_code]", shippingAddress.postalCode.trim());
    stripeParams.set("metadata[shipping_country]", shippingAddress.country);
    stripeParams.set("metadata[customer_phone]", (shippingAddress.phone || "").trim().slice(0, 40));

    lineItems.forEach((item, index) => {
      stripeParams.set(`line_items[${index}][price_data][currency]`, "cad");
      stripeParams.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmount));
      stripeParams.set(`line_items[${index}][price_data][product_data][name]`, item.name);
      stripeParams.set(`line_items[${index}][price_data][product_data][metadata][product_slug]`, item.slug);
      stripeParams.set(`line_items[${index}][price_data][product_data][metadata][variant_value]`, item.variantValue);
      stripeParams.set(`line_items[${index}][quantity]`, String(item.quantity));
    });

    let nextIndex = lineItems.length;
    if (shipping > 0) {
      stripeParams.set(`line_items[${nextIndex}][price_data][currency]`, "cad");
      stripeParams.set(`line_items[${nextIndex}][price_data][unit_amount]`, String(shipping));
      stripeParams.set(`line_items[${nextIndex}][price_data][product_data][name]`, "Shipping");
      stripeParams.set(`line_items[${nextIndex}][quantity]`, "1");
      nextIndex += 1;
    }
    if (tax > 0) {
      stripeParams.set(`line_items[${nextIndex}][price_data][currency]`, "cad");
      stripeParams.set(`line_items[${nextIndex}][price_data][unit_amount]`, String(tax));
      stripeParams.set(`line_items[${nextIndex}][price_data][product_data][name]`, "GST (5%)");
      stripeParams.set(`line_items[${nextIndex}][quantity]`, "1");
    }

    const session = await stripeRequest("checkout/sessions", secretKey, stripeParams);
    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    console.error("Unable to start Stripe checkout:", error);
    if (error.message.includes("Configure STRIPE_SECRET_KEY")) {
      return sendJson(res, 503, {
        requiresSetup: true,
        error: "Payments are not configured yet. Please contact the store.",
      });
    }
    return sendJson(res, 500, {
      error: error.message || "We could not start your payment. Please try again.",
    });
  }
}
