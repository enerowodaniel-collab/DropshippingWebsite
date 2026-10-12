# Stripe checkout setup

1. Install the Supabase CLI and link this project to your Supabase project with `supabase login` and `supabase link`.
2. Run `npm run stripe:deploy` to apply the order and product migrations and deploy checkout plus the Stripe webhook.
3. In Stripe, create a webhook endpoint pointing to `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`. Subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
4. In the Supabase Dashboard, open **Edge Functions → Secrets** and add `STRIPE_SECRET_KEY` (`sk_test_...` while testing) and `STRIPE_WEBHOOK_SECRET` (`whsec_...` from the webhook endpoint). Alternatively, add those values to `supabase/functions/.env` and run `npm run stripe:secrets`.
5. Confirm the activation email FormSubmit sends to `frncspls@gmail.com`. FormSubmit may require this one-time recipient verification before forwarding order notifications.
6. Test a checkout with Stripe test mode before switching to live keys.

Stripe keys should be stored as Supabase Edge Function secrets, not in a database table that could be exposed through the app. The local `supabase/functions/.env` file is ignored by Git and stays on your computer. Do not put Stripe secret or webhook keys in the root Vite `.env`, frontend code, or a `VITE_` variable. Supabase injects its own URL and service-role credentials into deployed Edge Functions.

After each successful payment, the webhook records the order and sends an order summary (customer name/email, purchased items, and total) to `frncspls@gmail.com` using FormSubmit. It does not email the shipping address or payment details.

For local Edge Function testing, run `supabase start`, then run `supabase functions serve --env-file ./supabase/functions/.env`. Use the Stripe CLI to forward test events to the local webhook.
