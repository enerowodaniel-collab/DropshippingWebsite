import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart, ShoppingBag, Minus, Plus, Truck, ShieldCheck,
  ChevronRight, Loader2, Star, Check, Minus as MinusIcon,
} from 'lucide-react';
import { useProduct, useRelatedProducts, useProductReviews } from '@/lib/hooks';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import { ProductCard } from '@/components/ProductCard';

export function ProductPage() {
  const { slug } = useParams();
  const { product, variants, loading, error } = useProduct(slug);
  const { products: related } = useRelatedProducts(product);
  const { reviews } = useProductReviews(product?.id);
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'faq'>('description');

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-900">Product not found</p>
        <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary-600">
          Back to shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const outOfStock = product.stock_status === 'out_of_stock';
  const wishlisted = isWishlisted(product.id);
  const variantGroups: Record<string, any[]> = {};
  variants.forEach((v) => {
    if (!variantGroups[v.name]) variantGroups[v.name] = [];
    variantGroups[v.name].push(v);
  });

  const finalPrice = variants.find((v) => v.value === selectedVariant)?.price_adjustment
    ? Number(product.price) + Number(variants.find((v) => v.value === selectedVariant)!.price_adjustment)
    : Number(product.price);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: Number(product.price),
      quantity,
      variantValue: selectedVariant || undefined,
      variantPriceAdjustment: variants.find((v) => v.value === selectedVariant)?.price_adjustment
        ? Number(variants.find((v) => v.value === selectedVariant)!.price_adjustment)
        : undefined,
      sku: product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: Number(product.price),
      quantity,
      variantValue: selectedVariant || undefined,
      variantPriceAdjustment: variants.find((v) => v.value === selectedVariant)?.price_adjustment
        ? Number(variants.find((v) => v.value === selectedVariant)!.price_adjustment)
        : undefined,
      sku: product.sku,
    });
    window.location.href = '/checkout';
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <nav className="flex items-center gap-1 text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-neutral-900">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-900">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image gallery */}
          <div>
            <div className="overflow-hidden rounded-xl bg-neutral-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === i ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                {product.is_best_seller && <span className="badge bg-neutral-900 text-white">Best Seller</span>}
                {product.is_new_arrival && <span className="badge bg-accent-500 text-white">New</span>}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">{product.name}</h1>
              {reviews.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-accent-400 text-accent-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900">{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatPrice(Number(product.compare_at_price))}</span>
                  <span className="badge bg-error-500 text-white">
                    -{Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-neutral-600">{product.short_description}</p>

            {/* Variants */}
            {Object.entries(variantGroups).map(([name, options]) => (
              <div key={name}>
                <label className="text-sm font-semibold text-neutral-900">{name}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedVariant(opt.value)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        selectedVariant === opt.value
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
                      }`}
                    >
                      {opt.value}
                      {Number(opt.price_adjustment) > 0 && (
                        <span className="ml-1 text-xs text-neutral-500">+{formatPrice(Number(opt.price_adjustment))}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Stock status */}
            <div className="flex items-center gap-2 text-sm">
              {outOfStock ? (
                <span className="text-error-600 font-medium">Out of stock</span>
              ) : (
                <>
                  <Check className="h-4 w-4 text-success-600" />
                  <span className="text-success-700 font-medium">In stock</span>
                  {product.stock_quantity < 20 && (
                    <span className="text-neutral-500">— Only {product.stock_quantity} left</span>
                  )}
                </>
              )}
            </div>

            {/* Quantity selector */}
            {!outOfStock && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-neutral-900">Quantity</label>
                <div className="flex items-center rounded-lg border border-neutral-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-neutral-600 transition hover:text-neutral-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-neutral-600 transition hover:text-neutral-900"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={outOfStock} className="btn-primary flex-1">
                {added ? <><Check className="h-4 w-4" /> Added!</> : <><ShoppingBag className="h-4 w-4" /> Add to Cart</>}
              </button>
              <button onClick={handleBuyNow} disabled={outOfStock} className="btn-secondary flex-1">
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`rounded-lg border p-3 transition ${
                  wishlisted ? 'border-error-500 text-error-500' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-5 w-5 text-primary-600" />
                <p className="text-xs text-neutral-600">Free shipping over $50</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <p className="text-xs text-neutral-600">Quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-t border-neutral-200">
          <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto no-scrollbar">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'shipping', label: 'Shipping' },
              { id: 'faq', label: 'FAQ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-4">
                <p className="text-sm text-neutral-700 leading-relaxed">{product.description}</p>
                {product.benefits.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">Key Benefits</h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                          <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-success-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key} className="border-b border-neutral-100">
                        <td className="py-3 font-medium text-neutral-900 w-1/3">{key}</td>
                        <td className="py-3 text-neutral-600">{value}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 font-medium text-neutral-900">SKU</td>
                      <td className="py-3 text-neutral-600">{product.sku}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-3xl space-y-4 text-sm text-neutral-700">
                <h3 className="font-semibold text-neutral-900">Shipping</h3>
                <p>{product.shipping_info || 'Free shipping on orders over $50. Standard shipping 3-7 business days across Canada.'}</p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="max-w-3xl space-y-4">
                {[
                  { q: 'Is this product in stock?', a: product.stock_status === 'in_stock' ? 'Yes, this product is currently in stock and ready to ship.' : 'This product is currently out of stock. Please check back soon.' },
                  { q: 'How long does shipping take?', a: 'Orders typically ship within 1-3 business days. Standard delivery takes 3-7 business days across Canada.' },
                  { q: 'What if there is a problem with my order?', a: 'Please contact our support team with your order number and details so we can help.' },
                  { q: 'Do you ship internationally?', a: 'Currently, we only ship within Canada. We are working on expanding to other regions.' },
                ].map((faq, i) => (
                  <div key={i} className="rounded-lg border border-neutral-200 p-4">
                    <h3 className="text-sm font-semibold text-neutral-900">{faq.q}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Customer Reviews</h2>
            <div className="space-y-4 max-w-3xl">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-accent-400 text-accent-400' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-neutral-900">{review.reviewer_name}</span>
                      {review.verified_buyer && (
                        <span className="badge bg-success-50 text-success-700">Verified Buyer</span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.title && <h3 className="mt-2 text-sm font-semibold text-neutral-900">{review.title}</h3>}
                  {review.comment && <p className="mt-1 text-sm text-neutral-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
