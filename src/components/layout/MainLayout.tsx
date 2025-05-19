
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-bullion text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-bullion-purple font-bold text-lg">BP</span>
            </div>
            <span className="font-poppins font-semibold text-lg">BullionPay</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hidden sm:block hover:text-bullion-purple-100 transition-colors">
              Dashboard
            </Link>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm">
                  {user?.phoneNumber}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:text-bullion-purple-100 text-white"
                  onClick={logout}
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block hover:text-bullion-purple-100 transition-colors">
                Login
              </Link>
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
      
      {/* Mobile Navigation - Added z-index and proper spacing */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
        <div className="flex justify-around">
          <Link 
            to="/"
            className={`flex flex-col items-center p-2 ${location.pathname === '/' ? 'text-bullion-purple-600' : 'text-gray-500'}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link 
            to="/dashboard"
            className={`flex flex-col items-center p-2 ${location.pathname.startsWith('/dashboard') ? 'text-bullion-purple-600' : 'text-gray-500'}`}
          >
            <ShoppingCart size={20} />
            <span className="text-xs mt-1">Orders</span>
          </Link>
          <Link 
            to="/login" 
            className={`flex flex-col items-center p-2 ${location.pathname === '/login' ? 'text-bullion-purple-600' : 'text-gray-500'}`}
          >
            <User size={20} />
            <span className="text-xs mt-1">{isAuthenticated ? 'Account' : 'Login'}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
