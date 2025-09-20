import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User, Truck, Star, MessageCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  role?: 'owner' | 'customer' | 'driver';
}

export const Layout = ({ children, role }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    switch (role) {
      case 'owner':
        return [
          { path: '/owner', label: 'Menu Management', icon: ChefHat },
        ];
      case 'customer':
        return [
          { path: '/customer', label: 'Browse Menu', icon: ChefHat },
          { path: '/customer/orders', label: 'My Orders', icon: User },
        ];
      case 'driver':
        return [
          { path: '/driver', label: 'Dashboard', icon: Truck },
        ];
      default:
        return [
          { path: '/owner', label: 'Owner', icon: ChefHat },
          { path: '/customer', label: 'Customer', icon: User },
          { path: '/driver', label: 'Driver', icon: Truck },
        ];
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">NaNi</h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              {getNavItems().map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                return (
                  <Button
                    key={item.path}
                    variant={active ? "default" : "ghost"}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};