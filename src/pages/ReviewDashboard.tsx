import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Star, Truck, ChefHat, Send } from 'lucide-react';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const ReviewDashboard = () => {
  const { toast } = useToast();
  
  const [completedOrder] = useState<Order>({
    id: '1001',
    items: [
      { id: '1', name: 'Gourmet Burger', description: 'Juicy beef patty', price: 12.99, quantity: 2, image: '', category: 'Main Course', available: true },
      { id: '2', name: 'Fresh Garden Salad', description: 'Mixed greens', price: 8.99, quantity: 1, image: '', category: 'Salads', available: true }
    ],
    total: 34.97,
    status: 'delivered',
    customerInfo: {
      name: 'John Doe',
      phone: '+1234567890',
      address: '123 Main St, Downtown Area, City'
    },
    driverId: 'driver1',
    createdAt: new Date()
  });

  const [driverRating, setDriverRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [driverComment, setDriverComment] = useState('');
  const [foodComment, setFoodComment] = useState('');

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    label: string;
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="transition-colors"
            >
              <Star 
                className={`w-6 h-6 ${
                  star <= rating 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-muted-foreground hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmitReview = () => {
    if (driverRating === 0 || foodRating === 0) {
      toast({
        title: "Please provide ratings",
        description: "Both driver and food ratings are required.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Review submitted successfully!",
      description: "Thank you for your feedback. It helps us improve our service.",
    });

    // Reset form
    setDriverRating(0);
    setFoodRating(0);
    setDriverComment('');
    setFoodComment('');
  };

  return (
    <Layout role="customer">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Rate Your Experience</h1>
          <p className="text-muted-foreground">Your feedback helps us serve you better</p>
        </div>

        {/* Order Summary */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Order #{completedOrder.id} • ${completedOrder.total.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Rating */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Rate Your Driver
            </CardTitle>
            <CardDescription>Mike Johnson delivered your order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StarRating
              rating={driverRating}
              onRatingChange={setDriverRating}
              label="Delivery Experience"
            />
            
            <div className="space-y-2">
              <Label htmlFor="driver-comment">Additional Comments (Optional)</Label>
              <Textarea
                id="driver-comment"
                placeholder="How was your delivery experience? Was the driver professional and courteous?"
                value={driverComment}
                onChange={(e) => setDriverComment(e.target.value)}
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Food Rating */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Rate Your Food
            </CardTitle>
            <CardDescription>How did you enjoy your meal?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StarRating
              rating={foodRating}
              onRatingChange={setFoodRating}
              label="Food Quality"
            />
            
            <div className="space-y-2">
              <Label htmlFor="food-comment">Additional Comments (Optional)</Label>
              <Textarea
                id="food-comment"
                placeholder="Tell us about the food quality, taste, temperature, and presentation."
                value={foodComment}
                onChange={(e) => setFoodComment(e.target.value)}
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <Button 
              onClick={handleSubmitReview}
              className="w-full bg-gradient-primary hover:opacity-90 text-lg py-6"
              disabled={driverRating === 0 || foodRating === 0}
            >
              <Send className="w-5 h-5 mr-2" />
              Submit Review
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Your review will be shared with the restaurant and delivery partner
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Previous Reviews */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Your Recent Reviews</CardTitle>
            <CardDescription>Here are your recent feedback submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Order #1000</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">4.5</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "Great food and excellent delivery service. The driver was very professional."
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Order #999</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">5.0</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "Perfect order! Food arrived hot and fresh. Will definitely order again."
                </p>
                <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};