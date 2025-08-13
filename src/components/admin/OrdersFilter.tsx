
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type OrderFilter = 'all' | 'live' | 'test';

interface OrdersFilterProps {
  activeFilter: OrderFilter;
  onFilterChange: (filter: OrderFilter) => void;
  orderCounts: {
    total: number;
    live: number;
    test: number;
  };
}

const OrdersFilter: React.FC<OrdersFilterProps> = ({ 
  activeFilter, 
  onFilterChange, 
  orderCounts 
}) => {
  const filters = [
    { 
      key: 'all' as const, 
      label: 'All Orders', 
      count: orderCounts.total,
      variant: 'outline' as const
    },
    { 
      key: 'live' as const, 
      label: 'Live Orders', 
      count: orderCounts.live,
      variant: 'default' as const
    },
    { 
      key: 'test' as const, 
      label: 'Test Orders', 
      count: orderCounts.test,
      variant: 'secondary' as const
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              onClick={() => onFilterChange(filter.key)}
              className="flex items-center gap-2"
            >
              {filter.label}
              <Badge variant={filter.variant} className="ml-1">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersFilter;
