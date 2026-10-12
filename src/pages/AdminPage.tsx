import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, Tags, Users, Mail, TrendingUp,
  DollarSign, ShoppingCart, AlertCircle, Loader2, Plus, Edit3,
  Trash2, X, Save, Calculator, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/format';
import type { Product, Supplier, Order, NewsletterSubscriber, DiscountCode, ProfitAssumptions } from '@/types';

type Tab = 'overview' | 'products' | 'orders' | 'suppliers' | 'discounts' | 'newsletter' | 'profit' | 'ai-generator';

export function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-error-400" />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Access Denied</h1>
        <p className="mt-2 text-sm text-neutral-600">You need admin privileges to access this page.</p>
        <Link to="/" className="mt-6 inline-block btn-primary">Back to Home</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'discounts', label: 'Discounts', icon: Tags },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'profit', label: 'Profit Calculator', icon: Calculator },
    { id: 'ai-generator', label: 'AI Content', icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-6">Admin Dashboard</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  tab === t.id ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'suppliers' && <SuppliersTab />}
          {tab === 'discounts' && <DiscountsTab />}
          {tab === 'newsletter' && <NewsletterTab />}
          {tab === 'profit' && <ProfitTab />}
          {tab === 'ai-generator' && <AIGeneratorTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, subscribers: 0, avgOrder: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes, subsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact' }),
      ]);

      const orders = ordersRes.data ?? [];
      const paidOrders = orders.filter((o: Order) => o.payment_status === 'paid');
      const revenue = paidOrders.reduce((sum: number, o: Order) => sum + Number(o.grand_total), 0);

      setStats({
        revenue,
        orders: orders.length,
        products: productsRes.count ?? 0,
        subscribers: subsRes.count ?? 0,
        avgOrder: paidOrders.length > 0 ? revenue / paidOrders.length : 0,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  const cards = [
    { label: 'Revenue (Paid Orders)', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-success-50 text-success-600' },
    { label: 'Total Orders', value: stats.orders.toString(), icon: ShoppingCart, color: 'bg-primary-50 text-primary-600' },
    { label: 'Avg Order Value', value: formatPrice(stats.avgOrder), icon: TrendingUp, color: 'bg-accent-50 text-accent-600' },
    { label: 'Products', value: stats.products.toString(), icon: Package, color: 'bg-neutral-100 text-neutral-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-neutral-200 p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-xs text-neutral-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 p-8 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-500">No orders yet. Orders will appear here once customers make purchases.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium text-neutral-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-neutral-600">{order.customer_email}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">{formatPrice(Number(order.grand_total))}</td>
                    <td className="px-4 py-3"><span className={`badge ${order.payment_status === 'paid' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{order.payment_status}</span></td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Products ({products.length})</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Price</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="font-medium text-neutral-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{product.sku}</td>
                <td className="px-4 py-3 font-medium text-neutral-900">{formatPrice(Number(product.price))}</td>
                <td className="px-4 py-3 text-neutral-600">{product.stock_quantity}</td>
                <td className="px-4 py-3"><span className={`badge ${product.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>{product.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(product); setShowForm(true); }} className="rounded p-1 text-neutral-500 hover:text-primary-600"><Edit3 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <ProductForm product={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={load} />}
    </div>
  );
}

function ProductForm({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price?.toString() || '',
    compare_at_price: product?.compare_at_price?.toString() || '',
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    stock_status: product?.stock_status || 'in_stock',
    status: product?.status || 'draft',
    is_best_seller: product?.is_best_seller || false,
    is_new_arrival: product?.is_new_arrival || false,
    images: product?.images?.join(', ') || '',
    shipping_info: product?.shipping_info || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const images = form.images.split(',').map((s) => s.trim()).filter(Boolean);
    if (images.length === 0) images.push('https://images.pexels.com/photos/4225229/pexels-photo-4225229.jpeg?auto=compress&cs=tinysrgb&h=650&w=940');

    const data = {
      name: form.name,
      slug,
      description: form.description || 'Product description.',
      short_description: form.short_description,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      sku: form.sku,
      stock_quantity: Number(form.stock_quantity) || 0,
      stock_status: form.stock_status,
      status: form.status,
      is_best_seller: form.is_best_seller,
      is_new_arrival: form.is_new_arrival,
      images,
      shipping_info: form.shipping_info,
      specifications: product?.specifications || {},
      benefits: product?.benefits || [],
    };

    let res;
    if (product) {
      res = await supabase.from('products').update(data).eq('id', product.id);
    } else {
      res = await supabase.from('products').insert(data);
    }

    if (res.error) {
      setError(res.error.message);
      setSaving(false);
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="rounded p-1 text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-3">
          {error && <div className="rounded-lg bg-error-50 px-4 py-2 text-sm text-error-600">{error}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium text-neutral-700">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input mt-1 text-sm" /></div>
            <div><label className="text-xs font-medium text-neutral-700">SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input mt-1 text-sm" /></div>
          </div>
          <div><label className="text-xs font-medium text-neutral-700">Short Description</label><input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="input mt-1 text-sm" /></div>
          <div><label className="text-xs font-medium text-neutral-700">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input mt-1 text-sm resize-none" /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="text-xs font-medium text-neutral-700">Price (CAD)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input mt-1 text-sm" /></div>
            <div><label className="text-xs font-medium text-neutral-700">Compare At</label><input type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} className="input mt-1 text-sm" /></div>
            <div><label className="text-xs font-medium text-neutral-700">Stock Qty</label><input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="input mt-1 text-sm" /></div>
          </div>
          <div><label className="text-xs font-medium text-neutral-700">Image URLs (comma-separated)</label><input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="input mt-1 text-sm" placeholder="https://..." /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium text-neutral-700">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input mt-1 text-sm"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
            <div><label className="text-xs font-medium text-neutral-700">Stock Status</label><select value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })} className="input mt-1 text-sm"><option value="in_stock">In Stock</option><option value="out_of_stock">Out of Stock</option><option value="preorder">Preorder</option></select></div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })} className="rounded border-neutral-300 text-primary-600" /> Best Seller</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_new_arrival} onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })} className="rounded border-neutral-300 text-primary-600" /> New Arrival</label>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}</button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 p-8 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-500">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Order #</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Fulfillment</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{order.order_number}</td>
                  <td className="px-4 py-3 text-neutral-600">{order.customer_email}</td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{formatPrice(Number(order.grand_total))}</td>
                  <td className="px-4 py-3"><span className={`badge ${order.payment_status === 'paid' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{order.payment_status}</span></td>
                  <td className="px-4 py-3"><span className="badge bg-neutral-100 text-neutral-600">{order.fulfillment_status}</span></td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('suppliers').select('*').order('name');
      setSuppliers(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Suppliers ({suppliers.length})</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">{supplier.name}</h3>
              <span className={`badge ${supplier.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>{supplier.status}</span>
            </div>
            {supplier.contact_email && <p className="mt-1 text-xs text-neutral-500">{supplier.contact_email}</p>}
            {supplier.default_processing_days && <p className="mt-2 text-xs text-neutral-600">Processing: {supplier.default_processing_days} days</p>}
            {supplier.default_shipping_info && <p className="mt-1 text-xs text-neutral-600">{supplier.default_shipping_info}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscountsTab() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
      setDiscounts(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Discount Codes ({discounts.length})</h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Code</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Value</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Uses</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {discounts.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-mono font-medium text-neutral-900">{d.code}</td>
                <td className="px-4 py-3 text-neutral-600">{d.discount_type}</td>
                <td className="px-4 py-3 text-neutral-900">{d.discount_type === 'percentage' ? `${d.value}%` : formatPrice(Number(d.value))}</td>
                <td className="px-4 py-3 text-neutral-600">{d.uses_count}{d.max_uses ? ` / ${d.max_uses}` : ''}</td>
                <td className="px-4 py-3"><span className={`badge ${d.active ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>{d.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewsletterTab() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
      setSubscribers(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Newsletter Subscribers ({subscribers.length})</h2>
      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 p-8 text-center">
          <Mail className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-500">No subscribers yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Source</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{sub.email}</td>
                  <td className="px-4 py-3 text-neutral-600">{sub.source || '—'}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProfitTab() {
  const [assumptions, setAssumptions] = useState<ProfitAssumptions | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [assRes, prodRes, spRes] = await Promise.all([
        supabase.from('profit_assumptions').select('*').maybeSingle(),
        supabase.from('products').select('id, name, price, sku').eq('status', 'active'),
        supabase.from('supplier_products').select('product_id, supplier_cost, estimated_shipping_cost'),
      ]);

      setAssumptions(assRes.data);
      const spMap = new Map((spRes.data ?? []).map((sp: any) => [sp.product_id, sp]));
      setProducts((prodRes.data ?? []).map((p: any) => ({
        ...p,
        supplier: spMap.get(p.id),
      })));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>;

  const calc = (product: any) => {
    if (!assumptions || !product.supplier) return null;
    const sellPrice = Number(product.price);
    const supplierCost = Number(product.supplier.supplier_cost);
    const shippingCost = Number(product.supplier.estimated_shipping_cost) || assumptions.default_shipping_cost;
    const paymentFee = (sellPrice * assumptions.payment_processing_fee_pct / 100) + assumptions.payment_processing_fee_fixed;
    const adCost = assumptions.estimated_ad_cost_per_sale;
    const other = assumptions.other_variable_cost;
    const contribution = sellPrice - supplierCost - shippingCost - paymentFee - adCost - other;
    const margin = sellPrice > 0 ? (contribution / sellPrice) * 100 : 0;
    const breakEvenCPA = sellPrice - supplierCost - shippingCost - paymentFee - other;
    return { sellPrice, supplierCost, shippingCost, paymentFee, adCost, other, contribution, margin, breakEvenCPA };
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Profit Calculator</h2>

      {assumptions && (
        <div className="mb-6 rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Cost Assumptions (editable in database)</h3>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Payment Fee %', value: `${assumptions.payment_processing_fee_pct}%` },
              { label: 'Payment Fee Fixed', value: formatPrice(assumptions.payment_processing_fee_fixed) },
              { label: 'Ad Cost / Sale', value: formatPrice(assumptions.estimated_ad_cost_per_sale) },
              { label: 'Other Costs', value: formatPrice(assumptions.other_variable_cost) },
              { label: 'Default Shipping', value: formatPrice(assumptions.default_shipping_cost) },
              { label: 'Tax Rate', value: `${assumptions.tax_rate_pct}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="text-sm font-semibold text-neutral-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Product</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Sell</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Cost</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Shipping</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Pay Fee</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Ad</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Profit</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Margin</th>
              <th className="px-3 py-3 text-right font-medium text-neutral-600">Break-even CPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => {
              const c = calc(product);
              return (
                <tr key={product.id}>
                  <td className="px-3 py-3 font-medium text-neutral-900 truncate max-w-[150px]">{product.name}</td>
                  <td className="px-3 py-3 text-right text-neutral-900">{formatPrice(c?.sellPrice || 0)}</td>
                  <td className="px-3 py-3 text-right text-neutral-600">{c ? formatPrice(c.supplierCost) : '—'}</td>
                  <td className="px-3 py-3 text-right text-neutral-600">{c ? formatPrice(c.shippingCost) : '—'}</td>
                  <td className="px-3 py-3 text-right text-neutral-600">{c ? formatPrice(c.paymentFee) : '—'}</td>
                  <td className="px-3 py-3 text-right text-neutral-600">{c ? formatPrice(c.adCost) : '—'}</td>
                  <td className={`px-3 py-3 text-right font-semibold ${(c?.contribution || 0) > 0 ? 'text-success-600' : 'text-error-600'}`}>{c ? formatPrice(c.contribution) : '—'}</td>
                  <td className="px-3 py-3 text-right text-neutral-900">{c ? `${c.margin.toFixed(1)}%` : '—'}</td>
                  <td className="px-3 py-3 text-right text-neutral-600">{c ? formatPrice(c.breakEvenCPA) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-500">All costs are estimates. Supplier costs and shipping are from supplier records; payment fees, ad costs, and other costs use the assumptions above.</p>
    </div>
  );
}

function AIGeneratorTab() {
  const [input, setInput] = useState({ name: '', keySpecs: '', keyBenefits: '' });
  const [output, setOutput] = useState<{ title: string; description: string; bullets: string[]; seoMeta: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-product-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (data.fallback) {
        // Local fallback generation
        const name = input.name || 'Product';
        const specs = input.keySpecs.split(',').map((s) => s.trim()).filter(Boolean);
        const benefits = input.keyBenefits.split(',').map((s) => s.trim()).filter(Boolean);
        setOutput({
          title: name,
          description: `The ${name} is designed to ${benefits[0]?.toLowerCase() || 'enhance your daily routine'}. ${specs.length > 0 ? `Featuring ${specs.slice(0, 3).join(', ')}, ` : ''}this product delivers reliable performance and quality craftsmanship. Perfect for everyday use.`,
          bullets: benefits.length > 0 ? benefits : ['Quality verified', 'Easy to use', 'Built to last', 'Great value'],
          seoMeta: `Buy ${name} online in Canada. ${benefits[0] || 'Premium quality'} at competitive prices. Free shipping over $50.`,
        });
      } else {
        setOutput(data);
      }
    } catch {
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">AI Product Description Generator</h2>
      <p className="text-sm text-neutral-600 mb-6">Generate draft product content from specifications. All content is editable before publishing.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-neutral-200 p-6">
          <div><label className="text-sm font-medium text-neutral-700">Product Name</label><input value={input.name} onChange={(e) => setInput({ ...input, name: e.target.value })} className="input mt-1" placeholder="e.g. Aurora Wireless Earbuds" /></div>
          <div><label className="text-sm font-medium text-neutral-700">Key Specifications (comma-separated)</label><textarea rows={3} value={input.keySpecs} onChange={(e) => setInput({ ...input, keySpecs: e.target.value })} className="input mt-1 resize-none" placeholder="Bluetooth 5.3, 32h battery, IPX5, ANC" /></div>
          <div><label className="text-sm font-medium text-neutral-700">Key Benefits (comma-separated)</label><textarea rows={3} value={input.keyBenefits} onChange={(e) => setInput({ ...input, keyBenefits: e.target.value })} className="input mt-1 resize-none" placeholder="Noise cancellation, all-day comfort, fast charging" /></div>
          {error && <div className="rounded-lg bg-error-50 px-4 py-2 text-sm text-error-600">{error}</div>}
          <button onClick={generate} disabled={loading || (!input.name && !input.keySpecs)} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Generate Content</>}
          </button>
          <p className="text-xs text-neutral-500">Without an AI API key, a template-based generator is used. Connect an AI key for enhanced generation.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 p-6">
          {output ? (
            <div className="space-y-4">
              <div><label className="text-xs font-medium text-neutral-500">Title</label><p className="mt-1 text-sm font-semibold text-neutral-900">{output.title}</p></div>
              <div><label className="text-xs font-medium text-neutral-500">Description</label><p className="mt-1 text-sm text-neutral-700">{output.description}</p></div>
              <div><label className="text-xs font-medium text-neutral-500">Bullet Points</label><ul className="mt-1 space-y-1">{output.bullets.map((b, i) => <li key={i} className="flex items-start gap-2 text-sm text-neutral-700"><span className="mt-1 h-1 w-1 rounded-full bg-success-500" />{b}</li>)}</ul></div>
              <div><label className="text-xs font-medium text-neutral-500">SEO Meta Description</label><p className="mt-1 text-sm text-neutral-600 italic">{output.seoMeta}</p></div>
              <p className="text-xs text-warning-600 bg-warning-50 rounded-lg px-3 py-2">This is AI-generated draft content. Review and edit before publishing.</p>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <Sparkles className="h-10 w-10 text-neutral-300" />
              <p className="mt-3 text-sm text-neutral-500">Generated content will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
