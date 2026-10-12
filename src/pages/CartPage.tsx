import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 5;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingBag className="h-8 w-8 text-neutral-400" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-neutral-600">Browse our products and find something you love.</p>
        <Link to="/shop" className="mt-6 inline-block btn-primary">
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-6">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {remainingForFreeShipping > 0 && (
            <div className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
              You are {formatPrice(remainingForFreeShipping)} away from free shipping!
            </div>
          )}
          {items.map((item) => {
            const price = item.variantPriceAdjustment
              ? item.price + item.variantPriceAdjustment
              : item.price;
            return (
              <div key={`${item.productId}-${item.variantValue}`} className="flex gap-4 rounded-xl border border-neutral-200 p-4">
                <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-neutral-900 hover:text-primary-600">
                        {item.name}
                      </Link>
                      {item.variantValue && (
                        <p className="mt-0.5 text-xs text-neutral-500">{item.variantValue}</p>
                      )}
                      <p className="mt-1 text-sm font-medium text-neutral-900">{formatPrice(price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantValue)}
                      className="rounded p-1 text-neutral-400 transition hover:text-error-600"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantValue, item.quantity - 1)}
                        className="p-1.5 text-neutral-600 transition hover:text-neutral-900"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantValue, item.quantity + 1)}
                        className="p-1.5 text-neutral-600 transition hover:text-neutral-900"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">{formatPrice(price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-neutral-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal ({itemCount} items)</span>
                <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium text-neutral-900">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax (5% GST)</span>
                <span className="font-medium text-neutral-900">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-lg font-bold text-neutral-900">{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/checkout" className="mt-6 btn-primary w-full">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-sm font-medium text-primary-600 hover:text-primary-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
