import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, MapPin, Star, Clock, Package, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  total: number;
  status: string;
  customer_info: any;
  delivery_address: string;
  special_instructions?: string;
  created_at: string;
  driver_id?: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    menu_item_id: string;
  }>;
  profiles?: {
    full_name: string;
    phone?: string;
    profile_image_url?: string;
  };
}

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchOrders();

    // Subscribe to real-time updates
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
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          profiles!orders_driver_id_fkey (
            full_name,
            phone,
            profile_image_url
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-purple-500';
      case 'picked_up': return 'bg-indigo-500';
      case 'on_the_way': return 'bg-cyan-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'picked_up':
      case 'on_the_way':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Star className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const canChat = (order: Order) => {
    return order.driver_id && ['picked_up', 'on_the_way'].includes(order.status);
  };

  const canTrack = (order: Order) => {
    return order.driver_id && ['picked_up', 'on_the_way'].includes(order.status);
  };

  const canReview = (order: Order) => {
    return order.status === 'delivered';
  };

  if (loading) {
    return (
      <Layout role={profile?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={profile?.role}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground">Track your food delivery orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No Orders Yet</CardTitle>
              <CardDescription className="mb-4">
                You haven't placed any orders yet. Start by browsing our menu!
              </CardDescription>
              <Button onClick={() => navigate('/customer')}>
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-medium">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id.slice(-8)}
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Ordered on {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items.length} item(s)
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Delivery Address</div>
                      <div className="text-sm text-muted-foreground">
                        {order.delivery_address}
                      </div>
                    </div>
                  </div>

                  {order.special_instructions && (
                    <div className="flex items-start gap-4">
                      <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Special Instructions</div>
                        <div className="text-sm text-muted-foreground">
                          {order.special_instructions}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.profiles && (
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                        {order.profiles.full_name?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Your Driver</div>
                        <div className="text-sm text-muted-foreground">
                          {order.profiles.full_name}
                          {order.profiles.phone && ` • ${order.profiles.phone}`}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex flex-wrap gap-2 justify-end">
                    {canTrack(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/track-order/${order.id}`)}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                    )}
                    
                    {canChat(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/chat/${order.id}`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with Driver
                      </Button>
                    )}

                    {canReview(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/review/${order.id}`)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Leave Review
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => navigate(`/receipt/${order.id}`)}
                    >
                      View Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;