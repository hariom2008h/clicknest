import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, FolderOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="font-heading text-lg font-bold text-foreground">
            DigiStore
          </Link>
          <span className="ml-2 rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Admin</span>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {adminLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t p-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <Link to="/" className="font-heading text-lg font-bold text-foreground">
            DigiStore <span className="text-xs text-accent">Admin</span>
          </Link>
          <div className="flex gap-1">
            {adminLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <Button variant={active ? 'default' : 'ghost'} size="icon">
                    <link.icon className="h-4 w-4" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
