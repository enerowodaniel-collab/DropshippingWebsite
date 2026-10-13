# Stripe deployment setup

The site uses Vercel serverless functions in `api/` to create and verify Stripe Checkout sessions and process payment webhooks. Stripe secret keys are read only by the server; never add them to frontend variables or commit them.

1. Import this GitHub repository into Vercel. Vercel should detect Vite; use `npm run build` and `dist` if asked.
2. In **Project Settings → Environment Variables**, add:
   - `STRIPE_SECRET_KEY` — the Stripe secret key for the mode you want to use (`sk_test_...` to test, then `sk_live_...` for live payments).
   - `STRIPE_WEBHOOK_SECRET` — the endpoint signing secret from the next step.
3. Deploy the project once so the function URL is available.
4. In Stripe **Developers → Webhooks**, create an endpoint at `https://<your-domain>/api/stripe-webhook` and select `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy its signing secret (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`.
5. Redeploy after saving the environment variables. Test with Stripe test-mode keys before switching to live keys.
6. Confirm the FormSubmit verification email sent to `frncspls@gmail.com` so paid-order notifications can be delivered.

After importing the repository, pushes to `main` can trigger Vercel deployments automatically. Supabase remains the storefront's catalog/authentication provider; Stripe payment creation and verification use the Vercel API endpoints instead.

## Product image credits

- `public/products/jbl-mini-speaker.jpg`: “HARMAN speaker..jpg”, Nishu raghuvanshi, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:HARMAN_speaker..jpg), CC BY-SA 4.0.
- `public/products/sony-headphones.jpg`: “Sony Headphones (40476165073).jpg”, Wutthichai Charoenburi, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sony_Headphones_(40476165073).jpg), CC BY 2.0.
