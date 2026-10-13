import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { applyStorefrontProductOverrides } from '@/lib/storefrontCatalog';
import type { Product, Category } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      if (error) setError(error.message);
      else setProducts((data ?? []).map(applyStorefrontProductOverrides));
      setLoading(false);
    })();
  }, []);

  return { products, loading, error };
}

export function useBestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('is_best_seller', true)
        .order('sort_order', { ascending: true });
      setProducts((data ?? []).map(applyStorefrontProductOverrides));
      setLoading(false);
    })();
  }, []);

  return { products, loading };
}

export function useNewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('is_new_arrival', true)
        .order('sort_order', { ascending: true });
      setProducts((data ?? []).map(applyStorefrontProductOverrides));
      setLoading(false);
    })();
  }, []);

  return { products, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      setCategories(data ?? []);
      setLoading(false);
    })();
  }, []);

  return { categories, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (error) {
        setError(error.message);
      } else if (!data) {
        setError('Product not found');
      } else {
        setProduct(applyStorefrontProductOverrides(data as Product));
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', data.id);
        setVariants(variantsData ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  return { product, variants, loading, error };
}

export function useRelatedProducts(product: Product | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .limit(4);
      setProducts((data ?? []).map(applyStorefrontProductOverrides));
      setLoading(false);
    })();
  }, [product]);

  return { products, loading };
}

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const { data } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      setReviews(data ?? []);
      setLoading(false);
    })();
  }, [productId]);

  return { reviews, loading };
}
