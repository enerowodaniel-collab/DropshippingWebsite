import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Headphones, RefreshCw, Sparkles, Search } from 'lucide-react';
import { useState } from 'react';
import { useBestSellers, useCategories, useNewArrivals } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { AIFinder } from '@/components/AIFinder';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';

export function HomePage() {
  const { products: bestSellers } = useBestSellers();
  const { products: newArrivals } = useNewArrivals();
  const { categories } = useCategories();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-neutral-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6 animate-slide-up">
            <span className="badge bg-primary-50 text-primary-700">New Collection Available</span>
            <h1 className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              Everyday tech that <span className="text-primary-600">elevates</span> your space
            </h1>
            <p className="max-w-md text-lg text-neutral-600">
              Thoughtfully curated gadgets and desk accessories designed to make your daily
              routine smarter, simpler, and more enjoyable.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop?filter=new-arrivals" className="btn-secondary">
                Explore Products
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Truck className="h-5 w-5 text-primary-600" />
                Free shipping over $50
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <RefreshCw className="h-5 w-5 text-primary-600" />
                30-day returns
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://images.pexels.com/photos/19513471/pexels-photo-19513471.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Modern desk setup with tech accessories"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg hidden sm:block">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900">AI Shopping Assistant</p>
                  <p className="text-xs text-neutral-500">Find your perfect product</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Shop by Category</h2>
              <p className="mt-1 text-sm text-neutral-600">Find exactly what you need</p>
            </div>
            <Link to="/shop" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl bg-neutral-100 aspect-[3/4]"
              >
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-semibold text-white sm:text-base">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Best Sellers</h2>
              <p className="mt-1 text-sm text-neutral-600">Our most popular products</p>
            </div>
            <Link to="/shop?filter=best-sellers" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Why NovaShop?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600">
            We carefully vet every product in our catalog to ensure quality, value, and
            reliability. Here is what you can expect when you shop with us.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Quality Verified', desc: 'Every product is tested and vetted before it reaches our store.' },
            { icon: Truck, title: 'Fast Shipping', desc: 'Orders ship within 1-3 business days with tracking provided.' },
            { icon: RefreshCw, title: 'Easy Returns', desc: 'Not satisfied? Return any item within 30 days for a full refund.' },
            { icon: Headphones, title: 'Customer Support', desc: 'Our team is available to help with any questions or concerns.' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-neutral-200 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-neutral-900">{feature.title}</h3>
              <p className="mt-1 text-xs text-neutral-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Product Finder */}
      <section className="bg-neutral-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">AI Product Finder</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-400">
              Answer a few questions and let our smart finder match you with the perfect products
              from our catalog.
            </p>
          </div>
          <div className="mt-8">
            <AIFinder />
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">New Arrivals</h2>
              <p className="mt-1 text-sm text-neutral-600">Fresh additions to our collection</p>
            </div>
            <Link to="/shop?filter=new-arrivals" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </section>
      )}

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
