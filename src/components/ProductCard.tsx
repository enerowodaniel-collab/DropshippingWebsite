import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;
  const outOfStock = product.stock_status === 'out_of_stock';

  return (
    <div className="group card overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="badge bg-error-500 text-white">-{discountPercent}%</span>
          )}
          {product.is_best_seller && (
            <span className="badge bg-neutral-900 text-white">Best Seller</span>
          )}
          {product.is_new_arrival && (
            <span className="badge bg-accent-500 text-white">New</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute right-3 top-3 rounded-full p-2 transition-all ${
            wishlisted
              ? 'bg-error-500 text-white'
              : 'bg-white/90 text-neutral-700 hover:bg-white hover:text-error-500'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick actions */}
        <div className="absolute bottom-0 left-0 right-0 flex translate-y-full gap-2 p-3 transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images[0],
                price: Number(product.price),
                quantity: 1,
                sku: product.sku,
              });
            }}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {outOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="rounded-lg bg-white p-2 text-neutral-700 shadow-md transition hover:bg-neutral-900 hover:text-white"
              aria-label="Quick view"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 transition hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
          {product.short_description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-900">
              {formatPrice(Number(product.price))}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(Number(product.compare_at_price))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
