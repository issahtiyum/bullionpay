
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface OrdersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const OrdersSearch: React.FC<OrdersSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders by product name or status..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersSearch;
