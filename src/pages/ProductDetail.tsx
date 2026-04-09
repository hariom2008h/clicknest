import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/lib/cart-store';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, isInCart } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const inCart = product ? isInCart(product.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto flex-1 px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-96 rounded-xl bg-muted" />
            <div className="h-8 w-1/2 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto flex-1 px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">Product not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border bg-muted aspect-square max-h-[500px]">
            {product.cover_image_url ? (
              <img src={product.cover_image_url} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-hero">
                <span className="font-heading text-6xl font-bold text-primary-foreground/50">{product.title[0]}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            {product.categories?.name && (
              <Badge variant="secondary" className="mb-4 w-fit">{product.categories.name}</Badge>
            )}
            <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{product.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.short_description}</p>

            <div className="mt-6 font-heading text-4xl font-bold text-foreground">
              {product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-accent text-accent-foreground hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (!inCart) addItem({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    cover_image_url: product.cover_image_url,
                    slug: product.slug,
                  });
                }}
                disabled={inCart}
              >
                {inCart ? <Check className="mr-2 h-5 w-5" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                {inCart ? 'Added to Cart' : 'Add to Cart'}
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Download className="h-4 w-4" /> {product.download_count} downloads</span>
            </div>

            {product.description && (
              <div className="mt-10">
                <h2 className="font-heading text-xl font-semibold text-foreground">Description</h2>
                <div className="prose prose-sm mt-4 text-muted-foreground max-w-none whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
