import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, User, Truck, Star, ArrowRight, Utensils, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import burgerHero from '@/assets/burger-hero.jpg';
import naniLogo from '@/assets/nani-logo.png';

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'owner',
      title: 'Restaurant Owner',
      description: 'Manage your menu, track orders, and grow your business',
      icon: ChefHat,
      path: '/owner',
      color: 'bg-gradient-primary',
      features: ['Menu Management', 'Order Tracking', 'Analytics Dashboard', 'Revenue Reports']
    },
    {
      id: 'customer',
      title: 'Customer',
      description: 'Browse delicious meals and track your deliveries',
      icon: User,
      path: '/customer',
      color: 'bg-gradient-success',
      features: ['Browse Menu', 'Easy Ordering', 'Real-time Tracking', 'Review System']
    },
    {
      id: 'driver',
      title: 'Delivery Driver',
      description: 'Accept deliveries and earn money on your schedule',
      icon: Truck,
      path: '/driver',
      color: 'bg-gradient-warm',
      features: ['Flexible Hours', 'GPS Navigation', 'Instant Notifications', 'Earnings Tracker']
    }
  ];

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
              <div className="flex justify-center mb-6">
                <img 
                  src={naniLogo} 
                  alt="NaNi Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h1 className="text-5xl font-bold mb-6">Welcome to NaNi</h1>
              <p className="text-xl mb-8 text-white/90">
                Your complete food ordering and delivery management platform. 
                Connect restaurants, customers, and drivers in one seamless experience.
              </p>
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

        {/* Role Selection */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Dashboard</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select your role to access the features designed specifically for you. 
              Each dashboard is tailored to provide the best experience for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id} 
                  className="group hover:shadow-strong transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => navigate(role.path)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${role.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-medium`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription className="text-center">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-success" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(role.path);
                      }}
                    >
                      Access Dashboard
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
