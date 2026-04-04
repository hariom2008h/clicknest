import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, clearCart, total } = useCartStore();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      return;
    }
    toast.info('Stripe checkout will be integrated next!');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-6 font-heading text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Discover amazing digital products</p>
          <Link to="/products" className="mt-6">
            <Button>Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">Shopping Cart</h1>
        <p className="mt-1 text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-hero">
                      <span className="font-heading text-lg font-bold text-primary-foreground/50">{item.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="font-heading font-semibold text-card-foreground hover:underline truncate block">
                    {item.title}
                  </Link>
                  <p className="mt-1 font-heading text-lg font-bold text-foreground">
                    {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-6 h-fit">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">Order Summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${total().toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-heading font-bold text-foreground">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="mt-6 w-full bg-gradient-accent text-accent-foreground hover:opacity-90 transition-opacity"
              size="lg"
              onClick={handleCheckout}
            >
              Checkout
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
