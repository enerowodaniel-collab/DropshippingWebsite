import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Loader2, PackageSearch } from 'lucide-react';
import { useProducts, useCategories } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import type { Product } from '@/types';

export function ShopPage() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const filter = searchParams.get('filter') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const filtered = useMemo(() => {
    let result = [...products];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) result = result.filter((p) => p.category_id === cat.id);
    }

    if (filter === 'best-sellers') result = result.filter((p) => p.is_best_seller);
    if (filter === 'new-arrivals') result = result.filter((p) => p.is_new_arrival);

    if (minPrice) result = result.filter((p) => Number(p.price) >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => Number(p.price) <= Number(maxPrice));

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => a.sort_order - b.sort_order);
    }

    return result;
  }, [products, query, categorySlug, filter, sort, minPrice, maxPrice, categories]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = query || categorySlug || filter || minPrice || maxPrice;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          {filter === 'best-sellers' ? 'Best Sellers' : filter === 'new-arrivals' ? 'New Arrivals' : 'Shop All Products'}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          {query && ` matching "${query}"`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar filters */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FilterPanel
            categories={categories}
            categorySlug={categorySlug}
            filter={filter}
            minPrice={minPrice}
            maxPrice={maxPrice}
            updateParam={updateParam}
            clearFilters={clearFilters}
            hasActiveFilters={!!hasActiveFilters}
          />
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-600">Sort:</label>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Products grid */}
          {filtered.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <PackageSearch className="h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-sm font-medium text-neutral-900">No products found</p>
              <p className="mt-1 text-xs text-neutral-500">Try adjusting your filters or search terms.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 animate-slide-down">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="rounded p-1 text-neutral-500 hover:text-neutral-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              categorySlug={categorySlug}
              filter={filter}
              minPrice={minPrice}
              maxPrice={maxPrice}
              updateParam={updateParam}
              clearFilters={clearFilters}
              hasActiveFilters={!!hasActiveFilters}
            />
          </div>
        </div>
      )}

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

interface FilterPanelProps {
  categories: any[];
  categorySlug: string;
  filter: string;
  minPrice: string;
  maxPrice: string;
  updateParam: (key: string, value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

function FilterPanel({ categories, categorySlug, filter, minPrice, maxPrice, updateParam, clearFilters, hasActiveFilters }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Clear all filters
        </button>
      )}

      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              !categorySlug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                categorySlug === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="input text-sm"
            min="0"
          />
          <span className="text-neutral-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="input text-sm"
            min="0"
          />
        </div>
      </div>

      {/* Quick filters */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">Quick Filters</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('filter', filter === 'best-sellers' ? '' : 'best-sellers')}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              filter === 'best-sellers' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Best Sellers
          </button>
          <button
            onClick={() => updateParam('filter', filter === 'new-arrivals' ? '' : 'new-arrivals')}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              filter === 'new-arrivals' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            New Arrivals
          </button>
        </div>
      </div>
    </div>
  );
}
