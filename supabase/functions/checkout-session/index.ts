import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { savePaidCheckout } from "../_shared/paid-checkout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

type CheckoutItem = {
  productId: string;
  quantity: number;
  variantValue?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  if (!stripeSecretKey) {
    return jsonResponse({ requiresSetup: true });
  }

  try {
    const body = await req.json();
    if (body.action === "verify") {
      if (typeof body.sessionId !== "string" || !body.sessionId.startsWith("cs_")) {
        return jsonResponse({ error: "Invalid checkout session." }, 400);
      }
      if (!supabaseUrl || !serviceRoleKey) {
        console.error("Payment verification requires Supabase service credentials.");
        return jsonResponse({ error: "We could not verify your payment yet." }, 500);
      }

      const paid = await savePaidCheckout(
        body.sessionId,
        stripeSecretKey,
        supabaseUrl,
        serviceRoleKey,
        false,
      );
      return jsonResponse({
        paymentStatus: paid ? "paid" : "unpaid",
      });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Checkout requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
      return jsonResponse({ error: "Checkout is temporarily unavailable." }, 500);
    }

    const { items, email, shippingAddress } = body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.province ||
      !shippingAddress.postalCode
    ) {
      return jsonResponse({ error: "Please check your contact, shipping, and cart details." }, 400);
    }

    const validItems = items as CheckoutItem[];
    if (validItems.some((item) =>
      !item ||
      typeof item.productId !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99 ||
      (item.variantValue !== undefined && typeof item.variantValue !== "string")
    )) {
      return jsonResponse({ error: "Your cart contains an invalid item or quantity." }, 400);
    }

    const productIds = [...new Set(validItems.map((item) => item.productId))];
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let customerUserId: string | undefined;
    const authorization = req.headers.get("authorization");
    if (authorization) {
      const accessToken = authorization.replace(/^Bearer\s+/i, "");
      const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError) customerUserId = authData.user?.id;
    }
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, price, images, status, stock_status, stock_quantity")
      .in("id", productIds);

    if (productsError) {
      console.error("Unable to load checkout products:", productsError.message);
      return jsonResponse({ error: "We could not verify your cart. Please try again." }, 500);
    }
    if (!products || products.length !== productIds.length) {
      return jsonResponse({ error: "One or more items are no longer available." }, 400);
    }

    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("product_id, name, value, price_adjustment")
      .in("product_id", productIds);

    if (variantsError) {
      console.error("Unable to load checkout variants:", variantsError.message);
      return jsonResponse({ error: "We could not verify your cart. Please try again." }, 500);
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const lineItems: Array<{
      name: string;
      amount: number;
      quantity: number;
      productId?: string;
      productSlug?: string;
      productImage?: string;
      variantName?: string;
      variantValue?: string;
    }> = [];

    for (const item of validItems) {
      const product = productById.get(item.productId);
      if (!product || product.status !== "active" || product.stock_status === "out_of_stock") {
        return jsonResponse({ error: "One or more items are no longer available." }, 400);
      }
      if (product.stock_status === "in_stock" && item.quantity > product.stock_quantity) {
        return jsonResponse({ error: `${product.name} does not have enough stock.` }, 400);
      }

      const variant = item.variantValue
        ? variants.find((entry) =>
          entry.product_id === item.productId && entry.value === item.variantValue
        )
        : undefined;
      if (item.variantValue && !variant) {
        return jsonResponse({ error: `The selected option for ${product.name} is unavailable.` }, 400);
      }

      const price = Number(product.price) + Number(variant?.price_adjustment || 0);
      if (!Number.isFinite(price) || price < 0) {
        return jsonResponse({ error: `The price for ${product.name} is invalid.` }, 400);
      }

      lineItems.push({
        name: `${product.name}${variant ? ` - ${variant.name}: ${variant.value}` : ""}`,
        amount: Math.round(price * 100),
        quantity: item.quantity,
        productId: product.id,
        productSlug: product.slug,
        productImage: product.images?.[0],
        variantName: variant?.name,
        variantValue: variant?.value,
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 500;
    const tax = Math.round(subtotal * 0.05);
    if (shipping > 0) lineItems.push({ name: "Shipping", amount: shipping, quantity: 1 });
    if (tax > 0) lineItems.push({ name: "GST (5%)", amount: tax, quantity: 1 });

    const origin = req.headers.get("origin");
    if (!origin) return jsonResponse({ error: "Unable to determine the checkout return address." }, 400);
    const returnUrl = new URL("/checkout", origin);

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("customer_email", email.trim());
    params.set("success_url", `${returnUrl.origin}${returnUrl.pathname}?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", new URL("/cart", origin).toString());
    params.set("shipping_address_collection[allowed_countries][0]", "CA");
    params.set("phone_number_collection[enabled]", "true");
    params.set("metadata[customer_name]", String(shippingAddress.name).slice(0, 200));
    params.set("metadata[shipping_address]", JSON.stringify(shippingAddress).slice(0, 500));
    params.set("metadata[cart_subtotal]", String(subtotal));
    params.set("metadata[shipping_total]", String(shipping));
    params.set("metadata[tax_total]", String(tax));
    if (customerUserId) params.set("metadata[customer_user_id]", customerUserId);

    lineItems.forEach((item, index) => {
      params.set(`line_items[${index}][price_data][currency]`, "cad");
      params.set(`line_items[${index}][price_data][product_data][name]`, item.name);
      params.set(`line_items[${index}][price_data][unit_amount]`, String(item.amount));
      if (item.productId) {
        params.set(`line_items[${index}][price_data][product_data][metadata][product_id]`, item.productId);
        params.set(`line_items[${index}][price_data][product_data][metadata][product_slug]`, item.productSlug || "");
        params.set(`line_items[${index}][price_data][product_data][metadata][variant_name]`, item.variantName || "");
        params.set(`line_items[${index}][price_data][product_data][metadata][variant_value]`, item.variantValue || "");
        const imageUrl = item.productImage?.startsWith("/")
          ? new URL(item.productImage, returnUrl.origin).toString()
          : item.productImage;
        if (imageUrl && /^https:\/\//.test(imageUrl)) {
          params.set(`line_items[${index}][price_data][product_data][images][0]`, imageUrl);
        }
      }
      params.set(`line_items[${index}][quantity]`, String(item.quantity));
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const stripeResult = await stripeResponse.json();
    if (!stripeResponse.ok) {
      console.error("Stripe could not create a checkout session:", stripeResult.error?.message);
      return jsonResponse({ error: "We could not start your payment. Please try again." }, 502);
    }

    return jsonResponse({ url: stripeResult.url, sessionId: stripeResult.id });
  } catch (error) {
    console.error("Checkout session failed:", error);
    return jsonResponse({ error: "We could not start your payment. Please try again." }, 500);
  }
});
