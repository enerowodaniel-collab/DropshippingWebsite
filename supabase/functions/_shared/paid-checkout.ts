import { createClient } from "npm:@supabase/supabase-js@2";

type StripeSession = {
  id: string;
  status: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email: string | null;
  customer_details?: { email?: string | null; name?: string | null; phone?: string | null };
  shipping_details?: {
    name?: string | null;
    address?: Record<string, string | null>;
    phone?: string | null;
  };
  payment_intent: string | { id: string } | null;
  metadata: Record<string, string>;
};

type StripeLineItems = {
  data: Array<{
    description: string;
    quantity: number;
    amount_subtotal: number;
    price: {
      unit_amount: number | null;
      product: {
        name: string;
        images?: string[];
        metadata: Record<string, string>;
      };
    };
  }>;
};

async function sendOrderNotification(
  supabase: ReturnType<typeof createClient>,
  order: { id: string; order_number: string; grand_total: number; email_notification_sent_at?: string | null },
  customerName: string,
  customerEmail: string,
): Promise<void> {
  if (order.email_notification_sent_at) return;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, variant_name, variant_value, quantity, unit_price")
    .eq("order_id", order.id);
  if (itemsError) {
    console.error("Unable to load order items for email notification:", itemsError.message);
    return;
  }

  const orderContents = (items || []).map((item) => {
    const variant = item.variant_value
      ? ` (${item.variant_name ? `${item.variant_name}: ` : ""}${item.variant_value})`
      : "";
    return `${item.quantity} x ${item.product_name}${variant} — $${Number(item.unit_price).toFixed(2)} each`;
  }).join("\n");

  try {
    const response = await fetch("https://formsubmit.co/ajax/frncspls@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New paid NovaShop order ${order.order_number}`,
        _template: "table",
        order_number: order.order_number,
        customer_name: customerName,
        customer_email: customerEmail,
        items_ordered: orderContents,
        order_total_cad: `$${Number(order.grand_total).toFixed(2)} CAD`,
      }),
    });

    const result = await response.json();
    if (!response.ok || (result.success !== true && result.success !== "true")) {
      console.error("FormSubmit could not send the order notification:", result.message || response.status);
      return;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ email_notification_sent_at: new Date().toISOString() })
      .eq("id", order.id);
    if (updateError) console.error("Unable to record the order notification status:", updateError.message);
  } catch (error) {
    console.error("Unable to send the order notification through FormSubmit:", error);
  }
}

export async function savePaidCheckout(
  sessionId: string,
  stripeSecretKey: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  sendNotification = true,
): Promise<boolean> {
  const stripeHeaders = { Authorization: `Bearer ${stripeSecretKey}` };
  const sessionResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: stripeHeaders },
  );
  const session = await sessionResponse.json() as StripeSession & { error?: { message?: string } };
  if (!sessionResponse.ok) {
    throw new Error(`Unable to retrieve Stripe checkout session: ${session.error?.message || sessionResponse.status}`);
  }
  if (session.payment_status !== "paid") return false;
  if (session.currency !== "cad" || typeof session.amount_total !== "number") {
    throw new Error("Stripe checkout session has unexpected payment details.");
  }

  const lineItemsUrl = new URL(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items`,
  );
  lineItemsUrl.searchParams.set("limit", "100");
  lineItemsUrl.searchParams.append("expand[]", "data.price.product");
  const lineItemsResponse = await fetch(lineItemsUrl, { headers: stripeHeaders });
  const lineItems = await lineItemsResponse.json() as StripeLineItems & { error?: { message?: string } };
  if (!lineItemsResponse.ok) {
    throw new Error(`Unable to retrieve Stripe line items: ${lineItems.error?.message || lineItemsResponse.status}`);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const address = session.shipping_details?.address
    ? {
      ...session.shipping_details.address,
      name: session.shipping_details.name || session.metadata.customer_name || "",
      phone: session.shipping_details.phone || session.customer_details?.phone || "",
    }
    : JSON.parse(session.metadata.shipping_address || "{}");
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || null;

  const { data: existingOrder, error: lookupError } = await supabase
    .from("orders")
    .select("id, order_number, grand_total, email_notification_sent_at, customer_name, customer_email")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (lookupError) throw new Error(`Unable to check existing order: ${lookupError.message}`);
  if (existingOrder) {
    if (sendNotification) {
      await sendOrderNotification(
        supabase,
        existingOrder,
        existingOrder.customer_name,
        existingOrder.customer_email,
      );
    }
    return true;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: `NS-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`,
      user_id: session.metadata.customer_user_id || null,
      customer_email: session.customer_details?.email || session.customer_email || "",
      customer_name: session.shipping_details?.name || session.metadata.customer_name || session.customer_details?.name || "",
      customer_phone: session.shipping_details?.phone || session.customer_details?.phone || null,
      shipping_address: address,
      items_total: Number(session.metadata.cart_subtotal || 0) / 100,
      shipping_total: Number(session.metadata.shipping_total || 0) / 100,
      tax_total: Number(session.metadata.tax_total || 0) / 100,
      grand_total: session.amount_total / 100,
      payment_status: "paid",
      fulfillment_status: "processing",
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
    })
    .select("id, order_number, grand_total")
    .single();
  if (orderError?.code === "23505") {
    const { data: duplicateOrder, error: duplicateError } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();
    if (!duplicateError && duplicateOrder) return true;
  }
  if (orderError || !order) {
    throw new Error(`Unable to save paid order: ${orderError?.message || "No order returned."}`);
  }

  const orderItems = lineItems.data.flatMap((item) => {
    const metadata = item.price.product.metadata || {};
    if (!metadata.product_id) return [];
    return [{
      order_id: order.id,
      product_id: metadata.product_id,
      product_name: item.price.product.name || item.description,
      product_slug: metadata.product_slug || null,
      product_image: item.price.product.images?.[0] || null,
      variant_name: metadata.variant_name || null,
      variant_value: metadata.variant_value || null,
      quantity: item.quantity,
      unit_price: (item.price.unit_amount ?? item.amount_subtotal / item.quantity) / 100,
      line_total: item.amount_subtotal / 100,
    }];
  });

  if (orderItems.length === 0) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error("Stripe checkout session has no product line items.");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    const { error: deleteError } = await supabase.from("orders").delete().eq("id", order.id);
    if (deleteError) console.error("Unable to remove incomplete paid order:", deleteError.message);
    throw new Error(`Unable to save paid order items: ${itemsError.message}`);
  }

  if (sendNotification) {
    await sendOrderNotification(
      supabase,
      order,
      session.shipping_details?.name || session.metadata.customer_name || session.customer_details?.name || "",
      session.customer_details?.email || session.customer_email || "",
    );
  }

  return true;
}
