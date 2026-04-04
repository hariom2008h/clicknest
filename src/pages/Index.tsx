import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import heroBg from '@/assets/hero-bg.jpg';

export default function Index() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('published', true)
        .eq('featured', true)
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: latestProducts } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
              Premium Digital Products,{' '}
              <span className="text-gradient-hero">Instantly Delivered</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Discover courses, e-books, software, and creative assets from independent creators. Buy once, own forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-gradient-accent text-accent-foreground shadow-elevated hover:opacity-90 transition-opacity">
                  Browse Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">Start Selling</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
          {[
            { icon: Zap, title: 'Instant Delivery', desc: 'Download your purchases immediately after checkout.' },
            { icon: Shield, title: 'Secure Payments', desc: 'All transactions secured with industry-standard encryption.' },
            { icon: Sparkles, title: 'Quality Guaranteed', desc: 'Curated products from vetted independent creators.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-foreground">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">Find exactly what you need</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories?.map((cat) => (
              <CategoryCard key={cat.id} name={cat.name} slug={cat.slug} description={cat.description} icon={cat.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="border-t bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground">Featured Products</h2>
                <p className="mt-2 text-muted-foreground">Hand-picked by our team</p>
              </div>
              <Link to="/products">
                <Button variant="ghost">View all <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p) => (
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
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts && latestProducts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground">Latest Products</h2>
                <p className="mt-2 text-muted-foreground">Fresh from our creators</p>
              </div>
              <Link to="/products">
                <Button variant="ghost">View all <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestProducts.map((p) => (
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
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to start selling?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Join thousands of creators earning from their digital products.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="mt-8">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
