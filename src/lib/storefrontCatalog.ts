import type { CartItem, Product } from '@/types';

const storefrontOverrides: Record<string, Partial<Pick<Product, 'name' | 'price' | 'images'>>> = {
  'pulse-mini-bluetooth-speaker': {
    name: 'JBL Mini Speaker',
    price: 55,
    images: ['/products/jbl-mini-speaker.jpg'],
  },
  'chargepad-pro-wireless-charger': {
    images: ['/products/15w-wireless-charger.png'],
  },
  'studio-over-ear-headphones': {
    price: 92.68,
    images: ['/products/sony-headphones.jpg'],
  },
};

export function applyStorefrontProductOverrides(product: Product): Product {
  return { ...product, ...storefrontOverrides[product.slug] };
}

export function applyStorefrontCartOverride(item: CartItem): CartItem {
  const override = storefrontOverrides[item.slug];
  if (!override) return item;
  return {
    ...item,
    name: override.name ?? item.name,
    price: override.price ?? item.price,
    image: override.images?.[0] ?? item.image,
  };
}
