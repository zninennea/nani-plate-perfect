import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Navigation, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Driver {
  full_name: string;
  phone: string;
  current_location: { lat: number; lng: number } | null;
}

interface Order {
  id: string;
  status: string; 
  delivery_address: string;
  profiles?: Driver;
}

export const TrackOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          delivery_address,
          profiles!orders_driver_id_fkey (
            full_name,
            phone,
            current_location
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return;
      }

      setOrder({
        ...data,
        profiles: data.profiles ? {
          ...data.profiles,
          current_location: data.profiles.current_location as { lat: number; lng: number } | null
        } : undefined
      });
      setLoading(false);
    };

    fetchOrder();

    // Set up real-time subscription for driver location updates
    const channel = supabase
      .channel(`driver-location-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId]);

  if (loading) {
    return (
      <Layout role="customer">
        <div className="text-center py-12">
          <p>Loading order tracking...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout role="customer">
        <div className="text-center py-12">
          <p>Order not found</p>
          <Button onClick={() => navigate('/my-orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="customer">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Track Order</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(-8)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                {order.profiles?.current_location ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Navigation className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Driver Location</p>
                      <p className="text-sm text-muted-foreground">
                        Lat: {order.profiles.current_location.lat.toFixed(6)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lng: {order.profiles.current_location.lng.toFixed(6)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {order.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Driver location will appear here</p>
                    <p className="text-sm">when order is picked up</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Driver Info */}
          <div className="space-y-6">
            {order.profiles && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Your Driver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {order.profiles.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{order.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.profiles.phone}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`tel:${order.profiles?.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Driver
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Delivery Info */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary">
                    {order.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Progress */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Order Placed', time: 'Just now' },
                    { status: 'confirmed', label: 'Order Confirmed', time: '2 mins ago' },
                    { status: 'preparing', label: 'Preparing Food', time: '5 mins ago' },
                    { status: 'ready', label: 'Ready for Pickup', time: '10 mins ago' },
                    { status: 'picked-up', label: 'Order Picked Up', time: '15 mins ago' },
                    { status: 'on-the-way', label: 'On the Way', time: 'Now' },
                    { status: 'delivered', label: 'Delivered', time: 'Pending' },
                  ].map((step, index) => {
                    const isCompleted = ['pending', 'confirmed', 'preparing', 'ready', 'picked-up', 'on-the-way', 'delivered']
                      .indexOf(order.status) >= index;
                    const isCurrent = order.status === step.status;

                    return (
                      <div key={step.status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-success' : 'bg-muted'
                        } ${isCurrent ? 'ring-2 ring-success ring-offset-2' : ''}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};