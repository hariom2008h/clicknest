import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

async function adminProductRequest(userId: string, action: string, id?: string, data?: any) {
  const response = await supabase.functions.invoke('admin-products', {
    body: { action, id, data },
    headers: { 'x-custom-auth': userId },
  });
  if (response.error) throw new Error(response.error.message);
  if (response.data?.error) throw new Error(response.data.error);
  return response.data?.data;
}

export default function AdminProducts() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminProductRequest(user!.id, 'list'),
    enabled: !!user?.id,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-for-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminProductRequest(user!.id, 'delete', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-muted-foreground">{products?.length ?? 0} products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editing}
              categories={categories ?? []}
              onSaved={() => {
                setDialogOpen(false);
                setEditing(null);
                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {products?.map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-hero">
                    <span className="text-sm font-bold text-primary-foreground/50">{p.title[0]}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-foreground truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">${p.price.toFixed(2)}</span>
                  <Badge variant={p.published ? 'default' : 'secondary'} className="text-xs">
                    {p.published ? 'Published' : 'Draft'}
                  </Badge>
                  {p.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {products?.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">No products yet. Add your first one!</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
