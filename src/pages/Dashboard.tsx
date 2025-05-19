
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TabGroup from '@/components/ui/TabGroup';
import OrderCard, { Order } from '@/components/ui/OrderCard';
import { Button } from '@/components/ui/button';

// Sample orders - in a real app this would come from API
const sampleOrders: Order[] = [
  {
    id: '1',
    productName: 'Netflix Basic',
    orderDate: '2023-05-19T12:00:00Z',
    status: 'Delivered',
    deliveryInfo: 'Email: user@example.com | Password: Pass123!',
    adminNotes: 'Delivered via WhatsApp',
  },
  {
    id: '2',
    productName: 'Amazon Gift Card',
    orderDate: '2023-05-18T10:30:00Z',
    status: 'Delivered',
    deliveryInfo: 'Gift Card Code: AMZN-1234-5678-ABCD',
  },
  {
    id: '3',
    productName: 'Xbox Game Pass',
    orderDate: '2023-05-17T15:45:00Z',
    status: 'Paid',
  },
];

type FilterTab = 'all' | 'one-time' | 'subscription';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const navigate = useNavigate();
  
  // Mock authentication state - in real app would use auth context/hook
  const isAuthenticated = true; // Just for demo, would be from auth state
  
  const filteredOrders = sampleOrders.filter((order) => {
    if (activeTab === 'all') return true;
    // This is just a simple filter for demo purposes
    // In a real app, orders would have more properties to filter on
    if (activeTab === 'subscription') {
      return order.productName.includes('Netflix') || order.productName.includes('Spotify');
    }
    if (activeTab === 'one-time') {
      return order.productName.includes('Gift Card') || order.productName.includes('Game Pass');
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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">My Purchases</h1>
        <p className="text-gray-600">View and manage your orders</p>
      </div>
      
      <div className="mb-6">
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as FilterTab)}
        />
      </div>
      
      {filteredOrders.length > 0 ? (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-medium mb-2">No purchases yet</h3>
          <p className="text-gray-600 mb-6">
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
