
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  LogOut,
  Home,
  Package
} from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminRole } = useAdmin();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    { path: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
    ...(adminRole === 'super_admin' ? [
      { path: '/admin/admins', icon: Users, label: 'Manage Admins' }
    ] : []),
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-bullion flex items-center justify-center">
              <span className="text-white font-bold text-lg">BP</span>
            </div>
            <span className="font-poppins font-semibold text-lg">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-bullion-purple text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home size={20} />
              <span>Back to Site</span>
            </Link>
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{adminUser?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{adminRole}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
