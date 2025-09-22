import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, MessageCircle, MapPin, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OrderDetails {
  id: string;
  total: number;
  status: string;
  delivery_address: string;
  customer_info: {
    name: string;
    phone: string;
    address: string;
  };
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

export const Receipt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(
    location.state?.orderDetails || null
  );
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrderDetails = async () => {
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
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order details:', error);
        return;
      }

      setOrderDetails({
        ...data,
        customer_info: data.customer_info as { name: string; phone: string; address: string }
      });
    };

    // Fetch fresh data if not provided
    if (!orderDetails) {
      fetchOrderDetails();
    }

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        () => {
          fetchOrderDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId, orderDetails]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'confirmed': case 'preparing': return <Clock className="w-5 h-5 text-warning" />;
      case 'ready': case 'picked-up': return <Truck className="w-5 h-5 text-info" />;
      case 'on-the-way': return <MapPin className="w-5 h-5 text-info" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-success" />;
      default: return <Clock className="w-5 h-5" />;
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

  const handleChatWithDriver = () => {
    if (orderDetails) {
      navigate(`/chat?orderId=${orderDetails.id}`);
    }
  };

  const handleOrderReceived = async () => {
    if (!orderDetails) return;

    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderDetails.id);

    if (!error) {
      // Navigate to review page
      navigate(`/review?orderId=${orderDetails.id}`);
    }
  };

  if (!orderDetails) {
    return (
      <Layout role="customer">
        <div className="text-center py-12">
          <p>Loading order details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="customer">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your order</p>
        </div>

        {/* Order Status */}
        <Card className="shadow-medium border-success">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(orderDetails.status)}
                  Order #{orderDetails.id.slice(-8)}
                </CardTitle>
                <CardDescription>
                  Placed on {new Date(orderDetails.created_at).toLocaleDateString()} at{' '}
                  {new Date(orderDetails.created_at).toLocaleTimeString()}
                </CardDescription>
              </div>
              <Badge variant={getStatusColor(orderDetails.status) as any}>
                {orderDetails.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">{orderDetails.delivery_address}</p>
              </div>
            </div>

            {orderDetails.profiles && (
              <div className="bg-success/10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Your Driver: {orderDetails.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.profiles.phone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChatWithDriver}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderDetails.order_items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <img 
                  src={item.menu_items.image_url} 
                  alt={item.menu_items.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.menu_items.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {orderDetails.status === 'on-the-way' && (
            <Button
              onClick={handleOrderReceived}
              className="bg-gradient-primary hover:opacity-90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Received
            </Button>
          )}
          
          {orderDetails.status === 'delivered' && (
            <Button
              onClick={() => navigate(`/review?orderId=${orderDetails.id}`)}
              className="bg-gradient-primary hover:opacity-90"
            >
              Leave Review
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/my-orders')}
          >
            View All Orders
          </Button>
        </div>
      </div>
    </Layout>
  );
};