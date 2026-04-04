import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Navigate } from 'react-router-dom';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(title, slug, cover_image_url))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!authLoading && !user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">My Orders</h1>
        <p className="mt-1 text-muted-foreground">Your purchase history</p>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 font-heading text-lg font-bold text-foreground">
                      ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                          {item.products?.cover_image_url && (
                            <img src={item.products.cover_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <span className="text-card-foreground">{item.products?.title}</span>
                        <span className="ml-auto text-muted-foreground">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <p className="text-lg text-muted-foreground">No orders yet.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
