import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export const CustomerDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
    loadCart();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items' as any)
      .select('*')
      .eq('available', true)
      .order('category');

    if (error) {
      toast({ title: 'Error', description: 'Failed to load menu', variant: 'destructive' });
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (item: any) => {
    const existingItem = cart.find(i => i.id === item.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newCart = [...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image_url: item.image_url
      }];
    }

    saveCart(newCart);
    toast({ title: 'Added to cart', description: `${item.name} added to cart` });
  };

  const updateQuantity = (id: string, change: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0);

    saveCart(newCart);
  };

  const removeFromCart = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Error', description: 'Your cart is empty', variant: 'destructive' });
      return;
    }
    navigate('/checkout', { state: { cartItems: cart } });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  if (profile?.role !== 'customer') {
    return <Layout role={profile?.role}><div className="p-8 text-center">Access denied. Customer role required.</div></Layout>;
  }

  return (
    <Layout role="customer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Menu</h1>
          <Button onClick={handleCheckout} className="relative">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart {cart.length > 0 && `(${cart.length})`}
          </Button>
        </div>

        {cart.length > 0 && (
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                    <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-xl font-bold">₱{getTotalPrice().toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full mt-4">Proceed to Checkout</Button>
          </Card>
        )}

        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">₱{item.price}</span>
                      <Button onClick={() => addToCart(item)}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
