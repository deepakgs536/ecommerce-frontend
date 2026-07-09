import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, CreditCard, Settings, BarChart, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Media', path: '/admin/media', icon: Image },
  { name: 'Inventory', path: '/admin/inventory', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 flex-col border-r bg-background hidden md:flex min-h-screen">
      <div className="flex h-16 items-center px-6 border-b font-bold text-lg">
        Admin Panel
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start', location.pathname === item.path && 'bg-secondary')}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};
