import { Link } from 'react-router-dom';
import { ShoppingCart, User, Package } from 'lucide-react';
import { Button } from '../ui/button';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <span className="font-bold hidden sm:inline-block">ShopifyApp</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">Products</Link>
          <Link to="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">Admin</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
