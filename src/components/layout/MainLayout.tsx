
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, ShoppingCart, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { getHomeRoute } from "@/utils/authUtils";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  // Only show admin link when both auth and admin status are fully resolved
  const showAdminLink = !authLoading && !adminLoading && isAuthenticated && isAdmin;
  
  // Only show auth-dependent UI when auth is fully loaded
  const showAuthUI = !authLoading;
  
  // Show navigation items only when we have stable auth state
  const showStableUI = !authLoading && !adminLoading;

  const homeRoute = getHomeRoute();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-bullion text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to={homeRoute} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-bullion-purple font-bold text-lg">BP</span>
            </div>
            <span className="font-poppins font-semibold text-lg">BullionPay</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {showAuthUI && (
              <>
                {isAuthenticated ? (
                  <div className="hidden sm:flex items-center gap-6">
                    <Link to="/dashboard" className="hover:text-bullion-purple-100 transition-colors">
                      Dashboard
                    </Link>
                    {showAdminLink && (
                      <Link to="/admin" className="flex items-center gap-1 hover:text-bullion-purple-100 transition-colors font-medium">
                        <LayoutDashboard size={18} className="mr-1" />
                        Admin
                      </Link>
                    )}
                    <Link to="/account" className="hover:text-bullion-purple-100 transition-colors">
                      Account
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-3">
                    <Link 
                      to="/login?tab=login" 
                      className="hover:text-bullion-purple-100 transition-colors px-3 py-1 rounded"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/login?tab=signup" 
                      className="bg-white text-bullion-purple hover:bg-bullion-purple-50 transition-colors px-4 py-2 rounded font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} BullionPay. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Mobile Navigation - Only show when state is stable */}
      {showStableUI && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
          <div className="flex justify-around">
            <Link 
              to={homeRoute}
              className={`flex flex-col items-center p-2 ${
                (location.pathname === '/' && homeRoute === '/') || 
                (location.pathname === '/all-products' && homeRoute === '/all-products') 
                ? 'text-bullion-purple-600' : 'text-gray-500'
              }`}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            {isAuthenticated && (
              <Link 
                to="/dashboard"
                className={`flex flex-col items-center p-2 ${location.pathname.startsWith('/dashboard') ? 'text-bullion-purple-600' : 'text-gray-500'}`}
              >
                <ShoppingCart size={20} />
                <span className="text-xs mt-1">Orders</span>
              </Link>
            )}
            {showAdminLink && (
              <Link 
                to="/admin"
                className={`flex flex-col items-center p-2 ${location.pathname.startsWith('/admin') ? 'text-bullion-purple-600' : 'text-gray-500'}`}
              >
                <LayoutDashboard size={20} />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            )}
            {isAuthenticated ? (
              <Link 
                to="/account"
                className={`flex flex-col items-center p-2 ${location.pathname.startsWith('/account') ? 'text-bullion-purple-600' : 'text-gray-500'}`}
              >
                <Settings size={20} />
                <span className="text-xs mt-1">Account</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className={`flex flex-col items-center p-2 ${location.pathname === '/login' ? 'text-bullion-purple-600' : 'text-gray-500'}`}
              >
                <User size={20} />
                <span className="text-xs mt-1">Login</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
