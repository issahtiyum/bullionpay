
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TabGroup from '@/components/ui/TabGroup';
import OrderCard, { Order } from '@/components/ui/OrderCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type FilterTab = 'all' | 'one-time' | 'subscription';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database orders to match Order interface
      const transformedOrders: Order[] = data.map(order => ({
        id: order.id,
        productName: order.product_name,
        orderDate: order.created_at,
        status: order.status === 'paid' ? 'Delivered' : 
                order.status === 'pending' ? 'Pending' : 'Paid',
        deliveryInfo: order.delivery_info || undefined,
        adminNotes: order.admin_notes || undefined,
        isSubscription: order.is_subscription || false,
        nextBillingDate: order.next_billing_date || undefined,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: "Failed to load your purchase history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'subscription') {
      return order.isSubscription === true;
    }
    if (activeTab === 'one-time') {
      return !order.isSubscription;
    }
    return true;
  });
  
  const tabs = [
    { id: 'all' as const, label: 'All Purchases' },
    { id: 'one-time' as const, label: 'One-time Purchases' },
    { id: 'subscription' as const, label: 'Subscriptions' },
  ];
  
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
          <p className="mb-6 text-gray-600">Please login to view your dashboard</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">My Purchases</h1>
        <p className="text-gray-600">View and manage your orders</p>
      </div>
      
      <div className="mb-6 overflow-x-auto pb-2">
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as FilterTab)}
          className="min-w-max"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your purchases...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg sm:text-xl font-medium mb-2">No purchases yet</h3>
          <p className="text-gray-600 mb-6 px-4">
            You haven't purchased anything yet. Explore the store to find digital products.
          </p>
          <Button onClick={() => navigate('/')}>
            Browse Products
          </Button>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
