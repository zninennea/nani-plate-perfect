import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User, Truck, LogOut, ShoppingCart, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import naniLogo from '@/assets/nani-logo.png';

interface LayoutProps {
  children: ReactNode;
  role?: 'owner' | 'customer' | 'driver';
}

export const Layout = ({ children, role }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'owner':
        return [
          { path: '/owner', label: 'Menu Management', icon: ChefHat },
        ];
      case 'customer':
        return [
          { path: '/customer', label: 'Browse Menu', icon: ChefHat },
          { path: '/my-orders', label: 'My Orders', icon: FileText },
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
              <img 
                src={naniLogo} 
                alt="NaNi Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-foreground">NaNi</h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
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

              {profile && (
                <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                      {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-muted-foreground">
                      {profile.full_name || profile.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Logout</span>
                  </Button>
                </div>
              )}
            </div>
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