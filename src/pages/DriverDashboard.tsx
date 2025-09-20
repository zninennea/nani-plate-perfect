import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Truck, Clock, MapPin, Phone, Star, CheckCircle, Navigation } from 'lucide-react';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const DriverDashboard = () => {
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>({
    id: '1001',
    items: [
      { id: '1', name: 'Gourmet Burger', description: 'Juicy beef patty', price: 12.99, quantity: 2, image: '', category: 'Main Course', available: true },
      { id: '2', name: 'Fresh Garden Salad', description: 'Mixed greens', price: 8.99, quantity: 1, image: '', category: 'Salads', available: true }
    ],
    total: 34.97,
    status: 'confirmed',
    customerInfo: {
      name: 'John Doe',
      phone: '+1234567890',
      address: '123 Main St, Downtown Area, City'
    },
    driverId: 'driver1',
    createdAt: new Date()
  });

  const [orderStatus, setOrderStatus] = useState<'coming' | 'received' | 'on-way' | 'delivered'>('coming');

  const handleStatusUpdate = (newStatus: typeof orderStatus) => {
    setOrderStatus(newStatus);
    
    const statusMessages = {
      coming: 'Heading to the restaurant',
      received: 'Order received from restaurant',
      'on-way': 'On the way to customer',
      delivered: 'Order delivered successfully'
    };
    
    toast({
      title: "Status Updated",
      description: statusMessages[newStatus],
    });

    if (newStatus === 'delivered') {
      setActiveOrder(null);
      setOrderStatus('coming');
    }
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    toast({
      title: isAvailable ? "You're now unavailable" : "You're now available",
      description: isAvailable ? "You won't receive new orders" : "You can now receive new orders",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'coming': return 'warning';
      case 'received': return 'default';
      case 'on-way': return 'default';
      case 'delivered': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Layout role="driver">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
            <p className="text-muted-foreground">Manage your delivery orders and availability</p>
          </div>
          
          {/* Availability Toggle */}
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Label htmlFor="availability" className="text-sm font-medium">
                Available for deliveries
              </Label>
              <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
              />
              <Badge variant={isAvailable ? "success" : "secondary"}>
                {isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Driver Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <span className="text-sm text-success">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">$156.80</div>
              <p className="text-xs text-muted-foreground">+$24.30 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">Based on 156 reviews</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3m</div>
              <p className="text-xs text-muted-foreground">Average pickup time</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Order */}
        {activeOrder && isAvailable ? (
          <Card className="shadow-medium border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Active Order #{activeOrder.id}
                </CardTitle>
                <Badge variant={getStatusColor(orderStatus) as any}>
                  {orderStatus.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              <CardDescription>Order total: ${activeOrder.total.toFixed(2)}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Customer Information
                </h4>
                <div className="pl-6 space-y-1">
                  <p><strong>Name:</strong> {activeOrder.customerInfo.name}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {activeOrder.customerInfo.phone}
                  </p>
                  <p><strong>Address:</strong> {activeOrder.customerInfo.address}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-semibold">Order Items</h4>
                <div className="space-y-2">
                  {activeOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Status Updates */}
              <div className="space-y-3">
                <h4 className="font-semibold">Update Order Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={orderStatus === 'coming' ? "default" : "outline"}
                    onClick={() => handleStatusUpdate('coming')}
                    disabled={orderStatus !== 'coming'}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Coming to Restaurant
                  </Button>
                  
                  <Button
                    variant={orderStatus === 'received' ? "default" : "outline"}
                    onClick={() => handleStatusUpdate('received')}
                    disabled={orderStatus === 'coming' || orderStatus === 'delivered'}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Received Order
                  </Button>
                  
                  <Button
                    variant={orderStatus === 'on-way' ? "default" : "outline"}
                    onClick={() => handleStatusUpdate('on-way')}
                    disabled={orderStatus === 'coming' || orderStatus === 'delivered'}
                    className="flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    On the Way
                  </Button>
                  
                  <Button
                    variant={orderStatus === 'delivered' ? "success" : "outline"}
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={orderStatus === 'coming' || orderStatus === 'received'}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Delivered
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isAvailable ? "No active orders" : "You're currently unavailable"}
              </h3>
              <p className="text-muted-foreground text-center">
                {isAvailable 
                  ? "New delivery requests will appear here when available"
                  : "Turn on availability to receive delivery requests"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};