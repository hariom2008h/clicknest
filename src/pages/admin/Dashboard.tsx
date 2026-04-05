import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Package, ShoppingBag, DollarSign, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
  const { data: productCount } = useQuery({
    queryKey: ['admin-product-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ['admin-order-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: categoryCount } = useQuery({
    queryKey: ['admin-category-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { label: 'Products', value: productCount ?? 0, icon: Package, color: 'text-blue-500' },
    { label: 'Orders', value: orderCount ?? 0, icon: ShoppingBag, color: 'text-green-500' },
    { label: 'Categories', value: categoryCount ?? 0, icon: FolderOpen, color: 'text-purple-500' },
    { label: 'Revenue', value: `$${recentOrders?.reduce((s, o) => s + o.total_amount, 0)?.toFixed(2) ?? '0.00'}`, icon: DollarSign, color: 'text-accent' },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your store</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl font-semibold text-foreground">Recent Orders</h2>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-foreground">${order.total_amount.toFixed(2)}</p>
                  <span className={`text-xs font-medium ${order.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
