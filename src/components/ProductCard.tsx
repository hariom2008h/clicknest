import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, CartItem } from '@/lib/cart-store';

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price: number;
  cover_image_url: string | null;
  category_name?: string;
}

export default function ProductCard({ id, title, slug, short_description, price, cover_image_url, category_name }: ProductCardProps) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem({ id, title, price, cover_image_url, slug } as CartItem);
    }
  };

  return (
    <Link to={`/product/${slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {cover_image_url ? (
            <img src={cover_image_url} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-hero">
              <span className="font-heading text-2xl font-bold text-primary-foreground/70">{title[0]}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {category_name && (
            <Badge variant="secondary" className="mb-2 text-xs">{category_name}</Badge>
          )}
          <h3 className="font-heading text-base font-semibold text-card-foreground line-clamp-1">{title}</h3>
          {short_description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{short_description}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="font-heading text-lg font-bold text-foreground">
              {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
            </span>
            <Button
              variant={inCart ? 'secondary' : 'default'}
              size="sm"
              onClick={handleAddToCart}
              disabled={inCart}
            >
              {inCart ? <Check className="mr-1 h-4 w-4" /> : <ShoppingCart className="mr-1 h-4 w-4" />}
              {inCart ? 'In Cart' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
