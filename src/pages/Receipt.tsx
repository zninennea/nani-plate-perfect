import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt as ReceiptIcon, MapPin, MessageCircle, Clock, CheckCircle } from 'lucide-react';
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
    menu_items?: {
      name: string;
      description?: string;
    };
  }>;
  profiles?: {
    full_name: string;
    phone?: string;
    profile_image_url?: string;
  };
}

const Receipt = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!orderId) {
      navigate('/my-orders');
      return;
    }

    fetchOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId, navigate]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (
              name,
              description
            )
          ),
          profiles!orders_driver_id_fkey (
            full_name,
            phone,
            profile_image_url
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
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

  const canChatWithDriver = () => {
    return order?.driver_id && ['picked_up', 'on_the_way'].includes(order.status);
  };

  const canTrackOrder = () => {
    return order?.driver_id && ['picked_up', 'on_the_way'].includes(order.status);
  };

  if (loading) {
    return (
      <Layout role={profile?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading receipt...</div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout role={profile?.role}>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Button onClick={() => navigate('/my-orders')}>
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  const subtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.1;

  return (
    <Layout role={profile?.role}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <ReceiptIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Receipt</h1>
          <p className="text-muted-foreground">Thank you for your order!</p>
        </div>

        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              Order #{order.id.slice(-8)}
              <Badge className={`${getStatusColor(order.status)} text-white ml-2`}>
                {order.status === 'delivered' && <CheckCircle className="w-4 h-4 mr-1" />}
                {order.status !== 'delivered' && <Clock className="w-4 h-4 mr-1" />}
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
              {new Date(order.created_at).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.menu_items?.name || 'Unknown Item'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {order.customer_info.name}</div>
                <div><strong>Phone:</strong> {order.customer_info.phone}</div>
                <div><strong>Email:</strong> {order.customer_info.email}</div>
              </div>
            </div>

            <Separator />

            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h3>
              <p className="text-sm">{order.delivery_address}</p>
              {order.special_instructions && (
                <div className="mt-2">
                  <strong className="text-sm">Special Instructions:</strong>
                  <p className="text-sm text-muted-foreground">{order.special_instructions}</p>
                </div>
              )}
            </div>

            {/* Driver Info */}
            {order.profiles && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Driver Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                      {order.profiles.full_name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div className="font-medium">{order.profiles.full_name}</div>
                      {order.profiles.phone && (
                        <div className="text-sm text-muted-foreground">
                          {order.profiles.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Order Total */}
            <div>
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {canTrackOrder() && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/track-order/${order.id}`)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              )}

              {canChatWithDriver() && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/chat/${order.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with Driver
                </Button>
              )}

              <Button
                onClick={() => navigate('/my-orders')}
              >
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-sm">Order placed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${['pending'].includes(order.status) ? 'bg-gray-300' : 'bg-green-500'}`} />
                <span className="text-sm">Order confirmed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${['pending', 'confirmed'].includes(order.status) ? 'bg-gray-300' : 'bg-green-500'}`} />
                <span className="text-sm">Preparing food</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${['pending', 'confirmed', 'preparing'].includes(order.status) ? 'bg-gray-300' : 'bg-green-500'}`} />
                <span className="text-sm">Ready for pickup</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${['pending', 'confirmed', 'preparing', 'ready'].includes(order.status) ? 'bg-gray-300' : 'bg-green-500'}`} />
                <span className="text-sm">Driver picked up</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status) ? 'bg-gray-300' : 'bg-green-500'}`} />
                <span className="text-sm">On the way</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Delivered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Receipt;