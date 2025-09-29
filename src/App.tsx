import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { DriverDashboard } from "./pages/DriverDashboard";
import { ChatInterface } from "./pages/ChatInterface";
import { ReviewDashboard } from "./pages/ReviewDashboard";
import MyOrders from "./pages/MyOrders";
import Checkout from "./pages/Checkout";
import Receipt from "./pages/Receipt";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      owner: '/owner',
      customer: '/customer',
      driver: '/driver'
    };
    return <Navigate to={dashboardMap[profile.role as keyof typeof dashboardMap] || '/customer'} replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (user && profile) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      owner: '/owner',
      customer: '/customer', 
      driver: '/driver'
    };
    return <Navigate to={dashboardMap[profile.role as keyof typeof dashboardMap] || '/customer'} replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => (
  <Routes>
    <Route path="/" element={
      <PublicRoute>
        <Index />
      </PublicRoute>
    } />
    <Route path="/auth" element={
      <PublicRoute>
        <Auth />
      </PublicRoute>
    } />
    
    {/* Owner Routes */}
    <Route path="/owner" element={
      <ProtectedRoute allowedRoles={['owner']}>
        <OwnerDashboard />
      </ProtectedRoute>
    } />
    
    {/* Customer Routes */}
    <Route path="/customer" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerDashboard />
      </ProtectedRoute>
    } />
    <Route path="/my-orders" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <MyOrders />
      </ProtectedRoute>
    } />
    <Route path="/checkout" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <Checkout />
      </ProtectedRoute>
    } />
    <Route path="/receipt/:orderId" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <Receipt />
      </ProtectedRoute>
    } />
    <Route path="/track-order/:orderId" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <TrackOrder />
      </ProtectedRoute>
    } />
    
    {/* Driver Routes */}
    <Route path="/driver" element={
      <ProtectedRoute allowedRoles={['driver']}>
        <DriverDashboard />
      </ProtectedRoute>
    } />
    
    {/* Shared Routes */}
    <Route path="/chat/:orderId?" element={
      <ProtectedRoute>
        <ChatInterface />
      </ProtectedRoute>
    } />
    <Route path="/review/:orderId?" element={
      <ProtectedRoute>
        <ReviewDashboard />
      </ProtectedRoute>
    } />
    
    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
