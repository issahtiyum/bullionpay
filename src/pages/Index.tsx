
import { useState } from 'react';
import ProductCard, { type Product } from '@/components/ui/ProductCard';
import MainLayout from '@/components/layout/MainLayout';
import TabGroup from '@/components/ui/TabGroup';

// Sample products data - in a real app would come from API
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Netflix Basic',
    category: 'Subscription',
    price: 50.00,
    image: '/placeholder.svg',
  },
  {
    id: '2',
    name: 'Amazon Gift Card',
    category: 'Gift Card',
    price: 100.00,
    image: '/placeholder.svg',
  },
  {
    id: '3',
    name: 'Xbox Game Pass',
    category: 'Game Credit',
    price: 75.00,
    image: '/placeholder.svg',
  },
  {
    id: '4',
    name: 'Spotify Premium',
    category: 'Subscription',
    price: 30.00,
    image: '/placeholder.svg',
  },
  {
    id: '5',
    name: 'Steam Wallet',
    category: 'Game Credit',
    price: 150.00,
    image: '/placeholder.svg',
  },
  {
    id: '6',
    name: 'iTunes Gift Card',
    category: 'Gift Card',
    price: 80.00,
    image: '/placeholder.svg',
  },
];

type FilterTab = 'all' | 'subscription' | 'giftcard' | 'gamecredit';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  
  const filteredProducts = sampleProducts.filter((product) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'subscription') return product.category === 'Subscription';
    if (activeTab === 'giftcard') return product.category === 'Gift Card';
    if (activeTab === 'gamecredit') return product.category === 'Game Credit';
    return true;
  });
  
  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'subscription', label: 'Subscriptions' },
    { id: 'giftcard', label: 'Gift Cards' },
    { id: 'gamecredit', label: 'Game Credits' },
  ] as const;
  
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Digital Products</h1>
        <p className="text-gray-600">Browse our collection of digital goods and services</p>
      </div>
      
      <div className="mb-6">
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as FilterTab)}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;
