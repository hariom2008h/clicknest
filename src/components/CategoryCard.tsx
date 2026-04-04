import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Code, Palette, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  GraduationCap,
  Code,
  Palette,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export default function CategoryCard({ name, slug, description, icon }: CategoryCardProps) {
  const Icon = icon ? iconMap[icon] || BookOpen : BookOpen;

  return (
    <Link to={`/products?category=${slug}`} className="group block">
      <div className="rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-card-foreground">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </Link>
  );
}
