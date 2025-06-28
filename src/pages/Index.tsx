
import { useState } from 'react';
import ProductCard, { type Product } from '@/components/ui/ProductCard';
import MainLayout from '@/components/layout/MainLayout';
import TabGroup from '@/components/ui/TabGroup';
import { useProducts } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type FilterTab = 'all' | 'subscription' | 'giftcard' | 'gamecredit';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading, error } = useProducts(); // Only fetch active products
  
  const filteredProducts = products?.filter((product) => {
    // First filter by category
    let categoryMatch = true;
    if (activeTab === 'subscription') categoryMatch = product.category === 'Subscription';
    else if (activeTab === 'giftcard') categoryMatch = product.category === 'Gift Card';
    else if (activeTab === 'gamecredit') categoryMatch = product.category === 'Game Credit';
    
    // Then filter by search query
    const searchMatch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  }) || [];
  
  const tabs = [
    { id: 'all' as const, label: 'All Products' },
    { id: 'subscription' as const, label: 'Subscriptions' },
    { id: 'giftcard' as const, label: 'Gift Cards' },
    { id: 'gamecredit' as const, label: 'Game Credits' },
  ];
  
  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading products. Please try again later.</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Digital Products</h1>
        <p className="text-gray-600">Browse our collection of digital goods and services</p>
      </div>
      
      <div className="mb-6 overflow-x-auto pb-2">
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as FilterTab)}
          className="min-w-max"
        />
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'No products found matching your search.' : 'No products found in this category.'}
              </p>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default HomePage;
