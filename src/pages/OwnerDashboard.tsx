import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FileUpload from '@/components/FileUpload';

export const OwnerDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true
  });

  useEffect(() => {
    if (profile?.role === 'owner') {
      fetchMenuItems();
      fetchOrders();
    }
  }, [profile]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load menu items', variant: 'destructive' });
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders' as any)
      .select(`
        *,
        order_items (
          *,
          menu_items (*)
        ),
        profiles!orders_customer_id_fkey (full_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } else {
      setOrders(data || []);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast({ title: 'Error', description: 'Name and price are required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('menu_items' as any)
      .insert({
        ...newItem,
        price: parseFloat(newItem.price),
        owner_id: profile?.user_id
      } as any);

    if (error) {
      toast({ title: 'Error', description: 'Failed to add menu item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Menu item added successfully' });
      setNewItem({ name: '', description: '', price: '', category: '', image_url: '', available: true });
      fetchMenuItems();
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    const { error } = await supabase
      .from('menu_items' as any)
      .update({
        name: editingItem.name,
        description: editingItem.description,
        price: parseFloat(editingItem.price),
        category: editingItem.category,
        image_url: editingItem.image_url,
        available: editingItem.available
      } as any)
      .eq('id', editingItem.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update menu item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Menu item updated successfully' });
      setEditingItem(null);
      fetchMenuItems();
    }
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from('menu_items' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete menu item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Menu item deleted successfully' });
      fetchMenuItems();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
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

  if (profile?.role !== 'owner') {
    return <Layout role={profile?.role}><div className="p-8 text-center">Access denied. Owner role required.</div></Layout>;
  }

  return (
    <Layout role="owner">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Restaurant Owner Dashboard</h1>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
              <div className="grid gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Item description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="e.g., Main Course"
                    />
                  </div>
                </div>
                <div>
                  <Label>Image</Label>
                  <FileUpload
                    onFileUrlChange={(url) => setNewItem({ ...newItem, image_url: url })}
                    currentUrl={newItem.image_url}
                  />
                </div>
                <Button onClick={handleAddItem}>Add Menu Item</Button>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id} className="p-4">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover rounded-md mb-4" />
                  )}
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <p className="text-lg font-bold text-primary mb-2">₱{item.price}</p>
                  <p className="text-sm text-gray-500 mb-4">{item.category}</p>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Menu Item</DialogTitle>
                        </DialogHeader>
                        {editingItem && (
                          <div className="grid gap-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={editingItem.description}
                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Price</Label>
                                <Input
                                  type="number"
                                  value={editingItem.price}
                                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Category</Label>
                                <Input
                                  value={editingItem.category}
                                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Image</Label>
                              <FileUpload
                                onFileUrlChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
                                currentUrl={editingItem.image_url}
                              />
                            </div>
                            <Button onClick={handleUpdateItem}>Update Item</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600">Customer: {order.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Phone: {order.profiles?.phone || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Address: {order.delivery_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₱{order.total}</p>
                    <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  {order.order_items?.map((item: any, idx: number) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {item.quantity}x {item.menu_items?.name} - ₱{item.price}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="picked-up">Picked Up</option>
                    <option value="on-the-way">On the Way</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
