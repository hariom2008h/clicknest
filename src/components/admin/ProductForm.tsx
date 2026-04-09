import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2 } from 'lucide-react';
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

export default function ProductForm({
  product,
  categories,
  onSaved,
}: {
  product: Product | null;
  categories: Tables<'categories'>[];
  onSaved: () => void;
}) {
  const { user } = useUser();
  const userId = user?.id ?? '';

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
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('कृपया एक image file चुनें');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image 5MB से छोटी होनी चाहिए');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-product-image`,
        {
          method: 'POST',
          headers: {
            'x-custom-auth': userId,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || 'Upload failed');

      setCoverUrl(result.url);
      toast.success('Image upload हो गई!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

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

      {/* Cover Image Upload */}
      <div>
        <Label>Cover Image</Label>
        {coverUrl ? (
          <div className="relative mt-2 w-full max-w-xs">
            <img src={coverUrl} alt="Cover preview" className="h-40 w-full rounded-lg border object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-7 w-7"
              onClick={() => setCoverUrl('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground/70">PNG, JPG, WEBP (max 5MB)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        )}
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
      <Button type="submit" className="w-full" disabled={saving || uploading}>
        {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
}
