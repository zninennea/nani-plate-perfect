import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const DriverDashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'driver') {
      fetchOrders();
      
      const channel = supabase
        .channel('driver-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const fetchOrders = async () => {
    const { data: available } = await supabase
      .from('orders' as any)
      .select(`
        *,
        order_items (
          *,
          menu_items (*)
        ),
        profiles!orders_customer_id_fkey (full_name, phone)
      `)
      .eq('status', 'ready')
      .is('driver_id', null)
      .order('created_at', { ascending: false });

    const { data: assigned } = await supabase
      .from('orders' as any)
      .select(`
        *,
        order_items (
          *,
          menu_items (*)
        ),
        profiles!orders_customer_id_fkey (full_name, phone)
      `)
      .eq('driver_id', user?.id)
      .not('status', 'in', '(delivered)')
      .order('created_at', { ascending: false });

    setAvailableOrders(available || []);
    setMyOrders(assigned || []);
    setLoading(false);
  };

  const acceptOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders' as any)
      .update({
        driver_id: user?.id,
        status: 'picked-up'
      } as any)
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to accept order', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Order accepted!' });
      fetchOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders' as any)
      .update({ status } as any)
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Order status updated' });
      fetchOrders();
    }
  };

  if (profile?.role !== 'driver') {
    return <Layout role={profile?.role}><div className="p-8 text-center">Access denied. Driver role required.</div></Layout>;
  }

  const renderOrderCard = (order: any, showAcceptButton: boolean = false) => (
    <Card key={order.id} className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-600">Customer: {order.profiles?.full_name || 'Unknown'}</p>
          <p className="text-sm text-gray-600">Phone: {order.profiles?.phone || 'N/A'}</p>
          <p className="text-sm text-gray-600">Delivery: {order.delivery_address}</p>
          {order.special_instructions && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Instructions:</span> {order.special_instructions}
            </p>
          )}
        </div>
        <div className="text-right">
          <Badge>{order.status}</Badge>
          <p className="text-lg font-bold mt-2">₱{order.total}</p>
          <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Items:</h4>
        {order.order_items?.map((item: any, idx: number) => (
          <p key={idx} className="text-sm text-gray-600">
            {item.quantity}x {item.menu_items?.name}
          </p>
        ))}
      </div>
      {showAcceptButton ? (
        <Button onClick={() => acceptOrder(order.id)} className="w-full">Accept Order</Button>
      ) : (
        <div className="flex gap-2">
          {order.status === 'picked-up' && (
            <Button onClick={() => updateOrderStatus(order.id, 'on-the-way')} className="flex-1">
              Start Delivery
            </Button>
          )}
          {order.status === 'on-the-way' && (
            <Button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1">
              Mark as Delivered
            </Button>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <Layout role="driver">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">
              Available Orders {availableOrders.length > 0 && `(${availableOrders.length})`}
            </TabsTrigger>
            <TabsTrigger value="my-orders">
              My Orders {myOrders.length > 0 && `(${myOrders.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableOrders.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                No orders available at the moment
              </Card>
            ) : (
              availableOrders.map(order => renderOrderCard(order, true))
            )}
          </TabsContent>

          <TabsContent value="my-orders" className="space-y-4">
            {myOrders.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                You have no active deliveries
              </Card>
            ) : (
              myOrders.map(order => renderOrderCard(order, false))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
