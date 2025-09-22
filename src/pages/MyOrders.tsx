import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  total: number;
  status: string;
  delivery_address: string;
  created_at: string;
  driver_id: string | null;
  order_items: Array<{
    quantity: number;
    price: number;
    menu_items: {
      name: string;
      image_url: string;
    };
  }>;
  profiles?: {
    full_name: string;
    phone: string;
  };
}

export const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              price,
              menu_items (name, image_url)
            ),
            profiles!orders_driver_id_fkey (full_name, phone)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          toast({
            title: "Error",
            description: "Failed to load your orders",
            variant: "destructive",
          });
          return;
        }

        setOrders(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': case 'preparing': return <Clock className="w-4 h-4 text-warning" />;
      case 'ready': case 'picked-up': return <Truck className="w-4 h-4 text-info" />;
      case 'on-the-way': return <MapPin className="w-4 h-4 text-info" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': case 'preparing': return 'secondary';
      case 'ready': case 'picked-up': case 'on-the-way': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const handleChatWithDriver = (orderId: string) => {
    navigate(`/chat?orderId=${orderId}`);
  };

  if (loading) {
    return (
      <Layout role="customer">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <div className="text-center py-8">Loading your orders...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="customer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground">Track your food delivery orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No orders yet</p>
                  <p>Start browsing our menu to place your first order!</p>
                </div>
                <Button 
                  onClick={() => navigate('/customer')}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Browse Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        Order #{order.id.slice(-8)}
                      </CardTitle>
                      <CardDescription>
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(order.status) as any}>
                      {order.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{order.delivery_address}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Items:</h4>
                    <div className="space-y-1">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <img 
                            src={item.menu_items.image_url} 
                            alt={item.menu_items.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span>{item.quantity}x {item.menu_items.name}</span>
                          <span className="ml-auto font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="font-semibold">
                      Total: ${order.total.toFixed(2)}
                    </div>
                    
                    <div className="flex gap-2">
                      {order.driver_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChatWithDriver(order.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat with Driver
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/review?orderId=${order.id}`)}
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </div>

                  {order.profiles && (
                    <div className="bg-success/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Driver: {order.profiles.full_name}</p>
                          <p className="text-sm text-muted-foreground">{order.profiles.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};