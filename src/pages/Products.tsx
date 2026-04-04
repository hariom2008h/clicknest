import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [search, setSearch] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', categorySlug, search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const cat = categories?.find((c) => c.slug === categorySlug);
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !categorySlug || !!categories,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {categorySlug
                ? categories?.find((c) => c.slug === categorySlug)?.name || 'Products'
                : 'All Products'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {products?.length ?? 0} products available
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant={!categorySlug ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchParams({})}
          >
            All
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={categorySlug === cat.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchParams({ category: cat.slug })}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                slug={p.slug}
                short_description={p.short_description}
                price={p.price}
                cover_image_url={p.cover_image_url}
                category_name={p.categories?.name}
              />
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <p className="text-lg text-muted-foreground">No products found.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
