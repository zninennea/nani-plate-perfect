import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageCircle, Phone, User, Clock, Navigation } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  status: string;
  delivery_address: string;
  created_at: string;
  driver_id?: string;
  profiles?: {
    full_name: string;
    phone?: string;
    current_location?: {
      lat: number;
      lng: number;
    };
    driver_license_url?: string;
    license_plate_url?: string;
    license_plate_number?: string;
  };
}

const TrackOrder = () => {
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

    // Subscribe to real-time location updates
    const channel = supabase
      .channel('order-tracking')
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
          profiles!orders_driver_id_fkey (
            full_name,
            phone,
            current_location,
            driver_license_url,
            license_plate_url,
            license_plate_number
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

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return '15-20 minutes';
      case 'preparing':
        return '10-15 minutes';
      case 'ready':
        return '5-10 minutes';
      case 'picked_up':
      case 'on_the_way':
        return '10-15 minutes';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Layout role={profile?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading order tracking...</div>
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

  return (
    <Layout role={profile?.role}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Order #{order.id.slice(-8)}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Live Map
              </CardTitle>
              <CardDescription>
                Track your driver's location in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg h-80 flex items-center justify-center border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Interactive Map</h3>
                  <p className="text-blue-600 text-sm max-w-xs">
                    Real-time GPS tracking will show your driver's location and route here
                  </p>
                  {order.profiles?.current_location && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-600">Last known location:</p>
                      <p className="text-sm font-medium">
                        {order.profiles.current_location.lat.toFixed(6)}, {order.profiles.current_location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status & Driver Info */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${getStatusColor(order.status)} text-white text-base px-3 py-1`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Estimated time</div>
                    <div className="font-semibold">{getEstimatedTime(order.status)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Order placed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Order confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${['preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Preparing food</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${['ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Ready for pickup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${['picked_up', 'on_the_way', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Driver picked up</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${['on_the_way', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">On the way to you</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Delivered</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            {order.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Your Driver
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {order.profiles.full_name?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{order.profiles.full_name}</div>
                      {order.profiles.phone && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {order.profiles.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {order.profiles.license_plate_number && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-1">Vehicle Information</div>
                      <div className="text-sm text-muted-foreground">
                        License Plate: <span className="font-mono font-semibold">{order.profiles.license_plate_number}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {(['picked_up', 'on_the_way'].includes(order.status)) && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/chat/${order.id}`)}
                          className="flex-1"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        {order.profiles.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${order.profiles?.phone}`)}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.delivery_address}</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/receipt/${order.id}`)}
                className="flex-1"
              >
                View Receipt
              </Button>
              <Button
                onClick={() => navigate('/my-orders')}
                className="flex-1"
              >
                All Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;