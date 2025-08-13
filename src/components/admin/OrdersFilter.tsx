
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrdersFilterProps {
  filter: 'all' | 'test' | 'live';
  onFilterChange: (filter: 'all' | 'test' | 'live') => void;
}

export default function OrdersFilter({ filter, onFilterChange }: OrdersFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="environment-filter" className="text-sm font-medium">
        Environment:
      </label>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[120px]" id="environment-filter">
          <SelectValue placeholder="All orders" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="live">Live</SelectItem>
          <SelectItem value="test">Test</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
