export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  sku: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder';
  stock_quantity: number;
  images: string[];
  specifications: Record<string, string>;
  benefits: string[];
  shipping_info: string | null;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  status: 'active' | 'draft' | 'archived';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string | null;
}

export interface ProductWithCategory extends Product {
  category?: Category | null;
}

export interface Supplier {
  id: string;
  name: string;
  contact_email: string | null;
  status: 'active' | 'inactive' | 'pending';
  default_processing_days: number | null;
  default_shipping_info: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupplierProduct {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_product_id: string | null;
  supplier_cost: number;
  source_url: string | null;
  estimated_shipping_cost: number;
  processing_days: number | null;
  shipping_info: string | null;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: Record<string, string> | null;
  items_total: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  grand_total: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  fulfillment_status: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  supplier_id: string | null;
  tracking_number: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  variant_name: string | null;
  variant_value: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  supplier_cost: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  reviewer_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified_buyer: boolean;
  status: 'published' | 'pending' | 'rejected';
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  consent_given: boolean;
  source: string | null;
  created_at: string;
}

export interface ProfitAssumptions {
  id: string;
  payment_processing_fee_pct: number;
  payment_processing_fee_fixed: number;
  estimated_ad_cost_per_sale: number;
  other_variable_cost: number;
  default_shipping_cost: number;
  tax_rate_pct: number;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantName?: string;
  variantValue?: string;
  variantPriceAdjustment?: number;
  sku: string;
}
