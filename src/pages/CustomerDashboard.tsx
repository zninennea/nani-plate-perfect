import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Minus, ShoppingCart, Star, MessageCircle, MapPin, Clock } from 'lucide-react';
import { MenuItem, CartItem, Order, Driver } from '@/types';
import { useToast } from '@/hooks/use-toast';
import burgerHero from '@/assets/burger-hero.jpg';
import salad from '@/assets/salad.jpg';

export const CustomerDashboard = () => {
  const { toast } = useToast();
  
  const [menuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Gourmet Burger',
      description: 'Juicy beef patty with fresh lettuce, tomatoes, and our special sauce',
      price: 12.99,
      image: burgerHero,
      category: 'Main Course',
      available: true
    },
    {
      id: '2',
      name: 'Fresh Garden Salad',
      description: 'Mixed greens with seasonal vegetables and house dressing',
      price: 8.99,
      image: salad,
      category: 'Salads',
      available: true
    }
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [showDriverInfo, setShowDriverInfo] = useState(false);

  const addToCart = (item: MenuItem, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity}x ${item.name} added to your cart`,
    });
    
    setSelectedItem(null);
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const order: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total: getTotalPrice(),
      status: 'pending',
      customerInfo: {
        name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St, City, State'
      },
      createdAt: new Date()
    };
    
    setCurrentOrder(order);
    setCart([]);
    setIsCartOpen(false);
    
    // Simulate driver assignment after 3 seconds
    setTimeout(() => {
      const driver: Driver = {
        id: '1',
        name: 'Mike Johnson',
        phone: '+1987654321',
        rating: 4.8,
        isAvailable: true,
        currentLocation: { lat: 40.7128, lng: -74.0060 }
      };
      setAssignedDriver(driver);
      setShowDriverInfo(true);
      setCurrentOrder(prev => prev ? { ...prev, status: 'confirmed', driverId: driver.id } : null);
    }, 3000);
    
    toast({
      title: "Order placed successfully!",
      description: "Your order has been confirmed and is being prepared.",
    });
  };

  const ItemQuantitySelector = ({ item }: { item: MenuItem }) => {
    const [quantity, setQuantity] = useState(1);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90"
          onClick={() => addToCart(item, quantity)}
        >
          Add to Cart - ${(item.price * quantity).toFixed(2)}
        </Button>
      </div>
    );
  };

  return (
    <Layout role="customer">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Browse Menu</h1>
            <p className="text-muted-foreground">Discover delicious meals from our kitchen</p>
          </div>
          
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
                <SheetDescription>Review your items before checkout</SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-gradient-primary hover:opacity-90"
                        onClick={handleCheckout}
                      >
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Order Status */}
        {currentOrder && (
          <Card className="shadow-medium border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-success" />
                Order Status: {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
              </CardTitle>
              <CardDescription>Order #{currentOrder.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total:</strong> ${currentOrder.total.toFixed(2)}</p>
                <p><strong>Items:</strong> {currentOrder.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}</p>
                {assignedDriver && (
                  <div className="flex items-center justify-between mt-4 p-3 bg-success/10 rounded-lg">
                    <div>
                      <p className="font-medium">Driver Assigned: {assignedDriver.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {assignedDriver.rating} • {assignedDriver.phone}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="shadow-medium hover:shadow-strong transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Unavailable</Badge>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <span className="text-lg font-bold text-primary">${item.price}</span>
                </div>
                <Badge variant="outline">{item.category}</Badge>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4">{item.description}</CardDescription>
                
                {item.available && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                        <DialogDescription>{item.description}</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="text-center">
                          <span className="text-2xl font-bold text-primary">${item.price}</span>
                        </div>
                        <ItemQuantitySelector item={item} />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};