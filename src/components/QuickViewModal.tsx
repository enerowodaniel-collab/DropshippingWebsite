import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/format';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock_status === 'out_of_stock';
  const wishlisted = isWishlisted(product.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl bg-white shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-neutral-600 shadow-sm transition hover:bg-white hover:text-neutral-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === i ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-neutral-900">{product.name}</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">
                {formatPrice(Number(product.price))}
              </span>
              {hasDiscount && (
                <span className="text-base text-neutral-400 line-through">
                  {formatPrice(Number(product.compare_at_price))}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-neutral-600 line-clamp-4">
              {product.short_description}
            </p>

            {product.benefits.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {product.benefits.slice(0, 3).map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-success-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto pt-6 flex gap-3">
              <button
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images[0],
                    price: Number(product.price),
                    quantity: 1,
                    sku: product.sku,
                  });
                  onClose();
                }}
                disabled={outOfStock}
                className="btn-primary flex-1"
              >
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`rounded-lg border p-3 transition ${
                  wishlisted
                    ? 'border-error-500 text-error-500'
                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-900'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="mt-3 text-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
