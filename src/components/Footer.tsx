import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">DigiStore</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The marketplace for premium digital products. Courses, e-books, software, and creative assets.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">Categories</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/products?category=ebooks" className="text-sm text-muted-foreground hover:text-foreground">E-books</Link></li>
              <li><Link to="/products?category=courses" className="text-sm text-muted-foreground hover:text-foreground">Courses</Link></li>
              <li><Link to="/products?category=software" className="text-sm text-muted-foreground hover:text-foreground">Software</Link></li>
              <li><Link to="/products?category=creative-assets" className="text-sm text-muted-foreground hover:text-foreground">Creative Assets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DigiStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
