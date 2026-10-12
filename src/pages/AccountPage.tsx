import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, User, LogOut, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import type { Order } from '@/types';

export function AccountPage() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data ?? []);
    })();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">My Account</h1>
            <p className="text-sm text-neutral-600">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin" className="btn-secondary">
              <Shield className="h-4 w-4" /> Admin Dashboard
            </Link>
          )}
          <button onClick={signOut} className="btn-ghost text-error-600">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order History</h2>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 p-8 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-neutral-900">No orders yet</p>
            <p className="mt-1 text-xs text-neutral-500">Your orders will appear here once you make a purchase.</p>
            <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary-600">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{order.order_number}</p>
                    <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(Number(order.grand_total))}</p>
                    <span className={`badge mt-1 ${
                      order.payment_status === 'paid' ? 'bg-success-50 text-success-700' :
                      order.payment_status === 'pending' ? 'bg-warning-50 text-warning-700' :
                      'bg-error-50 text-error-700'
                    }`}>{order.payment_status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
