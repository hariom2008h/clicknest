import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function adminCategoryRequest(userId: string, action: string, payload?: any) {
  const response = await supabase.functions.invoke('admin-categories', {
    body: { action, payload },
    headers: { 'x-custom-auth': userId },
  });
  if (response.error) throw new Error(response.error.message);
  if (response.data?.error) throw new Error(response.data.error);
  return response.data?.data;
}

export default function AdminCategories() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      if (!user?.id) return [];
      return adminCategoryRequest(user.id, 'list');
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      await adminCategoryRequest(user.id, 'delete', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openEdit = (cat: any) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? '');
    setIcon(cat.icon ?? '');
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setIcon('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const catData = {
        name,
        slug: slugify(name),
        description: description || null,
        icon: icon || null,
      };

      if (editing) {
        await adminCategoryRequest(user.id, 'update', { id: editing.id, data: catData });
        toast.success('Category updated');
      } else {
        await adminCategoryRequest(user.id, 'create', catData);
        toast.success('Category created');
      }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-muted-foreground">{categories?.length ?? 0} categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Icon (component name e.g. BookOpen)</Label>
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="BookOpen" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {categories?.map((cat: any) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-heading font-semibold text-foreground">{cat.name}</p>
                {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this category?')) deleteMutation.mutate(cat.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
