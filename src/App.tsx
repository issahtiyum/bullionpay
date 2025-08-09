
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";

// Components
import AdminRoute from "./components/admin/AdminRoute";

// Pages
import Index from "./pages/Index";
import AllProducts from "./pages/AllProducts";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import SetPassword from "./pages/SetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminProducts from "./pages/admin/AdminProducts";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/all-products" element={<AllProducts />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout/:product_id" element={<Checkout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/set-password" element={<SetPassword />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />
                <Route path="/admin/revenue" element={
                  <AdminRoute>
                    <AdminRevenue />
                  </AdminRoute>
                } />
                <Route path="/admin/disputes" element={
                  <AdminRoute>
                    <AdminDisputes />
                  </AdminRoute>
                } />
                <Route path="/admin/admins" element={
                  <AdminRoute requireRole="super_admin">
                    <AdminAdmins />
                  </AdminRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
