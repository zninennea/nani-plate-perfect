import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, User, Truck, Star, ArrowRight, Utensils, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import burgerHero from '@/assets/burger-hero.jpg';

const Index = () => {
  const navigate = useNavigate();


  const stats = [
    { label: 'Active Restaurants', value: '500+', icon: Utensils },
    { label: 'Happy Customers', value: '10K+', icon: User },
    { label: 'Delivery Drivers', value: '200+', icon: Truck },
    { label: 'Average Delivery Time', value: '25 min', icon: Clock }
  ];

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary shadow-strong">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={burgerHero} 
              alt="Delicious food" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative px-8 py-16 text-center text-white">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-5xl font-bold mb-6">Welcome to NaNi</h1>
              <p className="text-xl mb-8 text-white/90">
                Your complete food ordering and delivery management platform. 
                Connect restaurants, customers, and drivers in one seamless experience.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate('/auth')}
                className="mb-4"
              >
                Get Started
              </Button>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure & Reliable
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Star className="w-4 h-4 mr-2" />
                  Trusted by 10K+ Users
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="text-center shadow-soft">
                <CardContent className="pt-6">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>


        {/* Quick Access */}
        <Card className="shadow-medium bg-muted/20">
          <CardHeader className="text-center">
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump directly to specific features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Chat Interface
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/review')}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Review Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
