import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';

export function WishlistPage() {
  const { wishlist } = useWishlist();
  const { products } = useProducts();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-6">My Wishlist</h1>

      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Heart className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-900">Your wishlist is empty</p>
          <p className="mt-1 text-xs text-neutral-500">Save products you love by tapping the heart icon.</p>
          <Link to="/shop" className="mt-6 inline-block btn-primary">
            <ShoppingBag className="h-4 w-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
