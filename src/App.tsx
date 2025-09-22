import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Auth } from "./pages/Auth";
import Index from "./pages/Index";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { DriverDashboard } from "./pages/DriverDashboard";
import { ChatInterface } from "./pages/ChatInterface";
import { ReviewDashboard } from "./pages/ReviewDashboard";
import { MyOrders } from "./pages/MyOrders";
import { Checkout } from "./pages/Checkout";
import { Receipt } from "./pages/Receipt";
import { TrackOrder } from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route 
              path="/owner" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-orders" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipt" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Receipt />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/track" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <TrackOrder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'driver']}>
                  <ChatInterface />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/review" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ReviewDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
