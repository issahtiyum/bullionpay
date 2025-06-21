
import React, { useState } from 'react';
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
  Package,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminRole } = useAdmin();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Define navigation items based on roles
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' }
    ];

    // All roles can view orders, revenue, and disputes
    const commonItems = [
      { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { path: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
      { path: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' }
    ];

    // Only admins and super_admins can manage products
    const productItems = (adminRole === 'admin' || adminRole === 'super_admin') ? [
      { path: '/admin/products', icon: Package, label: 'Products' }
    ] : [];

    // Only super_admins can manage other admins
    const superAdminItems = adminRole === 'super_admin' ? [
      { path: '/admin/admins', icon: Users, label: 'Manage Admins' }
    ] : [];

    return [...baseItems, ...commonItems, ...productItems, ...superAdminItems];
  };

  const navigationItems = getNavigationItems();

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
          <div className="w-8 h-8 rounded-full bg-gradient-bullion flex items-center justify-center">
            <span className="text-white font-bold text-lg">BP</span>
          </div>
          <span className="font-poppins font-semibold text-lg">Admin Panel</span>
        </Link>
      </div>
      
      <nav className="p-4 flex-1">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
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
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Home size={20} />
            <span>Back to Site</span>
          </Link>
        </div>
      </nav>
      
      <div className="p-4 border-t bg-white">
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
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="bg-white shadow-lg"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
          >
            <X size={20} />
          </Button>
        </div>
        
        <SidebarContent />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
