import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

export const ReviewDashboard = () => {
  const { orderId } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any>(null);
  const [foodRating, setFoodRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredFoodStar, setHoveredFoodStar] = useState(0);
  const [hoveredDriverStar, setHoveredDriverStar] = useState(0);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders' as any)
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', user?.id)
      .eq('status', 'delivered')
      .single();

    if (error || !data) {
      toast({ title: 'Error', description: 'Order not found', variant: 'destructive' });
      navigate('/my-orders');
    } else {
      setOrder(data);
    }
  };

  const submitReview = async () => {
    if (foodRating === 0) {
      toast({ title: 'Error', description: 'Please rate the food', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('reviews' as any)
      .insert({
        order_id: orderId,
        customer_id: user?.id,
        driver_id: order.driver_id,
        food_rating: foodRating,
        driver_rating: driverRating > 0 ? driverRating : null,
        comment: comment.trim() || null
      } as any);

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Review submitted successfully!' });
      navigate('/my-orders');
    }
  };

  const StarRating = ({ 
    rating, 
    setRating, 
    hoveredStar, 
    setHoveredStar, 
    label 
  }: { 
    rating: number; 
    setRating: (n: number) => void; 
    hoveredStar: number; 
    setHoveredStar: (n: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (!order) {
    return (
      <Layout role={profile?.role}>
        <Card className="p-8 text-center">Loading...</Card>
      </Layout>
    );
  }

  return (
    <Layout role={profile?.role}>
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Leave a Review</h1>
          <p className="text-gray-600 mb-6">Order #{order.id.slice(0, 8)}</p>

          <div className="space-y-6">
            <StarRating
              rating={foodRating}
              setRating={setFoodRating}
              hoveredStar={hoveredFoodStar}
              setHoveredStar={setHoveredFoodStar}
              label="How was the food?"
            />

            {order.driver_id && (
              <StarRating
                rating={driverRating}
                setRating={setDriverRating}
                hoveredStar={hoveredDriverStar}
                setHoveredStar={setHoveredDriverStar}
                label="How was the delivery service?"
              />
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Comments (Optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={submitReview} className="flex-1">Submit Review</Button>
              <Button variant="outline" onClick={() => navigate('/my-orders')}>Cancel</Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
