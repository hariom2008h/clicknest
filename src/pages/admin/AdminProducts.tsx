import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables, Enums } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductType = Enums<'product_type'>;

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

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
              userId={user?.id ?? ''}
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

function ProductForm({
  product,
  categories,
  userId,
  onSaved,
}: {
  product: Product | null;
  categories: Tables<'categories'>[];
  userId: string;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(product?.title ?? '');
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '0');
  const [coverUrl, setCoverUrl] = useState(product?.cover_image_url ?? '');
  const [fileUrl, setFileUrl] = useState(product?.file_url ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [productType, setProductType] = useState<ProductType>(product?.product_type ?? 'ebook');
  const [published, setPublished] = useState(product?.published ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = slugify(title);
      const payload = {
        title, slug,
        short_description: shortDesc || null,
        description: description || null,
        price: parseFloat(price) || 0,
        cover_image_url: coverUrl || null,
        file_url: fileUrl || null,
        category_id: categoryId || null,
        product_type: productType,
        published, featured,
      };

      if (product) {
        await adminProductRequest(userId, 'update', product.id, payload);
        toast.success('Product updated');
      } else {
        await adminProductRequest(userId, 'create', undefined, payload);
        toast.success('Product created');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Short Description</Label>
        <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price ($)</Label>
          <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <Label>Product Type</Label>
          <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ebook">E-book</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="creative_asset">Creative Asset</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <Select value={categoryId ?? ''} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Cover Image URL</Label>
        <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <Label>File/Download URL</Label>
        <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={published} onCheckedChange={setPublished} />
          <Label>Published</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={featured} onCheckedChange={setFeatured} />
          <Label>Featured</Label>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
}
