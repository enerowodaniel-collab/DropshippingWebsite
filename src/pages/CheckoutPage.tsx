import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, CreditCard, Loader2, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';

type CheckoutStep = 'info' | 'payment' | 'success' | 'setup' | 'verifying';

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<CheckoutStep>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    province: 'Ontario',
    postalCode: '',
    country: 'Canada',
  });

  const shipping = subtotal >= 50 ? 0 : 5;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    let cancelled = false;
    setStep('verifying');
    setLoading(true);
    setError('');

    fetch(`/api/verify-checkout?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'We could not verify your payment yet.');
        return data;
      })
      .then((data) => {
        if (cancelled) return;
      if (data?.paymentStatus !== 'paid') {
        setError('Stripe has not confirmed this payment. If you completed checkout, please contact us before trying again.');
        setStep('payment');
        return;
      }
      clearCart();
      setStep('success');
      })
      .catch((verificationError: unknown) => {
      if (cancelled) return;
      setError(verificationError instanceof Error
        ? verificationError.message
        : 'We could not verify your payment. Please contact us before trying again.');
      setStep('payment');
      })
      .finally(() => {
      if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, clearCart]);

  const handleInfoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ slug, quantity, variantValue }) => ({
            slug,
            quantity,
            variantValue,
          })),
          email: form.email,
          shippingAddress: {
            name: `${form.firstName} ${form.lastName}`,
            phone: form.phone,
            address: form.address,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            country: form.country,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 503 && data?.requiresSetup) {
          setStep('setup');
          return;
        }
        throw new Error(data?.error || 'Payment failed. Please try again.');
      }
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error(data?.error || 'Payment failed. Please try again.');
    } catch (paymentError: unknown) {
      setError(paymentError instanceof Error
        ? paymentError.message
        : 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'verifying') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-600" />
        <h1 className="mt-4 text-xl font-semibold text-neutral-900">Confirming your payment</h1>
        <p className="mt-2 text-sm text-neutral-600">Please wait while Stripe confirms your checkout.</p>
      </div>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-900">Your cart is empty</p>
        <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary-600">Continue shopping</Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-success-500" />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Payment confirmed</h1>
        <p className="mt-2 text-sm text-neutral-600">Stripe confirmed your payment. Thank you for your purchase.</p>
        <Link to="/shop" className="mt-6 inline-block btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-50">
          <Lock className="h-8 w-8 text-warning-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Payment Setup Required</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
          Stripe keys must be added to your Vercel project's environment variables before checkout can be enabled.
        </p>
        <div className="mx-auto mt-6 max-w-md rounded-lg border border-neutral-200 p-4 text-left">
          <h2 className="text-sm font-semibold text-neutral-900">What is needed:</h2>
          <ul className="mt-2 space-y-2 text-sm text-neutral-600">
            <li>1. Create a Stripe account at stripe.com</li>
            <li>2. Add STRIPE_SECRET_KEY in Vercel → Project Settings → Environment Variables</li>
            <li>3. Deploy the site, then add the /api/stripe-webhook URL in Stripe</li>
            <li>4. Add STRIPE_WEBHOOK_SECRET in Vercel and redeploy</li>
            <li>5. Confirm FormSubmit's one-time email at frncspls@gmail.com</li>
          </ul>
        </div>
        <div className="mt-6 flex justify-center">
          <Link to="/cart" className="btn-secondary">Back to Cart</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 sm:mb-8 sm:text-3xl">Checkout</h1>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step === 'info' ? 'bg-primary-600 text-white' : 'bg-success-500 text-white'}`}>
                {step === 'info' ? '1' : <CheckCircle className="h-4 w-4" />}
              </div>
              <span className="text-xs font-medium sm:text-sm">Information</span>
            </div>
            <div className="h-px flex-1 bg-neutral-200" />
            <div className="flex min-w-0 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step === 'payment' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                2
              </div>
              <span className="text-xs font-medium sm:text-sm">Payment</span>
            </div>
          </div>

          {step === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-4 rounded-xl border border-neutral-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Contact & Shipping</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-email" className="text-sm font-medium text-neutral-700">Email</label>
                  <input id="checkout-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input mt-1" />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="text-sm font-medium text-neutral-700">Phone</label>
                  <input id="checkout-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="input mt-1" />
                </div>
                <div>
                  <label htmlFor="checkout-first-name" className="text-sm font-medium text-neutral-700">First Name</label>
                  <input id="checkout-first-name" type="text" autoComplete="given-name" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="input mt-1" />
                </div>
                <div>
                  <label htmlFor="checkout-last-name" className="text-sm font-medium text-neutral-700">Last Name</label>
                  <input id="checkout-last-name" type="text" autoComplete="family-name" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="input mt-1" />
                </div>
              </div>
              <div>
                <label htmlFor="checkout-address" className="text-sm font-medium text-neutral-700">Address</label>
                <input id="checkout-address" type="text" autoComplete="street-address" required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="input mt-1" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="checkout-city" className="text-sm font-medium text-neutral-700">City</label>
                  <input id="checkout-city" type="text" autoComplete="address-level2" required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="input mt-1" />
                </div>
                <div>
                  <label htmlFor="checkout-province" className="text-sm font-medium text-neutral-700">Province</label>
                  <select id="checkout-province" autoComplete="address-level1" value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })} className="input mt-1">
                    {['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Northwest Territories', 'Yukon', 'Nunavut'].map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="checkout-postal-code" className="text-sm font-medium text-neutral-700">Postal Code</label>
                  <input id="checkout-postal-code" type="text" autoComplete="postal-code" required value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} className="input mt-1" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Continue to Payment</button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-4 rounded-xl border border-neutral-200 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-neutral-700" />
                <h2 className="text-lg font-semibold text-neutral-900">Payment</h2>
              </div>
              <p className="text-sm text-neutral-600">
                You will be redirected to Stripe's secure checkout to complete your payment.
                Your card information is never stored on our servers.
              </p>
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button onClick={() => { setError(''); setStep('info'); }} className="btn-secondary sm:w-auto">Back</button>
                <button onClick={handlePayment} disabled={loading} className="btn-primary w-full flex-1 sm:w-auto">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    : <><Lock className="h-4 w-4" /> Pay {formatPrice(total)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-neutral-200 p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Order Summary</h2>
            <div className="max-h-60 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantValue}`} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-neutral-900">{item.name}</p>
                    {item.variantValue && <p className="text-xs text-neutral-500">{item.variantValue}</p>}
                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-neutral-900">
                    {formatPrice((item.variantPriceAdjustment ? item.price + item.variantPriceAdjustment : item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between gap-3"><span className="text-neutral-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between gap-3"><span className="text-neutral-600">Shipping</span><span className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between gap-3"><span className="text-neutral-600">Tax (5% GST)</span><span className="font-medium">{formatPrice(tax)}</span></div>
              <div className="flex justify-between gap-3 border-t border-neutral-200 pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
